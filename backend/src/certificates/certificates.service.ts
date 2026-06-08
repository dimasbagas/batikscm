import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import * as QRCode from 'qrcode'

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

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

    const qrValue = JSON.stringify({ tokenId: product.tokenId, hash: product.metadataHash })

    const existing = await this.prisma.certificate.findUnique({ where: { productId } })
    if (existing) return existing

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
      },
    })

    await this.prisma.product.update({
      where: { id: productId },
      data: { status: 'VERIFIED', certificateId: cert.id, certificationDate: new Date() },
    })

    return cert
  }

  async getQrDataUrl(id: string): Promise<string> {
    const cert = await this.findOne(id)
    return QRCode.toDataURL(cert.qrValue, { width: 300, margin: 1, color: { dark: '#7d421f', light: '#ffffff' } })
  }
}
