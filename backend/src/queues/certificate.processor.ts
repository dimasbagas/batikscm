import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { CertificatesService } from '../certificates/certificates.service'

@Processor('certificate')
export class CertificateProcessor extends WorkerHost {
  constructor(private certs: CertificatesService) {
    super()
  }

  async process(job: Job<{ productId: string; issuerId: string }>) {
    const { productId, issuerId } = job.data
    await this.certs.mint(productId, issuerId)
  }
}
