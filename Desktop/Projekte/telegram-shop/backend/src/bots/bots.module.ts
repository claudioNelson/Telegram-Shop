import { Module } from '@nestjs/common';
import { BotsService } from './bots.service';
import { BotsController } from './bots.controller';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [TelegramModule],
  providers: [BotsService, PrismaService],
  controllers: [BotsController],
  exports: [BotsService],
})
export class BotsModule {}