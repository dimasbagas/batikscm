import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
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

  private sanitize(user: any) {
    const { password, ...rest } = user
    return rest
  }
}
