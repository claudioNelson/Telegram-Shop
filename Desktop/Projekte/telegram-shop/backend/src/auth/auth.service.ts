// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { TwoFaService } from '../two-fa/two-fa.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private twoFaService: TwoFaService,
  ) {}

  async register(email: string, password: string, role: string = 'SHOP_OWNER') {
    const existingUser = await (this.prisma as any).user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await (this.prisma as any).user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role,
      },
    });

    const shopName = email.split('@')[0];
    const shopSlug = this.generateUniqueSlug(shopName);

    await (this.prisma as any).shop.create({
      data: {
        name: shopName,
        publicName: shopName,
        slug: shopSlug,
        ownerUserId: user.id,
      },
    });

    return this.generateTokens(user);
  }

  async login(email: string, password: string) {
    const user = await (this.prisma as any).user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // ===== NEU: 2FA Prüfung =====
    const twoFaEnabled = await this.twoFaService.isTwoFaEnabled(user.id);

    if (twoFaEnabled) {
      // 2FA aktiviert → Challenge generieren statt Token
      const { challengeId, encryptedChallenge } =
        await this.twoFaService.generateChallenge(user.id);

      return {
        requiresTwoFa: true,
        userId: user.id,
        email: user.email,
        challengeId,
        encryptedChallenge,
        message: 'Please sign the challenge with your PGP private key',
      };
    }

    // Keine 2FA → Token wie bisher
    return this.generateTokens(user);
  }

  private generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      requiresTwoFa: false,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  private generateUniqueSlug(baseName: string): string {
    const timestamp = Date.now().toString().slice(-6);
    return `${baseName}-${timestamp}`.toLowerCase();
  }
}