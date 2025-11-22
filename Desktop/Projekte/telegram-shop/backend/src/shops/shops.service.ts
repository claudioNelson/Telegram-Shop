// src/shops/shops.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopsService {
  constructor(private prisma: PrismaService) {}

  async createShop(
    ownerUserId: number,
    data: {
      name: string;
      publicName: string;
      slug: string;
      email?: string;
      imprintText?: string;
      privacyPolicyText?: string;
    },
  ) {
    return (this.prisma as any).shop.create({
      data: {
        ...data,
        ownerUserId,
      },
    });
  }

  async getMyShop(userId: number) {
    const shop = await (this.prisma as any).shop.findFirst({
      where: { ownerUserId: userId },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    return shop;
  }

  async getShopById(shopId: number) {
    const shop = await (this.prisma as any).shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    return shop;
  }

  async updateShop(shopId: number, userId: number, data: any) {
    const shop = await this.getShopById(shopId);

    if (shop.ownerUserId !== userId) {
      throw new ForbiddenException('You can only update your own shop');
    }

    return (this.prisma as any).shop.update({
      where: { id: shopId },
      data,
    });
  }
}