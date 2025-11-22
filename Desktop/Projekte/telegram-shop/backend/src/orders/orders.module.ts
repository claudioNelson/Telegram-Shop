// src/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { CartService } from '../cart/cart.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [OrdersService, CartService, PrismaService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}