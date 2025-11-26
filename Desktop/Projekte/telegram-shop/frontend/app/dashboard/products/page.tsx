'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';

interface Product {
  id: number;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  isDigital: boolean;
  stockQuantity?: number;
  isActive: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchShopAndProducts();
  }, []);

  const fetchShopAndProducts = async () => {
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

      const productsRes = await fetch(
        `http://localhost:3001/api/shops/${shopData.id}/products`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const productsData = await productsRes.json();
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: number) => {
    const token = localStorage.getItem('accessToken');
    if (!confirm('Delete this product?')) return;

    try {
      await fetch(
        `http://localhost:3001/api/shops/${shop.id}/products/${productId}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(products.filter((p) => p.id !== productId));
    } catch (error) {
      console.error('Error:', error);
    }
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
              title="Back to dashboard"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-white">Products</h1>
          </div>
          <button
            onClick={() => router.push('/dashboard/products/new')}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded transition"
          >
            <Plus size={18} />
            New Product
          </button>
        </div>

        {products.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded p-8 text-center">
            <p className="text-slate-400 mb-4">No products yet</p>
            <button
              onClick={() => router.push('/dashboard/products/new')}
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded transition"
            >
              <Plus size={18} />
              Create your first product
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-slate-900 border border-slate-800 rounded p-4 hover:bg-slate-800 transition"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div>
                        <p className="text-white font-semibold">{product.title}</p>
                        <p className="text-slate-400 text-sm line-clamp-1">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mr-4">
                    <div className="flex gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          product.isDigital
                            ? 'bg-blue-900 text-blue-100'
                            : 'bg-slate-700 text-slate-100'
                        }`}
                      >
                        {product.isDigital ? 'Digital' : 'Physical'}
                      </span>
                      {!product.isDigital && product.stockQuantity !== undefined && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-slate-700 text-slate-100">
                          Stock: {product.stockQuantity}
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-white font-bold">
                        {(product.priceCents / 100).toFixed(2)} {product.currency}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
                      title="Edit product"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition"
                      title="Delete product"
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