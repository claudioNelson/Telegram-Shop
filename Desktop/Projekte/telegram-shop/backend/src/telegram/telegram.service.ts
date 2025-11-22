import { Injectable, OnModuleInit } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';  // <-- ADD
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bots: Map<number, TelegramBot> = new Map();

  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private paymentsService: PaymentsService,
  ) {}

  async onModuleInit() {
    // Lade alle aktiven Bots aus DB beim Start
    const activeBots = await (this.prisma as any).bot.findMany({
      where: { isActive: true },
    });

    for (const bot of activeBots) {
      this.initializeBot(bot);
    }

    console.log(`✅ ${activeBots.length} Telegram Bots initialized`);
  }

  private initializeBot(botData: any) {
    const bot = new TelegramBot(botData.telegramBotToken, { polling: true });

    // /start command
    bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;

      // Finde oder erstelle Customer
      let customer = await (this.prisma as any).customer.findFirst({
        where: {
          shopId: botData.shopId,
          telegramUserId: userId,
        },
      });

      if (!customer) {
        customer = await (this.prisma as any).customer.create({
          data: {
            shopId: botData.shopId,
            telegramUserId: userId,
            telegramUsername: msg.from.username,
            firstName: msg.from.first_name,
            lastName: msg.from.last_name,
          },
        });
      }

      // Sende Welcome Message
      const welcomeMessage = botData.welcomeMessage || 'Willkommen im Shop! 👋';
      bot.sendMessage(chatId, welcomeMessage, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🛍 Produkte ansehen', callback_data: 'view_products' }],
            [{ text: '📦 Meine Bestellungen', callback_data: 'view_orders' }],
            [{ text: 'ℹ️ Infos', callback_data: 'view_info' }],
          ],
        },
      });
    });

    // Callback Query Handler
// Callback Query Handler
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const action = query.data;
  const userId = query.from.id;

  if (action === 'view_products') {
    await this.handleViewProducts(bot, chatId, botData.shopId);
  } else if (action === 'view_orders') {
    await this.handleViewOrders(bot, chatId, botData.shopId, userId);
  } else if (action === 'view_info') {
    await this.handleViewInfo(bot, chatId, botData.shopId);
  } else if (action === 'view_cart') {
    await this.handleViewCart(bot, chatId, botData.shopId, userId);
  } else if (action.startsWith('add_to_cart_')) {
    const productId = parseInt(action.replace('add_to_cart_', ''));
    this.cartService.addToCart(botData.shopId, userId, productId, 1);
    bot.sendMessage(chatId, '✅ Produkt zum Warenkorb hinzugefügt!');
  } else if (action === 'checkout') {
    await this.handleCheckout(bot, chatId, botData.shopId, userId);
  }
});

    this.bots.set(botData.shopId, bot);
  }

private async handleViewProducts(bot: TelegramBot, chatId: number, shopId: number) {
  const products = await (this.prisma as any).product.findMany({
    where: { shopId, isActive: true },
    take: 10,
  });

  if (products.length === 0) {
    bot.sendMessage(chatId, 'Keine Produkte verfügbar.');
    return;
  }

  let message = '🛍 *Produkte*\n\n';
  const keyboard: any[] = [];

  for (const product of products) {
    message += `*${product.title}*\n`;
    message += `💰 ${(product.priceCents / 100).toFixed(2)} ${product.currency}\n`;
    message += `${product.description}\n\n`;

    keyboard.push([
      {
        text: `${product.title} - +`,
        callback_data: `add_to_cart_${product.id}`,
      },
    ]);
  }

  keyboard.push([
    {
      text: '🛒 Zum Warenkorb',
      callback_data: 'view_cart',
    },
  ]);

  bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: keyboard,
    },
  });
}

private async handleViewCart(bot: TelegramBot, chatId: number, shopId: number, userId: number) {
  const cart = this.cartService.getCart(shopId, userId);

  if (cart.items.length === 0) {
    bot.sendMessage(chatId, '🛒 Dein Warenkorb ist leer!');
    return;
  }

  // Hole Produkt-Details
  const products = await (this.prisma as any).product.findMany({
    where: { id: { in: cart.items.map(item => item.productId) } },
  });

  let message = '🛒 *Dein Warenkorb*\n\n';
  let totalPrice = 0;

  for (const item of cart.items) {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      const itemTotal = product.priceCents * item.quantity;
      totalPrice += itemTotal;
      message += `*${product.title}* x${item.quantity}\n`;
      message += `${(itemTotal / 100).toFixed(2)} EUR\n\n`;
    }
  }

  message += `*Gesamt: ${(totalPrice / 100).toFixed(2)} EUR*`;

  bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '✅ Zur Kasse', callback_data: 'checkout' }],
        [{ text: '🛍 Zurück zu Produkten', callback_data: 'view_products' }],
      ],
    },
  });
}

private async handleCheckout(bot: TelegramBot, chatId: number, shopId: number, userId: number) {
  const cart = this.cartService.getCart(shopId, userId);

  if (cart.items.length === 0) {
    bot.sendMessage(chatId, '❌ Dein Warenkorb ist leer!');
    return;
  }

  const customer = await (this.prisma as any).customer.findFirst({
    where: { shopId, telegramUserId: userId },
  });

  if (!customer) {
    bot.sendMessage(chatId, '❌ Kunde nicht gefunden');
    return;
  }

  try {
    // Erstelle Order
    const products = await (this.prisma as any).product.findMany({
      where: { id: { in: cart.items.map(item => item.productId) } },
    });

    let totalAmountCents = 0;
    let isDigital = true;
    const orderItems: any[] = [];

    for (const cartItem of cart.items) {
      const product = products.find(p => p.id === cartItem.productId);
      if (product) {
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
    }

    const order = await (this.prisma as any).order.create({
      data: {
        shopId,
        customerId: customer.id,
        totalAmountCents,
        currency: 'EUR',
        isDigital,
        status: 'PENDING_PAYMENT',
        items: {
          create: orderItems,
        },
      },
    });

    this.cartService.clearCart(shopId, userId);

    // Generiere Payment-Request
    const payment = await this.paymentsService.generatePaymentRequest(order.id);
    const qrData = this.paymentsService.getQrCodeData(payment);

    const amountStr = payment.amount.toFixed(8);
    let message = `✅ *Bestellung erstellt!*\n\n`;
    message += `Bestellnummer: #${order.id}\n`;
    message += `Betrag: ${(order.totalAmountCents / 100).toFixed(2)} EUR\n\n`;
    message += `💰 *Kryptowährung: ${payment.cryptoType}*\n`;
    message += `📍 Wallet: \`${payment.walletAddress}\`\n`;
    message += `💵 Betrag: ${amountStr} ${payment.cryptoType}\n`;
    message += `\n⏳ Bitte sende die oben angegebene Menge an die Wallet-Adresse.\n`;
    message += `Nach Bestätigung wird deine Bestellung freigegeben.`;

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

  } catch (error) {
    bot.sendMessage(chatId, '❌ Fehler bei der Bestellerstellung');
    console.error(error);
  }
}
  private async handleViewOrders(bot: TelegramBot, chatId: number, shopId: number, userId: number) {
    const customer = await (this.prisma as any).customer.findFirst({
      where: { shopId, telegramUserId: userId },
    });

    if (!customer) {
      bot.sendMessage(chatId, 'Kunde nicht gefunden.');
      return;
    }

    const orders = await (this.prisma as any).order.findMany({
      where: { shopId, customerId: customer.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (orders.length === 0) {
      bot.sendMessage(chatId, 'Du hast noch keine Bestellungen.');
      return;
    }

    let message = '📦 *Deine Bestellungen*\n\n';
    for (const order of orders) {
      message += `*Bestellung #${order.id}*\n`;
      message += `Status: ${order.status}\n`;
      message += `Betrag: ${(order.totalAmountCents / 100).toFixed(2)} ${order.currency}\n`;
      message += `Datum: ${new Date(order.createdAt).toLocaleDateString()}\n\n`;
    }

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }

  private async handleViewInfo(bot: TelegramBot, chatId: number, shopId: number) {
    const shop = await (this.prisma as any).shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      bot.sendMessage(chatId, 'Shop nicht gefunden.');
      return;
    }

    let message = `ℹ️ *${shop.publicName}*\n\n`;
    if (shop.imprintText) {
      message += `*Impressum*\n${shop.imprintText}\n\n`;
    }
    if (shop.privacyPolicyText) {
      message += `*Datenschutz*\n${shop.privacyPolicyText}\n`;
    }

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }

  getBot(shopId: number): TelegramBot | undefined {
    return this.bots.get(shopId);
  }

  getAllBots(): Map<number, TelegramBot> {
    return this.bots;
  }
}