import { IsString, IsNumber, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class IssueFabricDto {
  @ApiProperty() @IsString() productName: string
  @ApiProperty() @IsString() producerId: string
  @ApiPropertyOptional() @IsOptional() @IsNumber() quantity?: number
}
