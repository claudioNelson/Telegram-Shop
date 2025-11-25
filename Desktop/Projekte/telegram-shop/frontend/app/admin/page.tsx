'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Calendar,
  BarChart3,
  DollarSign,
  LogOut,
  Settings,
  Users,
  Package,
  CreditCard,
  ArrowUpRight,
} from 'lucide-react';

interface Revenue {
  totalCents: number;
  totalEur: string;
  count: number;
}

interface StatCard {
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  gradient: string;
  trend?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('Admin');

  const [dailyRevenue, setDailyRevenue] = useState<Revenue | null>(null);
  const [weeklyRevenue, setWeeklyRevenue] = useState<Revenue | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<Revenue | null>(null);
  const [yearlyRevenue, setYearlyRevenue] = useState<Revenue | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      router.push('/admin-login');
      return;
    }

    try {
      const userData = JSON.parse(user);
      if (userData.role !== 'ADMIN') {
        router.push('/admin-login');
        return;
      }
      setUserName(userData.email?.split('@')[0] || 'Admin');
    } catch {
      router.push('/admin-login');
      return;
    }

    fetchRevenueStats(token);
  }, [router]);

  const fetchRevenueStats = async (token: string) => {
    try {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;

      const [daily, weekly, monthly, yearly] = await Promise.all([
        fetch(`http://localhost:3001/api/commissions/revenue/daily`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => (r.ok ? r.json() : null)),
        fetch(`http://localhost:3001/api/commissions/revenue/weekly`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => (r.ok ? r.json() : null)),
        fetch(
          `http://localhost:3001/api/commissions/revenue/monthly/${currentYear}/${currentMonth}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ).then((r) => (r.ok ? r.json() : null)),
        fetch(
          `http://localhost:3001/api/commissions/revenue/yearly/${currentYear}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ).then((r) => (r.ok ? r.json() : null)),
      ]);

      setDailyRevenue(daily);
      setWeeklyRevenue(weekly);
      setMonthlyRevenue(monthly);
      setYearlyRevenue(yearly);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError('Failed to load revenue statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/admin-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <p className="text-slate-300 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards: StatCard[] = [
    {
      label: 'Today',
      value: `€${dailyRevenue?.totalEur || '0.00'}`,
      subtext: `${dailyRevenue?.count || 0} orders`,
      icon: <Calendar className="w-8 h-8" />,
      gradient: 'from-blue-600 to-blue-700',
      trend: '+12%',
    },
    {
      label: 'This Week',
      value: `€${weeklyRevenue?.totalEur || '0.00'}`,
      subtext: `${weeklyRevenue?.count || 0} orders`,
      icon: <BarChart3 className="w-8 h-8" />,
      gradient: 'from-emerald-600 to-emerald-700',
      trend: '+24%',
    },
    {
      label: 'This Month',
      value: `€${monthlyRevenue?.totalEur || '0.00'}`,
      subtext: `${monthlyRevenue?.count || 0} orders`,
      icon: <TrendingUp className="w-8 h-8" />,
      gradient: 'from-violet-600 to-violet-700',
      trend: '+18%',
    },
    {
      label: 'This Year',
      value: `€${yearlyRevenue?.totalEur || '0.00'}`,
      subtext: `${yearlyRevenue?.count || 0} orders`,
      icon: <DollarSign className="w-8 h-8" />,
      gradient: 'from-amber-600 to-amber-700',
      trend: '+42%',
    },
  ];

  const quickActions = [
    {
      icon: <Users className="w-6 h-6" />,
      label: 'Manage Shops',
      description: 'View all shops',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/30',
    },
    {
      icon: <Package className="w-6 h-6" />,
      label: 'Manage Packages',
      description: 'SaaS plans',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-900/30',
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      label: 'Commissions',
      description: 'Payouts',
      color: 'text-violet-400',
      bgColor: 'bg-violet-900/30',
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Admin Panel</h1>
              <p className="text-slate-400 text-xs">Welcome, {userName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition">
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 rounded-lg transition text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-800/50 text-red-400 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, index) => (
            <div
              key={index}
              className={`group relative bg-linear-to-br ${card.gradient} rounded-lg p-4 text-white overflow-hidden transition hover:shadow-lg`}
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-1.5 bg-white/20 rounded-md">
                    {card.icon}
                  </div>
                  <div className="flex items-center gap-0.5 text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-2.5 h-2.5" />
                    {card.trend}
                  </div>
                </div>

                <p className="text-white/90 text-xs font-medium mb-0.5">{card.label}</p>
                <p className="text-2xl font-bold mb-1">{card.value}</p>
                <p className="text-white/70 text-xs">{card.subtext}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Revenue Overview */}
          <div className="lg:col-span-2 bg-slate-800/50 rounded-lg p-6 border border-slate-700/50 shadow-sm">
            <h2 className="text-white text-lg font-bold mb-5">Revenue Overview</h2>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              {/* Daily */}
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:border-blue-500/50 transition">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-900/40 rounded-md">
                    <Calendar className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="text-slate-300 text-xs font-semibold">Daily</h3>
                </div>
                <p className="text-white text-lg font-bold">
                  €{dailyRevenue?.totalEur || '0.00'}
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  {dailyRevenue?.count || 0} orders
                </p>
              </div>

              {/* Weekly */}
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:border-emerald-500/50 transition">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-emerald-900/40 rounded-md">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-slate-300 text-xs font-semibold">Weekly</h3>
                </div>
                <p className="text-white text-lg font-bold">
                  €{weeklyRevenue?.totalEur || '0.00'}
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  {weeklyRevenue?.count || 0} orders
                </p>
              </div>

              {/* Monthly */}
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:border-violet-500/50 transition">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-violet-900/40 rounded-md">
                    <TrendingUp className="w-4 h-4 text-violet-400" />
                  </div>
                  <h3 className="text-slate-300 text-xs font-semibold">Monthly</h3>
                </div>
                <p className="text-white text-lg font-bold">
                  €{monthlyRevenue?.totalEur || '0.00'}
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  {monthlyRevenue?.count || 0} orders
                </p>
              </div>

              {/* Yearly */}
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:border-amber-500/50 transition">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-amber-900/40 rounded-md">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="text-slate-300 text-xs font-semibold">Yearly</h3>
                </div>
                <p className="text-white text-lg font-bold">
                  €{yearlyRevenue?.totalEur || '0.00'}
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  {yearlyRevenue?.count || 0} orders
                </p>
              </div>
            </div>
          </div>

          {/* Stats Summary Card */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50 shadow-sm">
            <h3 className="text-white text-sm font-bold mb-4">Quick Stats</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                <span className="text-slate-400 text-xs">Avg. Daily</span>
                <span className="text-white font-semibold text-sm">
                  €{dailyRevenue ? (parseInt(dailyRevenue.totalEur) / 7).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                <span className="text-slate-400 text-xs">Conversion</span>
                <span className="text-emerald-400 font-semibold text-sm">3.2%</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                <span className="text-slate-400 text-xs">Total Shops</span>
                <span className="text-white font-semibold text-sm">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">Health</span>
                <span className="text-blue-400 font-semibold text-sm">99.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href="#"
              className="group bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600/50 transition shadow-sm"
            >
              <div
                className={`w-10 h-10 ${action.bgColor} rounded-lg flex items-center justify-center ${action.color} mb-3 group-hover:scale-110 transition`}
              >
                {action.icon}
              </div>
              <h3 className="text-white font-semibold text-sm mb-0.5">{action.label}</h3>
              <p className="text-slate-400 text-xs">{action.description}</p>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}