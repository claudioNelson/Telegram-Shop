'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import {
  Package,
  ShoppingCart,
  Settings,
  TrendingUp,
  TrendingDown,
  Copy,
  CheckCircle,
  ArrowRight,
  Bot,
} from 'lucide-react';

interface Shop {
  id: number;
  publicName: string;
  slug: string;
  btcAddress?: string;
  ethAddress?: string;
  ltcAddress?: string;
  usdtAddress?: string;
  xmrAddress?: string;
}

export default function DashboardPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchShop(token);
  }, [router]);

  const fetchShop = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/shops/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setShop(data);
    } catch (err) {
      console.error('Error:', err);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-300">Loading...</div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar shopName="Error" />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="p-4 bg-red-900 bg-opacity-30 border border-red-800 border-opacity-50 text-red-400 rounded-lg">
            Shop not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar shopName={shop.publicName} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {shop.publicName}! 👋
          </h1>
          <p className="text-slate-400">
            Here is an overview of your shop performance
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Card 1 */}
          <div className="border-t-4 border-t-emerald-500 bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition">
            <div className="flex items-start justify-between mb-4">
              <ShoppingCart className="w-6 h-6 text-emerald-400" />
              <div className="flex items-center gap-1 text-sm text-slate-400">
                <TrendingUp className="w-4 h-4" />
                <span>+3.5%</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">
              Total Orders
            </p>
            <p className="text-white text-3xl font-bold">0</p>
          </div>

          {/* Card 2 */}
          <div className="border-t-4 border-t-blue-500 bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition">
            <div className="flex items-start justify-between mb-4">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <div className="flex items-center gap-1 text-sm text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span>+11%</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">
              Revenue
            </p>
            <p className="text-white text-3xl font-bold">€0.00</p>
          </div>

          {/* Card 3 */}
          <div className="border-t-4 border-t-orange-500 bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition">
            <div className="flex items-start justify-between mb-4">
              <Package className="w-6 h-6 text-orange-400" />
              <div className="flex items-center gap-1 text-sm text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span>+5%</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">
              Active Products
            </p>
            <p className="text-white text-3xl font-bold">0</p>
          </div>

          {/* Card 4 */}
          <div className="border-t-4 border-t-purple-500 bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition">
            <div className="flex items-start justify-between mb-4">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <div className="flex items-center gap-1 text-sm text-red-400">
                <TrendingDown className="w-4 h-4" />
                <span>-2.4%</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">
              Conversion Rate
            </p>
            <p className="text-white text-3xl font-bold">0%</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Action 1 */}

            <a href="/dashboard/products"
              className="bg-blue-900 bg-opacity-20 border border-blue-800 border-opacity-50 hover:border-blue-700 hover:border-opacity-50 rounded-lg p-6 transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <Package className="w-5 h-5 text-slate-300 group-hover:text-white transition" />
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition transform group-hover:translate-x-1" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">
                Products
              </h3>
              <p className="text-slate-400 text-sm">
                Manage your products
              </p>
            </a>

            {/* Action 2 */}

            <a href="/dashboard/orders"
              className="bg-green-900 bg-opacity-20 border border-green-800 border-opacity-50 hover:border-green-700 hover:border-opacity-50 rounded-lg p-6 transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <ShoppingCart className="w-5 h-5 text-slate-300 group-hover:text-white transition" />
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition transform group-hover:translate-x-1" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">
                Orders
              </h3>
              <p className="text-slate-400 text-sm">
                View all orders
              </p>
            </a>

            {/* Action 3 */}

            <a href="/dashboard/settings"
              className="bg-purple-900 bg-opacity-20 border border-purple-800 border-opacity-50 hover:border-purple-700 hover:border-opacity-50 rounded-lg p-6 transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <Settings className="w-5 h-5 text-slate-300 group-hover:text-white transition" />
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition transform group-hover:translate-x-1" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">
                Settings
              </h3>
              <p className="text-slate-400 text-sm">
                Configure your shop
              </p>
            </a>

            <a href="/dashboard/bots"
              className="bg-indigo-900 bg-opacity-20 border border-indigo-800 border-opacity-50 hover:border-indigo-700 hover:border-opacity-50 rounded-lg p-6 transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <Bot className="w-5 h-5 text-slate-300 group-hover:text-white transition" />
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">Bots</h3>
              <p className="text-slate-400 text-sm">Manage your Telegram bots</p>
            </a>

          </div>
        </div>

        {/* Shop Info & Addresses */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shop Info */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="border-b border-slate-800 px-6 py-4 bg-slate-800 bg-opacity-50">
              <h2 className="text-lg font-bold text-white">
                Shop Information
              </h2>
            </div>
            <div className="divide-y divide-slate-800">
              <div className="px-6 py-4 flex justify-between items-center">
                <span className="text-slate-400 font-medium">
                  Shop Name
                </span>
                <span className="text-white font-semibold">
                  {shop.publicName}
                </span>
              </div>
              <div className="px-6 py-4 flex justify-between items-center">
                <span className="text-slate-400 font-medium">
                  Shop Slug
                </span>
                <code className="text-emerald-400 font-mono text-sm bg-slate-800 px-3 py-1 rounded">
                  {shop.slug}
                </code>
              </div>
              <div className="px-6 py-4 flex justify-between items-center">
                <span className="text-slate-400 font-medium">
                  Status
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-emerald-400 font-medium">
                    Active
                  </span>
                </div>
              </div>
              <div className="px-6 py-4 flex justify-between items-center">
                <span className="text-slate-400 font-medium">
                  Bot Status
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-400 font-medium">
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Crypto Addresses */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="border-b border-slate-800 px-6 py-4 bg-slate-800 bg-opacity-50">
              <h2 className="text-lg font-bold text-white">
                Payment Addresses
              </h2>
            </div>
            <div className="divide-y divide-slate-800">
              {shop.btcAddress ? (
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span className="text-xs font-medium text-slate-400">
                      Bitcoin
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-slate-300 truncate">
                      {shop.btcAddress}
                    </span>
                    <button
                      onClick={() => copyToClipboard(shop.btcAddress || '', 'btc')}
                      className="p-1 hover:bg-slate-700 rounded transition shrink-0"
                    >
                      {copied === 'btc' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                      )}
                    </button>
                  </div>
                </div>
              ) : null}

              {shop.ethAddress ? (
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className="text-xs font-medium text-slate-400">
                      Ethereum
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-slate-300 truncate">
                      {shop.ethAddress}
                    </span>
                    <button
                      onClick={() => copyToClipboard(shop.ethAddress || '', 'eth')}
                      className="p-1 hover:bg-slate-700 rounded transition shrink-0"
                    >
                      {copied === 'eth' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                      )}
                    </button>
                  </div>
                </div>
              ) : null}

              {shop.ltcAddress ? (
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-xs font-medium text-slate-400">
                      Litecoin
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-slate-300 truncate">
                      {shop.ltcAddress}
                    </span>
                    <button
                      onClick={() => copyToClipboard(shop.ltcAddress || '', 'ltc')}
                      className="p-1 hover:bg-slate-700 rounded transition shrink-0"
                    >
                      {copied === 'ltc' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                      )}
                    </button>
                  </div>
                </div>
              ) : null}

              {!shop.btcAddress && !shop.ethAddress && !shop.ltcAddress ? (
                <div className="px-6 py-4">
                  <p className="text-slate-400 text-sm">
                    No payment addresses configured yet.{' '}
                    <a href="/dashboard/settings" className="text-emerald-400 hover:text-emerald-300">
                      Add them in Settings →
                    </a>
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}