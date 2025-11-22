// src/products/products.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async createProduct(shopId: number, userId: number, data: any) {
    // Prüfe ob User der Shop-Owner ist
    const shop = await (this.prisma as any).shop.findUnique({
      where: { id: shopId },
    });

    if (!shop || shop.ownerUserId !== userId) {
      throw new ForbiddenException('You can only add products to your own shop');
    }

    return (this.prisma as any).product.create({
      data: {
        ...data,
        shopId,
      },
    });
  }

async getProductsByShop(shopId: number) {
  return (this.prisma as any).product.findMany({
    where: {
      shopId: shopId,
      isActive: true,
    },
  });
}

  async getProductById(productId: number) {
    const product = await (this.prisma as any).product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async updateProduct(productId: number, userId: number, data: any) {
    const product = await this.getProductById(productId);

    // Prüfe Berechtigung
    const shop = await (this.prisma as any).shop.findUnique({
      where: { id: product.shopId },
    });

    if (!shop || shop.ownerUserId !== userId) {
      throw new ForbiddenException('You can only update your own products');
    }

    return (this.prisma as any).product.update({
      where: { id: productId },
      data,
    });
  }

  async deleteProduct(productId: number, userId: number) {
    const product = await this.getProductById(productId);

    // Prüfe Berechtigung
    const shop = await (this.prisma as any).shop.findUnique({
      where: { id: product.shopId },
    });

    if (!shop || shop.ownerUserId !== userId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    return (this.prisma as any).product.delete({
      where: { id: productId },
    });
  }
}