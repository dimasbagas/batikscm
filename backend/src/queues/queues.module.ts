import { Module, forwardRef } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { CertificateQueueService } from './certificate-queue.service'
import { CertificateProcessor } from './certificate.processor'
import { CertificatesModule } from '../certificates/certificates.module'

@Module({
  imports: [
    BullModule.registerQueue({ name: 'certificate' }),
    forwardRef(() => CertificatesModule),
  ],
  providers: [CertificateQueueService, CertificateProcessor],
  exports: [CertificateQueueService],
})
export class QueuesModule {}
