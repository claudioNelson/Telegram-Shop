'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

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

  if (loading) return <div className="p-8">Loading...</div>;
  if (!shop) return <div className="p-8">Shop not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar shopName={shop.publicName} />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Welcome back, {shop.publicName}!</h1>
        <p className="text-gray-600 mb-12">Manage your shop</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
            <p className="text-gray-600 text-sm">Shop Slug</p>
            <p className="text-2xl font-bold mt-2">{shop.slug}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-600">
            <p className="text-gray-600 text-sm">Bitcoin</p>
            <p className="text-sm font-mono mt-2 truncate">{shop.btcAddress || 'Not set'}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-600">
            <p className="text-gray-600 text-sm">Ethereum</p>
            <p className="text-sm font-mono mt-2 truncate">{shop.ethAddress || 'Not set'}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-600">
            <p className="text-gray-600 text-sm">Bot Status</p>
            <p className="text-2xl font-bold mt-2 text-green-600">Active</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <a href="/dashboard/products" className="bg-white p-8 rounded-lg shadow hover:shadow-xl">
            <h3 className="text-xl font-bold mb-2">📦 Products</h3>
            <p className="text-gray-600">Manage products</p>
          </a>
          <a href="/dashboard/orders" className="bg-white p-8 rounded-lg shadow hover:shadow-xl">
            <h3 className="text-xl font-bold mb-2">📋 Orders</h3>
            <p className="text-gray-600">View orders</p>
          </a>
          <a href="/dashboard/bots" className="bg-white p-8 rounded-lg shadow hover:shadow-xl">
            <h3 className="text-xl font-bold mb-2">🤖 Bot Manager</h3>
            <p className="text-gray-600">Manage bots</p>
          </a>
          <a href="/dashboard/settings" className="bg-white p-8 rounded-lg shadow hover:shadow-xl">
            <h3 className="text-xl font-bold mb-2">⚙️ Settings</h3>
            <p className="text-gray-600">Configure</p>
          </a>
        </div>
      </div>
    </div>
  );
}