import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException, MaxFileSizeValidator, ParseFilePipe, FileTypeValidator, Res, NotFoundException, Ip } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { IssueFabricDto } from './dto/issue-fabric.dto'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { R2Service } from '../storage/r2.service'
import { CertificatesService } from '../certificates/certificates.service'
import * as path from 'path'
import * as fs from 'fs'

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private products: ProductsService,
    private r2: R2Service,
    private certs: CertificatesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  findAll(@Query() query: any) {
    return this.products.findAll(query)
  }

  @Get('image/:folder/:filename')
  @ApiOperation({ summary: 'Serve uploaded product image' })
  serveImage(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: any,
  ) {
    const filePath = path.join(process.cwd(), 'uploads', folder, filename)
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Image not found')
    }
    res.sendFile(filePath)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID or tokenId' })
  async findOne(@Param('id') id: string, @Ip() ip: string) {
    try { return await this.products.findOne(id, ip) } catch (e: any) {
      if (e.status !== 404) throw e
    }
    return this.products.findByTokenId(id, ip)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new product' })
  async create(@Body() dto: CreateProductDto, @Req() req: any) {
    const product = await this.products.create(dto, req.user.id)
    if (req.user.role === 'ADMIN' || req.user.role === 'VERIFICATOR') {
      try {
        await this.certs.mint(product.id, req.user.id)
      } catch (e) {
        // Keep it registered locally even if blockchain fails
      }
    }
    return this.products.findOne(product.id)
  }

  @Post(':id/distribute')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('DISTRIBUTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Distribute a product (distributor only)' })
  async distribute(
    @Param('id') id: string,
    @Body() dto: { imageUrl: string; distributorName: string },
    @Req() req: any
  ) {
    return this.products.distribute(id, dto.imageUrl, req.user.id, dto.distributorName)
  }

  @Post(':id/receive')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm receipt of a distributed product' })
  async receive(
    @Param('id') id: string,
    @Req() req: any
  ) {
    return this.products.receive(id, req.user.id, req.user.umkmName || req.user.name)
  }

  @Post('issue-fabric')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('DISTRIBUTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Issue fabric to artisan (distributor only)' })
  async issueFabric(@Body() dto: IssueFabricDto, @Req() req: any) {
    return this.products.issueFabric(dto, req.user.id)
  }

  @Post(':id/complete-work')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('PENGRAJIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm artisan work completion (artisan only)' })
  async completeWork(@Param('id') id: string, @Req() req: any) {
    return this.products.completeArtisanWork(id, req.user.id)
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>, @Req() req: any) {
    return this.products.update(id, dto, req.user.id)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.products.remove(id, req.user.id)
  }

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload product image' })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^(image\/jpeg|image\/png|image\/webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const ext = file.originalname.match(/\.\w+$/)?.[0] || '.jpg'
    const url = await this.r2.upload(file.buffer, 'products', ext, file.mimetype)
    return { url }
  }
}
