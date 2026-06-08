import { Controller, Get, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { DashboardService } from './dashboard.service'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
  constructor(private dash: DashboardService) {}

  @Get('umkm')
  @ApiOperation({ summary: 'Get UMKM dashboard stats' })
  getUmkmStats(@Req() req: any) {
    return this.dash.getUmkmStats(req.user.id)
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  getAdminStats() {
    return this.dash.getAdminStats()
  }
}
