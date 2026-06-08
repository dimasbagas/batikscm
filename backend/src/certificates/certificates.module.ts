import { Module, forwardRef } from '@nestjs/common'
import { CertificatesController } from './certificates.controller'
import { CertificatesService } from './certificates.service'
import { QueuesModule } from '../queues/queues.module'

@Module({
  imports: [forwardRef(() => QueuesModule)],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
