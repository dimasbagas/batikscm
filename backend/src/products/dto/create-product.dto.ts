import { IsString, IsDateString, IsOptional, IsNumber } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateProductDto {
  @ApiProperty() @IsString() productName: string
  @ApiPropertyOptional() @IsOptional() @IsString() batikName?: string
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string
  @ApiPropertyOptional() @IsOptional() @IsString() motif?: string
  @ApiProperty() @IsString() originLocation: string
  @ApiPropertyOptional() @IsOptional() @IsString() producerName?: string
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string
  @ApiProperty() @IsDateString() productionDate: string
  @ApiPropertyOptional() @IsOptional() @IsNumber() price?: number
  @ApiPropertyOptional() @IsOptional() @IsNumber() stock?: number
  @ApiPropertyOptional() @IsOptional() @IsString() imageUrl?: string
  @ApiPropertyOptional() @IsOptional() @IsString() detailImageUrl?: string
  @ApiPropertyOptional() @IsOptional() @IsString() distributorId?: string
}
