import { Controller, Post, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BotsService } from './bots.service';

@Controller('api/shops/:shopId/bots')
export class BotsController {
  constructor(private botsService: BotsService) {}

  /**
   * POST /api/shops/:shopId/bots
   * Erstelle einen neuen Bot für den Shop
   */
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createBot(
    @Param('shopId') shopId: string,
    @Request() req,
    @Body() body: any,
  ) {
    return this.botsService.createBot(parseInt(shopId), req.user.userId, body);
  }

  /**
   * GET /api/shops/:shopId/bots
   * Hole alle Bots für den Shop
   */
  @Get()
  async getBotsByShop(@Param('shopId') shopId: string) {
    return this.botsService.getBotsByShop(parseInt(shopId));
  }

  /**
   * PUT /api/shops/:shopId/bots/:botId
   * Update einen Bot
   */
  @Put(':botId')
  @UseGuards(AuthGuard('jwt'))
  async updateBot(
    @Param('shopId') shopId: string,
    @Param('botId') botId: string,
    @Request() req,
    @Body() body: any,
  ) {
    return this.botsService.updateBot(parseInt(botId), req.user.userId, body);
  }
}