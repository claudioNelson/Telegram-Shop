import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommissionsService {
  constructor(private prisma: PrismaService) {}

  async createCommissionForOrder(
    orderId: number,
    shopId: number,
    orderAmountCents: number,
    commissionPercent: number = 5.0,
  ) {
    const commissionAmount = Math.round(orderAmountCents * (commissionPercent / 100));

    return (this.prisma as any).commission.create({
      data: {
        orderId,
        shopId,
        orderAmountCents,
        commissionPercent,
        commissionAmount,
        status: 'PENDING',
      },
    });
  }

  async getAllCommissions() {
    return (this.prisma as any).commission.findMany({
      include: {
        order: true,
        shop: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCommissionsByShop(shopId: number) {
    return (this.prisma as any).commission.findMany({
      where: { shopId },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTotalRevenueBetween(startDate: Date, endDate: Date) {
    const commissions = await (this.prisma as any).commission.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'PENDING',
      },
    });

    const total = commissions.reduce(
      (sum, commission) => sum + commission.commissionAmount,
      0,
    );

    return {
      totalCents: total,
      totalEur: (total / 100).toFixed(2),
      count: commissions.length,
    };
  }

  async getDailyRevenue(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getTotalRevenueBetween(startOfDay, endOfDay);
  }

  async getWeeklyRevenue(date: Date) {
    const currentDate = new Date(date);
    const first = currentDate.getDate() - currentDate.getDay();
    const startOfWeek = new Date(currentDate.setDate(first));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return this.getTotalRevenueBetween(startOfWeek, endOfWeek);
  }

  async getMonthlyRevenue(year: number, month: number) {
    const startOfMonth = new Date(year, month - 1, 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(year, month, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    return this.getTotalRevenueBetween(startOfMonth, endOfMonth);
  }

  async getYearlyRevenue(year: number) {
    const startOfYear = new Date(year, 0, 1);
    startOfYear.setHours(0, 0, 0, 0);

    const endOfYear = new Date(year, 11, 31);
    endOfYear.setHours(23, 59, 59, 999);

    return this.getTotalRevenueBetween(startOfYear, endOfYear);
  }

  async markCommissionAsPaid(commissionId: number) {
    return (this.prisma as any).commission.update({
      where: { id: commissionId },
      data: { status: 'PAID' },
    });
  }

  async getShopRevenueBetween(
    shopId: number,
    startDate: Date,
    endDate: Date,
  ) {
    const commissions = await (this.prisma as any).commission.findMany({
      where: {
        shopId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const total = commissions.reduce(
      (sum, commission) => sum + commission.commissionAmount,
      0,
    );

    return {
      shopId,
      totalCents: total,
      totalEur: (total / 100).toFixed(2),
      count: commissions.length,
    };
  }
}