import { Module } from '@nestjs/common'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'
import { StorageModule } from '../storage/storage.module'
import { CertificatesModule } from '../certificates/certificates.module'

@Module({
  imports: [StorageModule, CertificatesModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
