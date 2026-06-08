import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ProductsModule } from './products/products.module'
import { CertificatesModule } from './certificates/certificates.module'
import { VerificationModule } from './verification/verification.module'
import { DashboardModule } from './dashboard/dashboard.module'
import { MetadataModule } from './metadata/metadata.module'
import { HealthModule } from './health/health.module'
import { BullModule } from '@nestjs/bullmq'
import { QueuesModule } from './queues/queues.module'
import { StorageModule } from './storage/storage.module'

@Module({
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    BullModule.forRoot({
      connection: { host: process.env.REDIS_HOST || 'localhost', port: Number(process.env.REDIS_PORT) || 6379 },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CertificatesModule,
    VerificationModule,
    DashboardModule,
    MetadataModule,
    HealthModule,
    StorageModule,
    QueuesModule,
  ],
})
export class AppModule {}
