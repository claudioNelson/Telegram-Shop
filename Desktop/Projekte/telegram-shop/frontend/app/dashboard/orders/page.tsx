'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  unitPriceCents: number;
}

interface Order {
  id: number;
  customerId: number;
  totalAmountCents: number;
  currency: string;
  status: string;
  isDigital: boolean;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchShopAndOrders();
  }, []);

  const fetchShopAndOrders = async () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const shopRes = await fetch('http://localhost:3001/api/shops/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shopData = await shopRes.json();
      setShop(shopData);

      const ordersRes = await fetch(
        `http://localhost:3001/api/shops/${shopData.id}/orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const ordersData = await ordersRes.json();
      
      if (Array.isArray(ordersData)) {
        setOrders(ordersData);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Bestellungen</h1>

        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600">Noch keine Bestellungen</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">Order {order.id}</h3>
                    <p className="text-gray-600 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded text-sm font-medium bg-yellow-100">
                    {order.status}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">Items: {order.items.length}</p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold">
                    {(order.totalAmountCents / 100).toFixed(2)} {order.currency}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.isDigital ? 'Digital' : 'Physical'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}