import { Controller, Get, Post, Body, Param, UseGuards, Req, Res, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { Response } from 'express'
import { CertificatesService } from './certificates.service'
import { CertificateQueueService } from '../queues/certificate-queue.service'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'

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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'VERIFICATOR')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mint certificate (admin/verificator only)' })
  async mint(@Param('productId') productId: string, @Req() req: any) {
    const cert = await this.certs.mint(productId, req.user.id)
    return { message: 'Certificate minted successfully', certificate: cert }
  }

  @Post('record/:productId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'VERIFICATOR')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record minted certificate in database (admin/verificator only)' })
  async record(
    @Param('productId') productId: string,
    @Body() dto: { onChainTokenId: number; transactionHash: string },
    @Req() req: any
  ) {
    const cert = await this.certs.recordOnChain(productId, req.user.id, dto.onChainTokenId, dto.transactionHash)
    return { message: 'Certificate recorded successfully', certificate: cert }
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
