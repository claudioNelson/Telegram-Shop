'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Shop {
  id: number;
  publicName: string;
  slug: string;
  btcAddress?: string;
  ethAddress?: string;
}

export default function DashboardPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    console.log('Dashboard mounted');
    const token = localStorage.getItem('accessToken');
    console.log('Token:', token);

    if (!token) {
      console.log('No token, redirecting to login');
      router.push('/login');
      return;
    }

    fetchShop(token);
  }, [router]);

  const fetchShop = async (token: string) => {
    try {
      console.log('Fetching shop...');
      const response = await fetch('http://localhost:3001/api/shops/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Shop data:', data);
      
      setShop(data);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  if (!shop) {
    return <div className="p-8">Shop not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Telegram Shop</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </nav>

<div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">Welcome, {shop.publicName}!</h2>

        <div className="space-y-4">
          <a href="/dashboard/products" className="block bg-white p-6 rounded-lg shadow">
            Produkte
          </a>

          <a href="/dashboard/orders" className="block bg-white p-6 rounded-lg shadow">
            Bestellungen
          </a>
        </div>
      </div>
    </div>
  );
}