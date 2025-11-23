import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TwoFaService } from './two-fa.service';
import { TwoFaController } from './two-fa.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PassportModule],  // ← HINZUFÜGEN!
  controllers: [TwoFaController],
  providers: [TwoFaService, PrismaService],
  exports: [TwoFaService],
})
export class TwoFaModule {}