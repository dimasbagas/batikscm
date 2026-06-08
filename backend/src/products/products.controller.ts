import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException, MaxFileSizeValidator, ParseFilePipe, FileTypeValidator } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { R2Service } from '../storage/r2.service'

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private products: ProductsService, private r2: R2Service) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  findAll(@Query() query: any) {
    return this.products.findAll(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID or tokenId' })
  async findOne(@Param('id') id: string) {
    try { return await this.products.findOne(id) } catch {}
    return this.products.findByTokenId(id)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new product' })
  create(@Body() dto: CreateProductDto, @Req() req: any) {
    return this.products.create(dto, req.user.id)
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
    const url = await this.r2.upload(file.buffer, 'products', ext)
    return { url }
  }
}
