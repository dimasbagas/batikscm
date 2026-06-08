import { IsEmail, IsString, MinLength, Matches, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty() @IsEmail() email: string
  @ApiProperty() @IsString() @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { message: 'Password must contain uppercase, lowercase, and number' })
  password: string
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
