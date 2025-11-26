'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import {
  Package,
  ShoppingCart,
  Bot,
  Settings,
  Zap,
  Bitcoin,
  Coins,
  Copy,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';

interface Shop {
  id: number;
  publicName: string;
  slug: string;
  btcAddress?: string;
  ethAddress?: string;
}

export default function DashboardPage() {
  const [shop, setShop] = useState(null as Shop | null);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-slate-300">Loading...</div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Navbar shopName="Error" />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="p-4 bg-red-900/30 border border-red-800/50 text-red-400 rounded-lg">
            Shop not found
          </div>
        </div>
      </div>
    );
  }

  const actions = [
    {
      href: '/dashboard/products',
      icon: <Package className="w-5 h-5" />,
      label: 'Products',
      count: '12',
    },
    {
      href: '/dashboard/orders',
      icon: <ShoppingCart className="w-5 h-5" />,
      label: 'Orders',
      count: '8',
    },
    {
      href: '/dashboard/bots',
      icon: <Bot className="w-5 h-5" />,
      label: 'Bots',
      count: '1',
    },
    {
      href: '/dashboard/settings',
      icon: <Settings className="w-5 h-5" />,
      label: 'Settings',
      count: '',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar shopName={shop.publicName} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">{shop.publicName}</h1>
          <p className="text-slate-400 text-sm">Cryptocurrency e-commerce dashboard</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Quick Actions - Left Side */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {actions.map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className="bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-lg p-4 transition group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-slate-300 group-hover:text-white transition">
                      {action.icon}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition" />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1">
                    {action.label}
                  </h3>
                  {action.count && (
                    <p className="text-slate-400 text-xs">{action.count} total</p>
                  )}
                </a>
              ))}
            </div>

            {/* Shop Info Table */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg">
              <div className="px-6 py-4 border-b border-slate-700">
                <h2 className="text-sm font-semibold text-white">Shop Information</h2>
              </div>
              <div className="divide-y divide-slate-700">
                <div className="px-6 py-3 flex justify-between items-center text-sm">
                  <span className="text-slate-400">Name</span>
                  <span className="text-white font-medium">{shop.publicName}</span>
                </div>
                <div className="px-6 py-3 flex justify-between items-center text-sm">
                  <span className="text-slate-400">Slug</span>
                  <span className="text-white font-mono text-xs">{shop.slug}</span>
                </div>
                <div className="px-6 py-3 flex justify-between items-center text-sm">
                  <span className="text-slate-400">Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-emerald-400">Active</span>
                  </div>
                </div>
                <div className="px-6 py-3 flex justify-between items-center text-sm">
                  <span className="text-slate-400">Bot</span>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-emerald-400">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses - Right Side */}
          <div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg h-full">
              <div className="px-6 py-4 border-b border-slate-700">
                <h2 className="text-sm font-semibold text-white">Addresses</h2>
              </div>
              <div className="divide-y divide-slate-700">
                {/* Bitcoin */}
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bitcoin className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-medium text-slate-400">Bitcoin</span>
                  </div>
                  {shop.btcAddress ? (
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-mono text-white break-all flex-1">
                        {shop.btcAddress.slice(0, 12)}...
                      </span>
                      <button
                        onClick={() => copyToClipboard(shop.btcAddress || '', 'btc')}
                        className="p-1 hover:bg-slate-700 rounded transition"
                        title="Copy"
                      >
                        {copied === 'btc' ? (
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-500 hover:text-slate-300" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">Not set</span>
                  )}
                </div>

                {/* Ethereum */}
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-medium text-slate-400">Ethereum</span>
                  </div>
                  {shop.ethAddress ? (
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-mono text-white break-all flex-1">
                        {shop.ethAddress.slice(0, 12)}...
                      </span>
                      <button
                        onClick={() => copyToClipboard(shop.ethAddress || '', 'eth')}
                        className="p-1 hover:bg-slate-700 rounded transition"
                        title="Copy"
                      >
                        {copied === 'eth' ? (
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-500 hover:text-slate-300" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">Not set</span>
                  )}
                </div>

                {/* Slug */}
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-medium text-slate-400">Shop ID</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-mono text-white flex-1">
                      {shop.slug}
                    </span>
                    <button
                      onClick={() => copyToClipboard(shop.slug, 'slug')}
                      className="p-1 hover:bg-slate-700 rounded transition"
                      title="Copy"
                    >
                      {copied === 'slug' ? (
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-500 hover:text-slate-300" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">Total Orders</p>
            <p className="text-white text-xl font-bold">0</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">Revenue</p>
            <p className="text-white text-xl font-bold">€0.00</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">Active Products</p>
            <p className="text-white text-xl font-bold">0</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">Conversion</p>
            <p className="text-white text-xl font-bold">0%</p>
          </div>
        </div>
      </main>
    </div>
  );
}