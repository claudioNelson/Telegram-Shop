'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';

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
  const [shop, setShop] = useState(null as any);
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
      
      if (Array.isArray(productsData)) {
        setProducts(productsData);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error:', error);
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
      setProducts(products.filter((p: Product) => p.id !== productId));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar shopName={shop?.publicName} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Products</h1>
            <p className="text-gray-600">Manage your product catalog</p>
          </div>
          <a href="/dashboard/products/new" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
            Create Product
          </a>
        </div>

        {products.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-600 mb-6">No products yet</p>
            <a href="/dashboard/products/new" className="text-blue-600 hover:underline font-medium">
              Create your first product
            </a>
          </div>
        ) : (
          <div className="grid gap-4">
            {products.map((product: Product) => (
              <div key={product.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">{product.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                  <div className="flex gap-6 text-sm">
                    <span className="font-medium">{(product.priceCents / 100).toFixed(2)} EUR</span>
                    <span className="text-gray-600">{product.isDigital ? 'Digital' : 'Physical'}</span>
                    {product.stockQuantity && <span className="text-gray-600">Stock: {product.stockQuantity}</span>}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <a href={`/dashboard/products/${product.id}/edit`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm">
                    Edit
                  </a>
                  <button onClick={() => handleDelete(product.id)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}