import { Controller, Get, Post, Body, Param, Ip, UseGuards, Query } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { VerificationService } from './verification.service'
import { VerifyDto } from './dto/verify.dto'

@ApiTags('Verification')
@Controller('verification')
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  @Post()
  @ApiOperation({ summary: 'Verify product by tokenId and hash' })
  async verify(@Body() dto: VerifyDto, @Ip() ip: string) {
    return this.verificationService.verify(dto.tokenId, dto.hash, ip)
  }

  @Get('logs')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get verification logs' })
  async getLogs(@Query('productId') productId?: string) {
    return this.verificationService.getLogs(productId)
  }
}
