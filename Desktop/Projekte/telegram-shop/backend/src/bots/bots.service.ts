// src/bots/bots.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BotsService {
  constructor(private prisma: PrismaService) {}

  async createBot(shopId: number, userId: number, data: any) {
    // Prüfe ob User der Shop-Owner ist
    const shop = await (this.prisma as any).shop.findUnique({
      where: { id: shopId },
    });

    if (!shop || shop.ownerUserId !== userId) {
      throw new ForbiddenException('You can only add bots to your own shop');
    }

    return (this.prisma as any).bot.create({
      data: {
        ...data,
        shopId,
      },
    });
  }

  async getBotByShop(shopId: number) {
    return (this.prisma as any).bot.findFirst({
      where: { shopId },
    });
  }

  async updateBot(botId: number, userId: number, data: any) {
    const bot = await (this.prisma as any).bot.findUnique({
      where: { id: botId },
    });

    if (!bot) {
      throw new NotFoundException('Bot not found');
    }

    const shop = await (this.prisma as any).shop.findUnique({
      where: { id: bot.shopId },
    });

    if (!shop || shop.ownerUserId !== userId) {
      throw new ForbiddenException('You can only update your own bot');
    }

    return (this.prisma as any).bot.update({
      where: { id: botId },
      data,
    });
  }
}