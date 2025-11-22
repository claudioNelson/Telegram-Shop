// src/bots/bots.module.ts
import { Module } from '@nestjs/common';
import { BotsService } from './bots.service';
import { BotsController } from './bots.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [BotsService, PrismaService],
  controllers: [BotsController],
  exports: [BotsService],
})
export class BotsModule {}