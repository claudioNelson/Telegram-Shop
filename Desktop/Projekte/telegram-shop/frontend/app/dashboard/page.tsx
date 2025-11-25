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
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
        <Navbar shopName="Error" />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="p-4 bg-red-900/30 border border-red-800/50 text-red-400 rounded-lg">
            Shop not found
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Shop Slug',
      value: shop.slug,
      icon: <Zap className="w-6 h-6" />,
      color: 'from-blue-600 to-blue-700',
      copyable: true,
      field: 'slug',
    },
    {
      label: 'Bitcoin Address',
      value: shop.btcAddress || 'Not configured',
      icon: <Bitcoin className="w-6 h-6" />,
      color: 'from-orange-600 to-orange-700',
      copyable: !!shop.btcAddress,
      field: 'btc',
    },
    {
      label: 'Ethereum Address',
      value: shop.ethAddress || 'Not configured',
      icon: <Coins className="w-6 h-6" />,
      color: 'from-purple-600 to-purple-700',
      copyable: !!shop.ethAddress,
      field: 'eth',
    },
    {
      label: 'Bot Status',
      value: 'Active',
      icon: <Bot className="w-6 h-6" />,
      color: 'from-emerald-600 to-emerald-700',
      copyable: false,
      field: 'bot',
    },
  ];

  const actions = [
    {
      href: '/dashboard/products',
      icon: <Package className="w-8 h-8" />,
      label: 'Products',
      description: 'Manage your products',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/30',
    },
    {
      href: '/dashboard/orders',
      icon: <ShoppingCart className="w-8 h-8" />,
      label: 'Orders',
      description: 'View all orders',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-900/30',
    },
    {
      href: '/dashboard/bots',
      icon: <Bot className="w-8 h-8" />,
      label: 'Bot Manager',
      description: 'Manage bots',
      color: 'text-violet-400',
      bgColor: 'bg-violet-900/30',
    },
    {
      href: '/dashboard/settings',
      icon: <Settings className="w-8 h-8" />,
      label: 'Settings',
      description: 'Configure shop',
      color: 'text-amber-400',
      bgColor: 'bg-amber-900/30',
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar shopName={shop.publicName} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {shop.publicName}! 👋
          </h1>
          <p className="text-slate-400">Manage your cryptocurrency e-commerce shop</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map((card, index) => (
            <div
              key={index}
              className={`group relative bg-linear-to-br ${card.color} rounded-lg p-5 text-white overflow-hidden transition hover:shadow-lg`}
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    {card.icon}
                  </div>
                  {card.copyable && copied === card.field ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : null}
                </div>

                <p className="text-white/80 text-xs font-medium mb-1">{card.label}</p>
                <p className="text-sm font-mono break-all mb-3">{card.value}</p>

                {card.copyable && (
                  <button
                    onClick={() => copyToClipboard(card.value, card.field)}
                    className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition"
                  >
                    <Copy className="w-3 h-3" />
                    {copied === card.field ? 'Copied!' : 'Copy'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-5">Quick Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                className="group bg-slate-800/50 rounded-lg p-6 border border-slate-700/50 hover:border-slate-600/50 transition"
              >
                <div
                  className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center ${action.color} mb-4 group-hover:scale-110 transition`}
                >
                  {action.icon}
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">
                  {action.label}
                </h3>
                <p className="text-slate-400 text-xs">{action.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shop Info Card */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
            <h3 className="text-white font-bold mb-4">📊 Shop Information</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                <span className="text-slate-400 text-sm">Public Name</span>
                <span className="text-white font-semibold text-sm">
                  {shop.publicName}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                <span className="text-slate-400 text-sm">Shop Slug</span>
                <span className="text-white font-mono text-xs">{shop.slug}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Cryptos Accepted</span>
                <span className="text-white font-semibold text-sm">5</span>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
            <h3 className="text-white font-bold mb-4">🚀 Status</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <span className="text-slate-400 text-sm">Telegram Bot</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-400 text-sm font-semibold">
                    Online
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <span className="text-slate-400 text-sm">Shop Status</span>
                <span className="text-emerald-400 text-sm font-semibold">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">2FA Status</span>
                <span className="text-amber-400 text-sm font-semibold">
                  Optional
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}