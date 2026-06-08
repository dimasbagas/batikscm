import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty() @IsEmail() email: string
  @ApiProperty() @IsString() @MinLength(6) password: string
  @ApiProperty() @IsString() name: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() umkmName?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() city?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() province?: string
}

export class LoginDto {
  @ApiProperty() @IsEmail() email: string
  @ApiProperty() @IsString() password: string
}
