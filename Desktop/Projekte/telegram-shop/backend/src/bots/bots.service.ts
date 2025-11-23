import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class BotsService {
  constructor(
    private prisma: PrismaService,
    private telegramService: TelegramService,
  ) {}

  /**
   * Erstelle einen neuen Bot für den Shop
   * Bot wird sofort initialisiert!
   */
  async createBot(shopId: number, userId: number, data: any) {
    // Prüfe ob User der Shop-Owner ist
    const shop = await (this.prisma as any).shop.findUnique({
      where: { id: shopId },
    });

    if (!shop || shop.ownerUserId !== userId) {
      throw new ForbiddenException('You can only add bots to your own shop');
    }

    // Validiere dass Telegram Token vorhanden ist
    if (!data.telegramBotToken) {
      throw new BadRequestException('telegramBotToken is required');
    }

    // Validiere dass Bot-Name vorhanden ist
    if (!data.name) {
      throw new BadRequestException('Bot name is required');
    }

    // Erstelle Bot in DB
    const bot = await (this.prisma as any).bot.create({
      data: {
        name: data.name,
        telegramBotToken: data.telegramBotToken,
        telegramBotUsername: data.telegramBotUsername || '',
        welcomeMessage: data.welcomeMessage || `Willkommen in ${data.name}! 👋`,
        shopId,
        isActive: true,
      },
    });

    // NEU: Initialisiere Bot zur Laufzeit
    try {
      await this.telegramService.initBotDynamic(bot);
      console.log(`✅ Bot erstellt und gestartet: ${bot.name}`);
    } catch (error) {
      console.error(`❌ Bot-Start fehlgeschlagen:`, error);
      // Deaktiviere Bot wenn Start fehlschlägt
      await (this.prisma as any).bot.update({
        where: { id: bot.id },
        data: { isActive: false },
      });
      throw new BadRequestException('Invalid Telegram bot token or bot initialization failed');
    }

    return bot;
  }

  /**
   * Hole alle Bots für einen Shop
   */
  async getBotsByShop(shopId: number) {
    return (this.prisma as any).bot.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Hole einen einzelnen Bot
   */
  async getBotById(botId: number) {
    const bot = await (this.prisma as any).bot.findUnique({
      where: { id: botId },
    });

    if (!bot) {
      throw new NotFoundException('Bot not found');
    }

    return bot;
  }

  /**
   * Update einen Bot
   */
  async updateBot(botId: number, userId: number, data: any) {
    const bot = await this.getBotById(botId);

    // Prüfe Berechtigung
    const shop = await (this.prisma as any).shop.findUnique({
      where: { id: bot.shopId },
    });

    if (!shop || shop.ownerUserId !== userId) {
      throw new ForbiddenException('You can only update your own bots');
    }

    return (this.prisma as any).bot.update({
      where: { id: botId },
      data: {
        name: data.name || bot.name,
        welcomeMessage: data.welcomeMessage || bot.welcomeMessage,
        telegramBotUsername: data.telegramBotUsername || bot.telegramBotUsername,
        isActive: data.isActive !== undefined ? data.isActive : bot.isActive,
      },
    });
  }

  /**
   * Lösche einen Bot
   */
  async deleteBot(botId: number, userId: number) {
    const bot = await this.getBotById(botId);

    // Prüfe Berechtigung
    const shop = await (this.prisma as any).shop.findUnique({
      where: { id: bot.shopId },
    });

    if (!shop || shop.ownerUserId !== userId) {
      throw new ForbiddenException('You can only delete your own bots');
    }

    return (this.prisma as any).bot.delete({
      where: { id: botId },
    });
  }
}