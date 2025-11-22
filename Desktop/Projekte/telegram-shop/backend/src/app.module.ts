// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ShopsModule } from './shops/shops.module';
import { ProductsModule } from './products/products.module';
import { BotsModule } from './bots/bots.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { TelegramModule } from './telegram/telegram.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [AuthModule, ShopsModule, ProductsModule, BotsModule, CartModule, OrdersModule, PaymentsModule, TelegramModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}