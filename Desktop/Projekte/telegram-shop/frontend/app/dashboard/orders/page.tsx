'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Trash2, ArrowLeft } from 'lucide-react';

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
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
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

      const ordersRes = await fetch(
        `http://localhost:3001/api/shops/${shopData.id}/orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const ordersData = await ordersRes.json();
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-slate-700 text-slate-100',
      completed: 'bg-emerald-900 text-emerald-100',
      cancelled: 'bg-red-900 text-red-100',
    };
    return colors[status.toLowerCase()] || 'bg-slate-700 text-slate-100';
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
            title="Back to dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded p-8 text-center">
            <p className="text-slate-400">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-slate-900 border border-slate-800 rounded p-4 hover:bg-slate-800 transition"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-white font-semibold">Order #{order.id}</p>
                        <p className="text-slate-400 text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mr-4">
                    <div className="text-right">
                      <p className="text-white font-bold">
                        {(order.totalAmountCents / 100).toFixed(2)} {order.currency}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
                      title="View details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this order?')) {
                          setOrders(orders.filter((o) => o.id !== order.id));
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition"
                      title="Delete order"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}