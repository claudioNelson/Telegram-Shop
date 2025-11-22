// src/orders/orders.controller.ts
import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/orders')
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private prisma: PrismaService,
  ) {}

  @Post('create-from-cart')
  @UseGuards(AuthGuard('jwt'))
  async createOrderFromCart(@Request() req, @Body() body: any) {
    const shop = await (this.prisma as any).shop.findFirst({
      where: { ownerUserId: req.user.userId },
    });

    if (!shop) {
      throw new Error('Shop not found');
    }

    return this.ordersService.createOrderFromCart(
      shop.id,
      body.telegramUserId,
      body.shippingAddressJson,
    );
  }

  @Get('customer/:customerId')
  async getOrdersByCustomer(@Param('customerId') customerId: string) {
    return this.ordersService.getOrdersByCustomer(parseInt(customerId));
  }

  @Get(':orderId')
  async getOrderById(@Param('orderId') orderId: string) {
    return this.ordersService.getOrderById(parseInt(orderId));
  }
}