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
}