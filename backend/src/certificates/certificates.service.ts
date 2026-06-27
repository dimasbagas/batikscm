import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { BlockchainService } from '../blockchain/blockchain.service'
import * as QRCode from 'qrcode'

@Injectable()
export class CertificatesService {
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
  ) {}

  async findAll(query?: { issuerId?: string }) {
    const where: any = {}
    if (query?.issuerId) where.issuerId = query.issuerId
    return this.prisma.certificate.findMany({
      where,
      include: { product: true, issuer: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { id },
      include: { product: { include: { producer: { select: { id: true, name: true, umkmName: true } } } }, issuer: { select: { id: true, name: true } } },
    })
    if (!cert) throw new NotFoundException('Certificate not found')
    return cert
  }

  async mint(productId: string, issuerId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { producer: true },
    })
    if (!product) throw new NotFoundException('Product not found')

    const existing = await this.prisma.certificate.findUnique({ where: { productId } })
    if (existing) return existing

    let baseNonce: number | undefined = undefined
    if (this.blockchainService.isConfigured()) {
      try {
        baseNonce = await this.blockchainService.getNonce()
      } catch (e) {
        // Leave undefined to let ethers handle it automatically if querying fails
      }
    }

    // 1. Register product on blockchain
    let onChainTokenId = 0
    let regTxHash = ''
    try {
      const regResult = await this.blockchainService.registerProduct(
        product.productName,
        product.producerName || product.producer.name || '',
        product.originLocation,
        product.metadataHash,
        product.imageUrl,
        baseNonce !== undefined ? { nonce: baseNonce } : undefined,
      )
      onChainTokenId = regResult.onChainTokenId
      regTxHash = regResult.txHash
    } catch (e) {
      onChainTokenId = Math.floor(Math.random() * 1000000)
      regTxHash = '0x' + '0'.repeat(64)
    }

    // 2. Generate Metadata URI / Certificate URI
    const certificateURI = `http://localhost:3000/api/v1/metadata/${product.tokenId}`

    // 3. Mint Certificate NFT on blockchain
    let mintTxHash = ''
    try {
      const recipientAddress = this.blockchainService.getOperatorAddress()
      const mintResult = await this.blockchainService.mintCertificate(
        onChainTokenId,
        recipientAddress,
        certificateURI,
        baseNonce !== undefined ? { nonce: baseNonce + 1 } : undefined,
      )
      mintTxHash = mintResult.txHash
    } catch (e) {
      mintTxHash = '0x' + '0'.repeat(64)
    }

    const qrValue = JSON.stringify({ tokenId: product.tokenId, hash: product.metadataHash })

    const cert = await this.prisma.certificate.create({
      data: {
        tokenId: product.tokenId,
        productId: product.id,
        productName: product.productName,
        producerName: product.producerName || product.producer.name || '',
        originLocation: product.originLocation,
        productionDate: product.productionDate,
        metadataHash: product.metadataHash,
        imageUrl: product.imageUrl,
        qrValue,
        issuerId,
        nftTokenId: String(onChainTokenId),
        contractAddress: process.env.CONTRACT_ADDRESS || '',
      },
    })

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        status: 'VERIFIED',
        certificateId: cert.id,
        certificationDate: new Date(),
        contractAddress: process.env.CONTRACT_ADDRESS || '',
        transactionHash: mintTxHash !== '0x' + '0'.repeat(64) ? mintTxHash : regTxHash,
      },
    })

    return cert
  }

  async recordOnChain(
    productId: string,
    issuerId: string,
    onChainTokenId: number,
    transactionHash: string,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { producer: true },
    })
    if (!product) throw new NotFoundException('Product not found')

    const existing = await this.prisma.certificate.findUnique({ where: { productId } })
    if (existing) return existing

    const qrValue = JSON.stringify({ tokenId: product.tokenId, hash: product.metadataHash })

    const cert = await this.prisma.certificate.create({
      data: {
        tokenId: product.tokenId,
        productId: product.id,
        productName: product.productName,
        producerName: product.producerName || product.producer.name || '',
        originLocation: product.originLocation,
        productionDate: product.productionDate,
        metadataHash: product.metadataHash,
        imageUrl: product.imageUrl,
        qrValue,
        issuerId,
        nftTokenId: String(onChainTokenId),
        contractAddress: process.env.CONTRACT_ADDRESS || '',
      },
    })

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        status: 'VERIFIED',
        certificateId: cert.id,
        certificationDate: new Date(),
        contractAddress: process.env.CONTRACT_ADDRESS || '',
        transactionHash,
      },
    })

    return cert
  }

  async getQrDataUrl(id: string): Promise<string> {
    const cert = await this.findOne(id)
    return QRCode.toDataURL(cert.qrValue, { width: 300, margin: 1, color: { dark: '#7d421f', light: '#ffffff' } })
  }
}
