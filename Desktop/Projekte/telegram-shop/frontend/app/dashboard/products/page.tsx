'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const productsData = await productsRes.json();
    console.log('Products response:', productsData);
    
    // Stelle sicher dass es ein Array ist
    if (Array.isArray(productsData)) {
      setProducts(productsData);
    } else {
      console.error('Products is not an array:', productsData);
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
    
    try {
      await fetch(
        `http://localhost:3001/api/shops/${shop.id}/products/${productId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProducts(products.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Produkte</h1>
          <a href="/dashboard/products/new" className="bg-blue-600 text-white px-4 py-2 rounded">
            Neues Produkt
          </a>
        </div>

        {products.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600">Keine Produkte</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {products.map(product => (
              <div key={product.id} className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">{product.title}</h3>
                  <p>{(product.priceCents / 100).toFixed(2)} {product.currency}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDelete(product.id)} className="bg-red-600 text-white px-3 py-1 rounded">
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
