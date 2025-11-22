// src/shops/shops.controller.ts
import { Controller, Post, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ShopsService } from './shops.service';

@Controller('api/shops')
export class ShopsController {
  constructor(private shopsService: ShopsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createShop(@Request() req, @Body() body: any) {
    return this.shopsService.createShop(req.user.userId, body);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMyShop(@Request() req) {
    return this.shopsService.getMyShop(req.user.userId);
  }

  @Get(':id')
  async getShopById(@Param('id') id: string) {
    return this.shopsService.getShopById(parseInt(id));
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateShop(@Param('id') id: string, @Request() req, @Body() body: any) {
    return this.shopsService.updateShop(parseInt(id), req.user.userId, body);
  }
}