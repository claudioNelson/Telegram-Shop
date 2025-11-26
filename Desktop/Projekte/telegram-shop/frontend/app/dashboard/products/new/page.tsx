'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';

export default function CreateProductPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDigital, setIsDigital] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceCents: '',
    stockQuantity: '',
  });

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const shopRes = await fetch('http://localhost:3001/api/shops/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shop = await shopRes.json();

      const priceCents = Math.round(parseFloat(formData.priceCents) * 100);
      const stockQuantity = !isDigital
        ? parseInt(formData.stockQuantity) || 0
        : null;

      const res = await fetch(
        `http://localhost:3001/api/shops/${shop.id}/products`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            priceCents,
            currency: 'EUR',
            isDigital,
            stockQuantity,
            isActive: true,
          }),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to create product');
      }

      router.push('/dashboard/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-white">Create Product</h1>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-800 text-red-100 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titel */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600"
              placeholder="e.g. Banana"
            />
          </div>

          {/* Beschreibung */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600 resize-none"
              placeholder="Describe your product..."
            />
          </div>

          {/* Preis */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Price (EUR)
            </label>
            <input
              type="number"
              name="priceCents"
              value={formData.priceCents}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600"
              placeholder="e.g. 19.99"
            />
          </div>

          {/* Digital/Physical Toggle */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-3">
              Product Type
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsDigital(false)}
                className={`flex-1 py-2 px-4 rounded font-medium transition ${
                  !isDigital
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                }`}
              >
                Physical
              </button>
              <button
                type="button"
                onClick={() => setIsDigital(true)}
                className={`flex-1 py-2 px-4 rounded font-medium transition ${
                  isDigital
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                }`}
              >
                Digital
              </button>
            </div>
          </div>

          {/* Stock (nur bei Physical) */}
          {!isDigital && (
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                required
                min="0"
                className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600"
                placeholder="e.g. 100"
              />
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white py-2 px-4 rounded font-medium transition"
            >
              {loading ? 'Creating...' : (
                <>
                  <Check size={18} />
                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}