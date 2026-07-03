import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProductDto } from './dto/create-product.dto'
import { IssueFabricDto } from './dto/issue-fabric.dto'
import { BlockchainService } from '../blockchain/blockchain.service'
import * as crypto from 'crypto'

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
  ) {}

  async findAll(query?: { status?: string; search?: string; producerId?: string }) {
    const where: any = {}
    if (query?.status) where.status = query.status
    if (query?.producerId) where.producerId = query.producerId
    if (query?.search) {
      where.OR = [
        { productName: { contains: query.search, mode: 'insensitive' } },
        { tokenId: { contains: query.search, mode: 'insensitive' } },
      ]
    }
    return this.prisma.product.findMany({
      where,
      include: { producer: { select: { id: true, name: true, umkmName: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { producer: { select: { id: true, name: true, umkmName: true } }, certificate: true },
    })
    if (!product) throw new NotFoundException('Product not found')
    return product
  }

  async findByTokenId(tokenId: string) {
    const product = await this.prisma.product.findUnique({
      where: { tokenId },
      include: { certificate: true },
    })
    if (!product) throw new NotFoundException('Product not found')
    return product
  }

  async create(dto: CreateProductDto, userId: string) {
    const count = await this.prisma.product.count()
    const tokenId = `BC-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`
    const imageUrl = dto.imageUrl || ''
    const raw = `${dto.productName}|${dto.originLocation}|${dto.productionDate}|${imageUrl}|${tokenId}`
    const metadataHash = crypto.createHash('sha256').update(raw).digest('hex')

    let distributorId = dto.distributorId || null
    let distributorName: string | null = null

    const producer = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!distributorId && producer?.distributorId) {
      distributorId = producer.distributorId
    }

    if (distributorId && distributorId !== '') {
      const dist = await this.prisma.user.findUnique({ where: { id: distributorId } })
      distributorName = dist?.umkmName || dist?.name || null
    }

    // 1. Create locally in DB
    const product = await this.prisma.product.create({
      data: {
        productName: dto.productName,
        batikName: dto.batikName,
        category: dto.category,
        motif: dto.motif,
        originLocation: dto.originLocation,
        producerName: dto.producerName,
        description: dto.description,
        productionDate: new Date(dto.productionDate),
        price: dto.price,
        stock: dto.stock,
        imageUrl: dto.imageUrl || null,
        detailImageUrl: dto.detailImageUrl,
        distributorId: distributorId,
        distributorName: distributorName,
        tokenId,
        metadataHash,
        producerId: userId,
      },
      include: { producer: { select: { id: true, name: true, umkmName: true } } },
    })

    // 2. Register on-chain immediately
    let onChainTokenId = ''
    let regTxHash = ''
    if (this.blockchainService.isConfigured()) {
      try {
        const regResult = await this.blockchainService.registerProduct(
          product.productName,
          product.producerName || product.producer.name || '',
          product.originLocation,
          metadataHash,
          imageUrl,
        )
        onChainTokenId = String(regResult.onChainTokenId)
        regTxHash = regResult.txHash

        // Update DB with blockchain info
        await this.prisma.product.update({
          where: { id: product.id },
          data: {
            onChainTokenId,
            transactionHash: regTxHash,
          },
        })
      } catch (error) {
        console.error('Failed to register product on-chain during creation:', error)
      }
    } else {
      // Simulate on-chain token and tx hash for dev environments
      onChainTokenId = String(Math.floor(Math.random() * 1000) + 1)
      regTxHash = '0x' + crypto.randomBytes(32).toString('hex')
      await this.prisma.product.update({
        where: { id: product.id },
        data: {
          onChainTokenId,
          transactionHash: regTxHash,
        },
      })
    }

    return this.findOne(product.id)
  }

  async distribute(id: string, imageUrl: string, distributorId: string, distributorName: string) {
    const product = await this.prisma.product.findUnique({ where: { id } })
    if (!product) throw new NotFoundException('Product not found')
    if (product.status !== 'REGISTERED') throw new BadRequestException('Batik must be in REGISTERED status to distribute')

    // Calculate new metadata hash incorporating image and distributor
    const raw = `${product.productName}|${product.originLocation}|${product.productionDate.toISOString()}|${imageUrl}|${product.tokenId}|${distributorName}`
    const newMetadataHash = crypto.createHash('sha256').update(raw).digest('hex')

    let distributorTxHash = ''
    if (this.blockchainService.isConfigured() && product.onChainTokenId) {
      try {
        const distResult = await this.blockchainService.distributeProduct(
          Number(product.onChainTokenId),
          imageUrl,
          distributorName,
          newMetadataHash,
        )
        distributorTxHash = distResult.txHash
      } catch (error) {
        console.error('Failed to distribute product on-chain:', error)
      }
    } else {
      distributorTxHash = '0x' + crypto.randomBytes(32).toString('hex')
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        imageUrl,
        distributorId,
        distributorName,
        distributedAt: new Date(),
        distributorTxHash,
        status: 'DISTRIBUTED',
        metadataHash: newMetadataHash,
      },
      include: { producer: { select: { id: true, name: true, umkmName: true } } },
    })
  }

  async receive(idOrTokenId: string, recipientId: string, recipientName: string) {
    let product = await this.prisma.product.findUnique({ where: { id: idOrTokenId } })
    if (!product) {
      product = await this.prisma.product.findUnique({ where: { tokenId: idOrTokenId } })
    }
    if (!product) throw new NotFoundException('Produk tidak ditemukan')
    if (product.status !== 'DISTRIBUTED') {
      throw new BadRequestException('Produk harus berada dalam status DISTRIBUTED untuk dapat diterima')
    }

    return this.prisma.product.update({
      where: { id: product.id },
      data: {
        status: 'RECEIVED',
        receivedAt: new Date(),
        recipientId,
        recipientName,
      },
      include: { producer: { select: { id: true, name: true, umkmName: true } } },
    })
  }

  async issueFabric(dto: IssueFabricDto, distributorId: string) {
    const qty = dto.quantity || 1
    const createdProducts: any[] = []

    const distributor = await this.prisma.user.findUnique({ where: { id: distributorId } })
    const distributorName = distributor?.umkmName || distributor?.name || 'Distributor'

    const producer = await this.prisma.user.findUnique({ where: { id: dto.producerId } })
    if (!producer) throw new NotFoundException('Pengrajin tidak ditemukan')
    const producerName = producer.umkmName || producer.name
    const originLocation = producer.city ? `${producer.city}, ${producer.province || ''}` : 'Indonesia'

    for (let i = 0; i < qty; i++) {
      const count = await this.prisma.product.count()
      const tokenId = `BC-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`
      
      const productionDate = new Date()
      const raw = `${dto.productName}|${originLocation}|${productionDate.toISOString()}||${tokenId}`
      const metadataHash = crypto.createHash('sha256').update(raw).digest('hex')

      const product = await this.prisma.product.create({
        data: {
          productName: dto.productName,
          originLocation,
          producerName,
          productionDate,
          status: 'FABRIC_ISSUED',
          distributorId,
          distributorName,
          tokenId,
          metadataHash,
          producerId: dto.producerId,
        },
      })
      createdProducts.push(product)
    }

    return createdProducts
  }

  async completeArtisanWork(idOrTokenId: string, artisanId: string) {
    let product = await this.prisma.product.findUnique({ where: { id: idOrTokenId } })
    if (!product) {
      product = await this.prisma.product.findUnique({ where: { tokenId: idOrTokenId } })
    }
    if (!product) throw new NotFoundException('Produk tidak ditemukan')

    if (product.producerId !== artisanId) {
      throw new ForbiddenException('Kain mentah ini tidak ditugaskan kepada Anda')
    }

    if (product.status !== 'FABRIC_ISSUED') {
      throw new BadRequestException('Produk harus berada dalam status FABRIC_ISSUED untuk dapat diselesaikan')
    }

    // Update status to REGISTERED
    const updatedProduct = await this.prisma.product.update({
      where: { id: product.id },
      data: {
        status: 'REGISTERED',
        productionDate: new Date(), // Set production date to when they finished it
      },
      include: { producer: { select: { id: true, name: true, umkmName: true } } },
    })

    // Now register on-chain!
    let onChainTokenId = ''
    let regTxHash = ''
    const imageUrl = updatedProduct.imageUrl || ''
    
    // Recalculate metadata hash with updated production date
    const raw = `${updatedProduct.productName}|${updatedProduct.originLocation}|${updatedProduct.productionDate.toISOString()}|${imageUrl}|${updatedProduct.tokenId}`
    const metadataHash = crypto.createHash('sha256').update(raw).digest('hex')

    await this.prisma.product.update({
      where: { id: updatedProduct.id },
      data: { metadataHash },
    })

    if (this.blockchainService.isConfigured()) {
      try {
        const regResult = await this.blockchainService.registerProduct(
          updatedProduct.productName,
          updatedProduct.producerName || updatedProduct.producer.name || '',
          updatedProduct.originLocation,
          metadataHash,
          imageUrl,
        )
        onChainTokenId = String(regResult.onChainTokenId)
        regTxHash = regResult.txHash

        await this.prisma.product.update({
          where: { id: updatedProduct.id },
          data: {
            onChainTokenId,
            transactionHash: regTxHash,
          },
        })
      } catch (error) {
        console.error('Failed to register product on-chain during artisan completion:', error)
      }
    } else {
      // Simulate on-chain token and tx hash for dev environments
      onChainTokenId = String(Math.floor(Math.random() * 1000) + 1)
      regTxHash = '0x' + crypto.randomBytes(32).toString('hex')
      await this.prisma.product.update({
        where: { id: updatedProduct.id },
        data: {
          onChainTokenId,
          transactionHash: regTxHash,
        },
      })
    }

    return this.findOne(updatedProduct.id)
  }

  async update(id: string, dto: Partial<CreateProductDto>, userId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } })
    if (!product) throw new NotFoundException('Product not found')
    if (product.producerId !== userId) throw new ForbiddenException('Not your product')

    return this.prisma.product.update({
      where: { id },
      data: { ...dto, producerName: dto.producerName || undefined, productionDate: dto.productionDate ? new Date(dto.productionDate) : undefined },
      include: { producer: { select: { id: true, name: true, umkmName: true } } },
    })
  }

  async remove(id: string, userId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } })
    if (!product) throw new NotFoundException('Product not found')
    if (product.producerId !== userId) throw new ForbiddenException('Not your product')

    await this.prisma.product.delete({ where: { id } })
    return { message: 'Product deleted' }
  }
}
