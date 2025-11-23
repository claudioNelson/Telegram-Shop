import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TwoFaService } from './two-fa.service';
import { TwoFaController } from './two-fa.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [TwoFaController],
  providers: [TwoFaService, PrismaService],
  exports: [TwoFaService],
})
export class TwoFaModule {}