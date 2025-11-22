// src/orders/orders.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
  ) {}

  async createOrderFromCart(
    shopId: number,
    telegramUserId: number,
    shippingAddressJson?: string,
  ) {
    // Hole Cart
    const cart = this.cartService.getCart(shopId, telegramUserId);

    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Finde Customer
    const customer = await (this.prisma as any).customer.findFirst({
      where: { shopId, telegramUserId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Hole alle Produkte aus Cart
    const products = await (this.prisma as any).product.findMany({
      where: {
        id: { in: cart.items.map(item => item.productId) },
      },
    });

    // Berechne Gesamtbetrag und prüfe Stock
    let totalAmountCents = 0;
    let isDigital = true;
    const orderItems: any[] = [];

    for (const cartItem of cart.items) {
      const product = products.find(p => p.id === cartItem.productId);

      if (!product) {
        throw new NotFoundException(`Product ${cartItem.productId} not found`);
      }

      // Stock-Check für physische Produkte
      if (!product.isDigital && product.stockQuantity < cartItem.quantity) {
        throw new BadRequestException(
          `Product ${product.title} has insufficient stock`,
        );
      }

      if (!product.isDigital) {
        isDigital = false;
      }

      const itemTotal = product.priceCents * cartItem.quantity;
      totalAmountCents += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: cartItem.quantity,
        unitPriceCents: product.priceCents,
        totalPriceCents: itemTotal,
      });
    }

    // Erstelle Order
    const order = await (this.prisma as any).order.create({
      data: {
        shopId,
        customerId: customer.id,
        totalAmountCents,
        currency: 'EUR',
        isDigital,
        status: 'PENDING_PAYMENT',
        shippingAddressJson,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    // Reduziere Stock für physische Produkte
    for (const cartItem of cart.items) {
      const product = products.find(p => p.id === cartItem.productId);
      if (!product.isDigital) {
        await (this.prisma as any).product.update({
          where: { id: product.id },
          data: {
            stockQuantity: product.stockQuantity - cartItem.quantity,
          },
        });
      }
    }

    // Lösche Cart
    this.cartService.clearCart(shopId, telegramUserId);

    return order;
  }

  async getOrdersByCustomer(customerId: number) {
    return (this.prisma as any).order.findMany({
      where: { customerId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(orderId: number) {
    const order = await (this.prisma as any).order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(orderId: number, status: string) {
    return (this.prisma as any).order.update({
      where: { id: orderId },
      data: { status },
    });
  }
}