// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, role: string = 'SHOP_OWNER') {
    console.log('Prisma service:', this.prisma);

    const existingUser = await (this.prisma as any).user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash das Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Erstelle neuen User
    const user = await (this.prisma as any).user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role,
      },
    });

    // Erstelle automatisch einen Shop für den neuen User
    const shopName = email.split('@')[0]; // z.B. "john" aus "john@example.com"
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
    // Finde User
    const user = await (this.prisma as any).user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Vergleiche Passwords
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

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
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Generiere einen eindeutigen Slug
   * Füge Timestamp hinzu um Collisions zu vermeiden
   */
  private generateUniqueSlug(baseName: string): string {
    const timestamp = Date.now().toString().slice(-6); // Letzten 6 Ziffern
    return `${baseName}-${timestamp}`.toLowerCase();
  }
}