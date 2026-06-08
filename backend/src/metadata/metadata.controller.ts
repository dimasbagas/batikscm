import { Controller, Get, Param, NotFoundException } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { MetadataService } from './metadata.service'

@ApiTags('Metadata')
@Controller('metadata')
export class MetadataController {
  constructor(private meta: MetadataService) {}

  @Get(':tokenId')
  @ApiOperation({ summary: 'Get ERC-721 metadata for tokenURI' })
  async getMetadata(@Param('tokenId') tokenId: string) {
    const meta = await this.meta.getMetadata(tokenId)
    if (!meta) throw new NotFoundException('Metadata not found')
    return meta
  }
}
