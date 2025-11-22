// src/telegram/telegram.module.ts
import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { CartService } from '../cart/cart.service';
import { PaymentsService } from '../payments/payments.service';  // <-- ADD
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [TelegramService, CartService, PaymentsService, PrismaService],  // <-- ADD PaymentsService
  exports: [TelegramService],
})
export class TelegramModule {}