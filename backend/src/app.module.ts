import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ProductsModule } from './products/products.module'
import { CertificatesModule } from './certificates/certificates.module'
import { VerificationModule } from './verification/verification.module'
import { DashboardModule } from './dashboard/dashboard.module'
import { MetadataModule } from './metadata/metadata.module'
import { HealthModule } from './health/health.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CertificatesModule,
    VerificationModule,
    DashboardModule,
    MetadataModule,
    HealthModule,
  ],
})
export class AppModule {}
