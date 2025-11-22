// src/bots/bots.controller.ts
import { Controller, Post, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BotsService } from './bots.service';

@Controller('api/shops/:shopId/bots')
export class BotsController {
  constructor(private botsService: BotsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createBot(
    @Param('shopId') shopId: string,
    @Request() req,
    @Body() body: any,
  ) {
    return this.botsService.createBot(parseInt(shopId), req.user.userId, body);
  }

  @Get()
  async getBotByShop(@Param('shopId') shopId: string) {
    return this.botsService.getBotByShop(parseInt(shopId));
  }

  @Put(':botId')
  @UseGuards(AuthGuard('jwt'))
  async updateBot(
    @Param('botId') botId: string,
    @Request() req,
    @Body() body: any,
  ) {
    return this.botsService.updateBot(parseInt(botId), req.user.userId, body);
  }
}