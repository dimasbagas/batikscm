import { Controller, Get, Patch, Param, Body, UseGuards, Req, ForbiddenException } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { UsersService } from './users.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'VERIFICATOR')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  findAll() {
    return this.users.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string, @Req() req: any) {
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Cannot access other user data')
    }
    return this.users.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  async update(@Param('id') id: string, @Body() body: UpdateUserDto, @Req() req: any) {
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Cannot modify other user data')
    }
    if (body.role && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can change roles')
    }
    return this.users.update(id, body)
  }
}
