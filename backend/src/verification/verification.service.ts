import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class VerificationService {
  constructor(private prisma: PrismaService) {}

  async verify(tokenId: string, hashInput: string, ip?: string) {
    const product = await this.prisma.product.findUnique({ where: { tokenId } })
    if (!product) {
      return { valid: false, message: 'Produk Tidak Terverifikasi atau Diduga Palsu', timestamp: new Date().toISOString() }
    }

    const isValid = product.metadataHash === hashInput

    await this.prisma.verificationLog.create({
      data: {
        tokenId,
        hashInput,
        isValid,
        message: isValid ? 'Authentic' : 'Hash mismatch',
        verifierIp: ip,
        productId: product.id,
      },
    })

    return {
      valid: isValid,
      message: isValid ? 'Produk Asli — Terverifikasi di Blockchain' : 'Produk Tidak Terverifikasi atau Diduga Palsu',
      product: {
        id: product.id,
        tokenId: product.tokenId,
        productName: product.productName,
        producerName: product.producerName || '',
        originLocation: product.originLocation,
        productionDate: product.productionDate,
        imageUrl: product.imageUrl,
        metadataHash: product.metadataHash,
        certificationDate: product.certificationDate,
        status: product.status,
      },
      timestamp: new Date().toISOString(),
    }
  }

  async getLogs(productId?: string) {
    const where: any = {}
    if (productId) where.productId = productId
    return this.prisma.verificationLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }
}
