import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'

@Injectable()
export class CertificateQueueService {
  constructor(@InjectQueue('certificate') private certQueue: Queue) {}

  async addMintJob(productId: string, issuerId: string) {
    return this.certQueue.add('mint', { productId, issuerId }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } })
  }
}
