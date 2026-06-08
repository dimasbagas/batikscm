import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProductDto } from './dto/create-product.dto'
import * as crypto from 'crypto'

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

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
    const raw = `${dto.productName}|${dto.originLocation}|${dto.productionDate}|${dto.imageUrl}|${tokenId}`
    const metadataHash = crypto.createHash('sha256').update(raw).digest('hex')

    return this.prisma.product.create({
      data: {
        ...dto,
        productionDate: new Date(dto.productionDate),
        tokenId,
        metadataHash,
        producerId: userId,
      },
      include: { producer: { select: { id: true, name: true, umkmName: true } } },
    })
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
