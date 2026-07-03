import { IsEmail, IsString, MinLength, Matches, IsOptional, IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Role } from '@prisma/client'

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
  @ApiProperty({ required: false, enum: Role }) @IsOptional() @IsEnum(Role) role?: Role
  @ApiProperty({ required: false }) @IsOptional() @IsString() distributorId?: string
}

export class LoginDto {
  @ApiProperty() @IsEmail() email: string
  @ApiProperty() @IsString() password: string
}
