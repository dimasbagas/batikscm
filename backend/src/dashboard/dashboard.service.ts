import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getUmkmStats(userId: string) {
    const [totalProducts, totalCertificates, totalScans, verifiedProducts] = await Promise.all([
      this.prisma.product.count({ where: { producerId: userId } }),
      this.prisma.certificate.count({ where: { issuerId: userId } }),
      this.prisma.verificationLog.count({
        where: { product: { producerId: userId } },
      }),
      this.prisma.product.count({ where: { producerId: userId, status: 'VERIFIED' } }),
    ])
    const recentProducts = await this.prisma.product.findMany({
      where: { producerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
    return { totalProducts, totalCertificates, totalScans, verifiedProducts, recentProducts }
  }

  async getAdminStats() {
    const [totalUsers, totalUmkm, totalProducts, totalCertificates, totalVerifications] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'UMKM' } }),
      this.prisma.product.count(),
      this.prisma.certificate.count(),
      this.prisma.verificationLog.count(),
    ])
    const recentProducts = await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { producer: { select: { name: true, umkmName: true } } },
    })
    return { totalUsers, totalUmkm, totalProducts, totalCertificates, totalVerifications, recentProducts }
  }
}
