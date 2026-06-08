import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, umkmName: true, city: true, province: true, isActive: true, createdAt: true },
    })
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, umkmName: true, phone: true, city: true, province: true, isActive: true, createdAt: true },
    })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async update(id: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User not found')
    return this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        umkmName: data.umkmName,
        phone: data.phone,
        city: data.city,
        province: data.province,
      },
      select: { id: true, email: true, name: true, role: true, umkmName: true, phone: true, city: true, province: true },
    })
  }
}
