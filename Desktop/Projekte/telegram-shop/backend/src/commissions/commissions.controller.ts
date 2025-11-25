import {
  Controller,
  Get,
  Param,
  UseGuards,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('api/commissions')
@UseGuards(JwtAuthGuard)
export class CommissionsController {
  constructor(private commissionsService: CommissionsService) {}

  // Daily Revenue
  @Get('revenue/daily')
  async getDailyRevenue(@Req() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can access this');
    }
    return this.commissionsService.getDailyRevenue(new Date());
  }

  // Weekly Revenue
  @Get('revenue/weekly')
  async getWeeklyRevenue(@Req() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can access this');
    }
    return this.commissionsService.getWeeklyRevenue(new Date());
  }

  // Monthly Revenue
  @Get('revenue/monthly/:year/:month')
  async getMonthlyRevenue(
    @Param('year') year: string,
    @Param('month') month: string,
    @Req() req: any
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can access this');
    }
    return this.commissionsService.getMonthlyRevenue(parseInt(year), parseInt(month));
  }

  // Yearly Revenue
  @Get('revenue/yearly/:year')
  async getYearlyRevenue(@Param('year') year: string, @Req() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can access this');
    }
    return this.commissionsService.getYearlyRevenue(parseInt(year));
  }
}