// src/payments/payments.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface PaymentDetails {
  orderId: number;
  cryptoType: 'BTC' | 'ETH' | 'LTC' | 'USDT' | 'XMR';
  amount: number; // in Satoshi/Wei/etc
  walletAddress: string;
  paymentId?: string; // für Monero
}

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

async generatePaymentRequest(orderId: number): Promise<PaymentDetails> {
  const order = await (this.prisma as any).order.findUnique({
    where: { id: orderId },
    include: { shop: true },
  });

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  // Prüfe welche Wallets der Shop hat
  const availableCrypto = this.getAvailableCryptos(order.shop);

  if (availableCrypto.length === 0) {
    throw new BadRequestException('Shop has no payment wallets configured');
  }

  // Nutze erste verfügbare Wallet
  const crypto = availableCrypto[0];
  const amount = this.convertEurToCrypto(order.totalAmountCents / 100, crypto);

  return {
    orderId,
    cryptoType: crypto as any,
    amount,
    walletAddress: order.shop[this.getAddressField(crypto)],
    paymentId: this.generatePaymentId(orderId),
  };
}
  async verifyPayment(orderId: number, txHash: string): Promise<boolean> {
    // TODO: Implement blockchain verification
    // For now, we'll mark as paid when user provides tx hash
    
    const order = await (this.prisma as any).order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Update order status to PAID
    await (this.prisma as any).order.update({
      where: { id: orderId },
      data: { 
        status: 'PAID',
        paymentProviderSessionId: txHash,
      },
    });

    return true;
  }

private getAvailableCryptos(shop: any): string[] {
  const cryptos: string[] = [];  // <-- ADD string[] hier
  if (shop.btcAddress) cryptos.push('BTC');
  if (shop.ethAddress) cryptos.push('ETH');
  if (shop.ltcAddress) cryptos.push('LTC');
  if (shop.usdtAddress) cryptos.push('USDT');
  if (shop.xmrAddress) cryptos.push('XMR');
  return cryptos;
}

  private getAddressField(crypto: string): string {
    const fields: any = {
      BTC: 'btcAddress',
      ETH: 'ethAddress',
      LTC: 'ltcAddress',
      USDT: 'usdtAddress',
      XMR: 'xmrAddress',
    };
    return fields[crypto];
  }

  private convertEurToCrypto(eur: number, crypto: string): number {
    // Mock prices - später von API holen
    const prices: any = {
      BTC: 95000,
      ETH: 3500,
      LTC: 150,
      USDT: 1,
      XMR: 200,
    };
    return eur / prices[crypto];
  }

  private generatePaymentId(orderId: number): string {
    return `order_${orderId}_${Date.now()}`;
  }

  getQrCodeData(payment: PaymentDetails): string {
    // Generiere QR-Code String basierend auf Crypto-Typ
    switch (payment.cryptoType) {
      case 'BTC':
        return `bitcoin:${payment.walletAddress}?amount=${payment.amount}`;
      case 'ETH':
      case 'USDT':
        return `ethereum:${payment.walletAddress}?amount=${payment.amount}`;
      case 'LTC':
        return `litecoin:${payment.walletAddress}?amount=${payment.amount}`;
      case 'XMR':
        return `monero:${payment.walletAddress}?tx_payment_id=${payment.paymentId}&tx_amount=${payment.amount}`;
      default:
        return '';
    }
  }
}