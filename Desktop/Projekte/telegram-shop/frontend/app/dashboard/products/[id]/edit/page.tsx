'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceEur, setPriceEur] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchProduct(token);
  }, []);

  const fetchProduct = async (token: string) => {
    try {
      const shopRes = await fetch('http://localhost:3001/api/shops/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shop = await shopRes.json();

      const productRes = await fetch(
        `http://localhost:3001/api/shops/${shop.id}/products/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await productRes.json();
      
      setTitle(data.title);
      setDescription(data.description);
      setPriceEur((data.priceCents / 100).toString());
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('accessToken');
      const shopRes = await fetch('http://localhost:3001/api/shops/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shop = await shopRes.json();

      const priceCents = Math.round(parseFloat(priceEur) * 100);

      await fetch(
        `http://localhost:3001/api/shops/${shop.id}/products/${productId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, description, priceCents, currency: 'EUR' }),
        }
      );

      router.push('/dashboard/products');
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-8">Edit</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border rounded-lg h-32" required />
          <input type="number" step="0.01" value={priceEur} onChange={(e) => setPriceEur(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}