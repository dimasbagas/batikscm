import { IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class VerifyDto {
  @ApiProperty() @IsString() tokenId: string
  @ApiProperty() @IsString() hash: string
}
