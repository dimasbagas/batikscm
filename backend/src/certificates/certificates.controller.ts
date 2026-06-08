import { Controller, Get, Post, Param, UseGuards, Req, Res, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { Response } from 'express'
import { CertificatesService } from './certificates.service'
import { CertificateQueueService } from '../queues/certificate-queue.service'

@ApiTags('Certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private certs: CertificatesService, private certQueue: CertificateQueueService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all certificates' })
  findAll(@Req() req: any) {
    return this.certs.findAll({ issuerId: req.user.id })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get certificate by ID' })
  findOne(@Param('id') id: string) {
    return this.certs.findOne(id)
  }

  @Post('mint/:productId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Queue certificate minting' })
  async mint(@Param('productId') productId: string, @Req() req: any) {
    const job = await this.certQueue.addMintJob(productId, req.user.id)
    return { message: 'Minting queued', jobId: job.id }
  }

  @Get(':id/qr')
  @ApiOperation({ summary: 'Get QR code data URL' })
  async getQr(@Param('id') id: string, @Res() res: Response) {
    const dataUrl = await this.certs.getQrDataUrl(id)
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '')
    const buffer = Buffer.from(base64, 'base64')
    res.set({ 'Content-Type': 'image/png', 'Content-Disposition': `attachment; filename="certificate-${id}.png"` })
    res.send(buffer)
  }
}
