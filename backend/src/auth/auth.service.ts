import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import * as crypto from 'crypto'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto, LoginDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (exists) throw new ConflictException('Email sudah terdaftar')

    const hashed = await argon2.hash(dto.password)
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name,
        umkmName: dto.umkmName,
        phone: dto.phone,
        city: dto.city,
        province: dto.province,
        role: 'UMKM',
      },
    })

    const tokens = await this.generateTokens(user.id, user.email, user.role)
    return { user: this.sanitize(user), ...tokens }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (!user) throw new UnauthorizedException('Email atau password salah')

    const valid = await argon2.verify(user.password, dto.password)
    if (!valid) throw new UnauthorizedException('Email atau password salah')

    const tokens = await this.generateTokens(user.id, user.email, user.role)
    return { user: this.sanitize(user), ...tokens }
  }

  private async generateTokens(sub: string, email: string, role: string) {
    const payload = { sub, email, role }
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    }
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) return { message: 'Jika email terdaftar, link reset akan dikirim' }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExp = new Date(Date.now() + 3600000)

    await this.prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExp },
    })

    // In production: send email with reset link
    const resetLink = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/reset-password?token=${resetToken}`
    console.log(`[Password Reset] Link: ${resetLink}`)

    return { message: 'Jika email terdaftar, link reset akan dikirim' }
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: { resetToken: token, resetTokenExp: { gte: new Date() } },
    })
    if (!user) throw new BadRequestException('Token tidak valid atau sudah kadaluarsa')

    const hashed = await argon2.hash(newPassword)
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExp: null },
    })

    return { message: 'Password berhasil direset' }
  }

  async googleLogin(profile: { email: string; name: string; avatar?: string }) {
    let user = await this.prisma.user.findUnique({ where: { email: profile.email } })
    if (!user) {
      user = await this.prisma.user.create({
        data: { email: profile.email, name: profile.name, avatar: profile.avatar, password: '', role: 'UMKM' },
      })
    }
    const tokens = await this.generateTokens(user.id, user.email, user.role)
    return { user: this.sanitize(user), ...tokens }
  }

  private sanitize(user: any) {
    const { password, ...rest } = user
    return rest
  }
}
