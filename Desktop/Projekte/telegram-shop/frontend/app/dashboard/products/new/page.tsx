'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Plus, Trash2 } from 'lucide-react';

interface Tier {
  id: string; // temp id für frontend
  minQuantity: number;
  maxQuantity: number | null;
  priceCents: number;
}

export default function CreateProductPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDigital, setIsDigital] = useState(false);
  const [unit, setUnit] = useState('PIECE');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceCents: '',
    stockQuantity: '',
  });
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [newTier, setNewTier] = useState({
    minQuantity: '',
    maxQuantity: '',
    priceCents: '',
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

  const handleAddTier = () => {
    if (!newTier.minQuantity || !newTier.priceCents) {
      setError('Min Quantity und Price sind erforderlich');
      return;
    }

    const tier: Tier = {
      id: Date.now().toString(),
      minQuantity: parseInt(newTier.minQuantity),
      maxQuantity: newTier.maxQuantity ? parseInt(newTier.maxQuantity) : null,
      priceCents: Math.round(parseFloat(newTier.priceCents) * 100),
    };

    setTiers([...tiers, tier]);
    setNewTier({ minQuantity: '', maxQuantity: '', priceCents: '' });
    setError('');
  };

  const handleRemoveTier = (id: string) => {
    setTiers(tiers.filter((t) => t.id !== id));
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
            unit,
            isActive: true,
            tiers: tiers.map((t) => ({
              minQuantity: t.minQuantity,
              maxQuantity: t.maxQuantity,
              priceCents: t.priceCents,
            })),
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
      <div className="max-w-3xl mx-auto">
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
            <h2 className="text-xl font-bold text-white mb-6">Product Details</h2>
            
            <div className="space-y-6">
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
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600"
                  placeholder="e.g. Banana"
                />
              </div>

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
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600 resize-none"
                  placeholder="Describe your product..."
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Price (EUR) - Base Price
                </label>
                <input
                  type="number"
                  name="priceCents"
                  value={formData.priceCents}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600"
                  placeholder="e.g. 19.99"
                />
                <p className="text-slate-400 text-xs mt-2">
                  This is the base price for quantity 1. Add tiers below for bulk discounts.
                </p>
              </div>

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
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
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
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    Digital
                  </button>
                </div>
              </div>

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
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600"
                    placeholder="e.g. 100"
                  />
                </div>
              )}
            </div>
          </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600"
              >
                <option value="PIECE">Piece</option>
                <option value="GRAM">Gram</option>
                <option value="KG">Kilogram</option>
                <option value="ML">Milliliter</option>
                <option value="L">Liter</option>
                <option value="TABLET">Tablet</option>
                <option value="PILL">Pill</option>
                <option value="BOX">Box</option>
                <option value="PACK">Pack</option>
              </select>
            </div>

          {/* Tiered Pricing Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
            <h2 className="text-xl font-bold text-white mb-6">Tiered Pricing (Optional)</h2>
            <p className="text-slate-400 text-sm mb-6">
              Add bulk pricing tiers. For example: 5-9 units = 15€, 10+ units = 12€
            </p>

            {/* Existing Tiers */}
            {tiers.length > 0 && (
              <div className="mb-8 space-y-3">
                {tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="bg-slate-800 border border-slate-700 rounded p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {tier.minQuantity}-{tier.maxQuantity ? tier.maxQuantity : '∞'} units
                      </p>
                      <p className="text-emerald-400 text-sm">
                        {(tier.priceCents / 100).toFixed(2)}€ per unit
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(tier.id)}
                      className="p-2 text-slate-400 hover:text-red-400 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Tier */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
              <p className="text-slate-300 font-medium">Add a New Tier:</p>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-2">
                    Min Quantity
                  </label>
                  <input
                    type="number"
                    value={newTier.minQuantity}
                    onChange={(e) =>
                      setNewTier({ ...newTier, minQuantity: e.target.value })
                    }
                    min="1"
                    className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded text-sm focus:outline-none focus:border-emerald-600"
                    placeholder="e.g. 5"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-2">
                    Max Quantity (leave empty = unlimited)
                  </label>
                  <input
                    type="number"
                    value={newTier.maxQuantity}
                    onChange={(e) =>
                      setNewTier({ ...newTier, maxQuantity: e.target.value })
                    }
                    min="1"
                    className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded text-sm focus:outline-none focus:border-emerald-600"
                    placeholder="e.g. 9"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-2">
                    Price (EUR)
                  </label>
                  <input
                    type="number"
                    value={newTier.priceCents}
                    onChange={(e) =>
                      setNewTier({ ...newTier, priceCents: e.target.value })
                    }
                    step="0.01"
                    min="0"
                    className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded text-sm focus:outline-none focus:border-emerald-600"
                    placeholder="e.g. 15.99"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddTier}
                className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded font-medium transition"
              >
                <Plus size={18} />
                Add Tier
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
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