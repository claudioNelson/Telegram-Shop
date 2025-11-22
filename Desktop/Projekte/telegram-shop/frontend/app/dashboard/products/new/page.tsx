'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceEur, setPriceEur] = useState('');
  const [isDigital, setIsDigital] = useState(false);
  const [stockQuantity, setStockQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      const shopRes = await fetch('http://localhost:3001/api/shops/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shop = await shopRes.json();

      const priceCents = Math.round(parseFloat(priceEur) * 100);

      const response = await fetch(
        `http://localhost:3001/api/shops/${shop.id}/products`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            priceCents,
            currency: 'EUR',
            isDigital,
            stockQuantity: isDigital ? null : parseInt(stockQuantity || '0'),
            isActive: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      router.push('/dashboard/products');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-8">Neues Produkt</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Titel</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Beschreibung</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg h-32"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Preis EUR</label>
            <input
              type="number"
              step="0.01"
              value={priceEur}
              onChange={(e) => setPriceEur(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isDigital}
              onChange={(e) => setIsDigital(e.target.checked)}
              className="mr-2"
            />
            <label className="text-sm font-medium">Digital</label>
          </div>

          {!isDigital && (
            <div>
              <label className="block text-sm font-medium mb-2">Stock</label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
          )}

          {error && <div className="text-red-500">{error}</div>}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
            <a href="/dashboard/products" className="bg-gray-600 text-white px-6 py-2 rounded">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}