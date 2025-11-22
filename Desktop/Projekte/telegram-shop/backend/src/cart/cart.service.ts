// src/cart/cart.service.ts
import { Injectable } from '@nestjs/common';

interface CartItem {
  productId: number;
  quantity: number;
}

interface Cart {
  items: CartItem[];
  lastUpdated: Date;
}

@Injectable()
export class CartService {
  private carts: Map<string, Cart> = new Map(); // key: shopId_telegramUserId

  private getCartKey(shopId: number, telegramUserId: number): string {
    return `${shopId}_${telegramUserId}`;
  }

  addToCart(shopId: number, telegramUserId: number, productId: number, quantity: number = 1) {
    const key = this.getCartKey(shopId, telegramUserId);
    let cart = this.carts.get(key) || { items: [], lastUpdated: new Date() };

    const existingItem = cart.items.find(item => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    cart.lastUpdated = new Date();
    this.carts.set(key, cart);

    return cart;
  }

  getCart(shopId: number, telegramUserId: number) {
    const key = this.getCartKey(shopId, telegramUserId);
    return this.carts.get(key) || { items: [], lastUpdated: new Date() };
  }

  clearCart(shopId: number, telegramUserId: number) {
    const key = this.getCartKey(shopId, telegramUserId);
    this.carts.delete(key);
  }

  removeFromCart(shopId: number, telegramUserId: number, productId: number) {
    const key = this.getCartKey(shopId, telegramUserId);
    let cart = this.carts.get(key);

    if (!cart) return null;

    cart.items = cart.items.filter(item => item.productId !== productId);
    this.carts.set(key, cart);

    return cart;
  }
}