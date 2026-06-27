import { Injectable, Logger } from '@nestjs/common'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name)
  private client: S3Client
  private bucket: string
  private isLocal = false
  private uploadDir = ''

  constructor() {
    const endpoint = process.env.R2_ENDPOINT
    const accessKey = process.env.R2_ACCESS_KEY
    const secretKey = process.env.R2_SECRET_KEY

    if (!endpoint || !accessKey || !secretKey) {
      this.isLocal = true
      this.uploadDir = path.join(process.cwd(), 'uploads')
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true })
      }
      this.logger.log(`R2 not fully configured. Using local file storage fallback at: ${this.uploadDir}`)
      return
    }

    this.client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    })
    this.bucket = process.env.R2_BUCKET || 'batikchain'
    this.logger.log(`R2 Storage initialized. Endpoint: ${endpoint}, Bucket: ${this.bucket}`)
  }

  async upload(buffer: Buffer, folder: string, ext: string, mimeType?: string): Promise<string> {
    const filename = `${crypto.randomUUID()}${ext}`

    if (this.isLocal) {
      const folderPath = path.join(this.uploadDir, folder)
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
      }
      const filePath = path.join(folderPath, filename)
      fs.writeFileSync(filePath, buffer)

      const port = process.env.PORT || 3000
      return `http://localhost:${port}/api/v1/products/image/${folder}/${filename}`
    }

    const key = `${folder}/${filename}`
    const command: any = { Bucket: this.bucket, Key: key, Body: buffer }
    if (mimeType) command.ContentType = mimeType
    await this.client.send(new PutObjectCommand(command))
    return `${process.env.R2_ENDPOINT}/${this.bucket}/${key}`
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    if (this.isLocal) {
      const port = process.env.PORT || 3000
      return `http://localhost:${port}/api/v1/products/image/${key}`
    }
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), { expiresIn })
  }
}
