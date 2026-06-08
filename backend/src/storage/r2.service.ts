import { Injectable } from '@nestjs/common'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import * as crypto from 'crypto'

@Injectable()
export class R2Service {
  private client: S3Client
  private bucket: string

  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT || '',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY || '',
        secretAccessKey: process.env.R2_SECRET_KEY || '',
      },
    })
    this.bucket = process.env.R2_BUCKET || 'batikchain'
  }

  async upload(buffer: Buffer, folder: string, ext: string, mimeType?: string): Promise<string> {
    const key = `${folder}/${crypto.randomUUID()}${ext}`
    const command: any = { Bucket: this.bucket, Key: key, Body: buffer }
    if (mimeType) command.ContentType = mimeType
    await this.client.send(new PutObjectCommand(command))
    return `${process.env.R2_ENDPOINT}/${this.bucket}/${key}`
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), { expiresIn })
  }
}
