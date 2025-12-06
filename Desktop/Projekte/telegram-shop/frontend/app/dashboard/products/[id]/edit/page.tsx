'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Check, Plus, Trash2 } from 'lucide-react';

interface Tier {
  id: number;
  minQuantity: number;
  maxQuantity: number | null;
  priceCents: number;
}

interface Product {
  id: number;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  isDigital: boolean;
  stockQuantity?: number;
  unit: string;
  tiers?: Tier[];
}

interface NewTier {
  id: string;
  minQuantity: number;
  maxQuantity: number | null;
  priceCents: number;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDigital, setIsDigital] = useState(false);
  const [unit, setUnit] = useState('PIECE');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceCents: '',
    stockQuantity: '',
  });

  const [tiers, setTiers] = useState<Tier[]>([]);
  const [newTiers, setNewTiers] = useState<NewTier[]>([]);
  const [newTier, setNewTier] = useState({
    minQuantity: '',
    maxQuantity: '',
    priceCents: '',
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shop, setShop] = useState<any>(null);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
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

      const productRes = await fetch(
        `http://localhost:3001/api/shops/${shopData.id}/products/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const productData = await productRes.json();

      setFormData({
        title: productData.title,
        description: productData.description,
        priceCents: (productData.priceCents / 100).toString(),
        stockQuantity: productData.stockQuantity?.toString() || '',
      });

      setIsDigital(productData.isDigital);
      setUnit(productData.unit || 'PIECE');
      setTiers(productData.tiers || []);

      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load product');
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddNewTier = () => {
    if (!newTier.minQuantity || !newTier.priceCents) {
      setError('Min Quantity und Price sind erforderlich');
      return;
    }

    const tier: NewTier = {
      id: Date.now().toString(),
      minQuantity: parseInt(newTier.minQuantity),
      maxQuantity: newTier.maxQuantity ? parseInt(newTier.maxQuantity) : null,
      priceCents: Math.round(parseFloat(newTier.priceCents) * 100),
    };

    setNewTiers([...newTiers, tier]);
    setNewTier({ minQuantity: '', maxQuantity: '', priceCents: '' });
    setError('');
  };

  const handleRemoveNewTier = (id: string) => {
    setNewTiers(newTiers.filter((t) => t.id !== id));
  };

  const handleRemoveExistingTier = (id: number) => {
    setTiers(tiers.filter((t) => t.id !== id));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const priceCents = Math.round(parseFloat(formData.priceCents) * 100);
      const stockQuantity = !isDigital ? parseInt(formData.stockQuantity) || 0 : null;

      const updateData = {
        title: formData.title,
        description: formData.description,
        priceCents,
        currency: 'EUR',
        isDigital,
        stockQuantity,
        unit,
        isActive: true,
      };

      const response = await fetch(
        `http://localhost:3001/api/shops/${shop.id}/products/${productId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) throw new Error('Failed to update product');

      if (newTiers.length > 0) {
        for (const tier of newTiers) {
          await fetch(`http://localhost:3001/api/product-tiers`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              productId: parseInt(productId),
              minQuantity: tier.minQuantity,
              maxQuantity: tier.maxQuantity,
              priceCents: tier.priceCents,
            }),
          });
        }
      }

      if (tiers.length > 0) {
        const originalTierIds = (await fetch(
          `http://localhost:3001/api/shops/${shop.id}/products/${productId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
          .then((r) => r.json())
          .then((p) => p.tiers?.map((t: any) => t.id) || [])) as number[];

        for (const originalId of originalTierIds) {
          if (!tiers.find((t) => t.id === originalId)) {
            await fetch(`http://localhost:3001/api/product-tiers/${originalId}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        }
      }

      setSuccess('Product updated successfully!');
      setTimeout(() => router.push('/dashboard/products'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setDeleting(true);
    setError('');

    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/shops/${shop.id}/products/${productId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Failed to delete product');

      setSuccess('Product deleted successfully!');
      setTimeout(() => router.push('/dashboard/products'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-white">Edit Product</h1>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-800 text-red-100 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-900 border border-emerald-800 text-emerald-100 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-8">
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
                />
              </div>

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
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-3">
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
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
            <h2 className="text-xl font-bold text-white mb-6">Tiered Pricing</h2>

            {tiers.length > 0 && (
              <div className="mb-8 space-y-3">
                <h3 className="text-slate-300 font-semibold mb-4">Existing Tiers:</h3>
                {tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="bg-slate-800 border border-slate-700 rounded p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {tier.minQuantity}-{tier.maxQuantity ? tier.maxQuantity : '∞'} {unit}
                      </p>
                      <p className="text-emerald-400 text-sm">
                        {(tier.priceCents / 100).toFixed(2)}€ per {unit}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingTier(tier.id)}
                      className="p-2 text-slate-400 hover:text-red-400 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {newTiers.length > 0 && (
              <div className="mb-8 space-y-3">
                <h3 className="text-slate-300 font-semibold mb-4">New Tiers:</h3>
                {newTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="bg-slate-800 border border-slate-700 rounded p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {tier.minQuantity}-{tier.maxQuantity ? tier.maxQuantity : '∞'} {unit}
                      </p>
                      <p className="text-emerald-400 text-sm">
                        {(tier.priceCents / 100).toFixed(2)}€ per {unit}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveNewTier(tier.id)}
                      className="p-2 text-slate-400 hover:text-red-400 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

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
                    Max Quantity
                  </label>
                  <input
                    type="number"
                    value={newTier.maxQuantity}
                    onChange={(e) =>
                      setNewTier({ ...newTier, maxQuantity: e.target.value })
                    }
                    min="1"
                    className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded text-sm focus:outline-none focus:border-emerald-600"
                    placeholder="Leave empty for unlimited"
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
                onClick={handleAddNewTier}
                className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded font-medium transition"
              >
                <Plus size={18} />
                Add Tier
              </button>
            </div>
          </div>

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
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white py-2 px-4 rounded font-medium transition"
            >
              {saving ? 'Updating...' : (
                <>
                  <Check size={18} />
                  Update Product
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 bg-red-900 hover:bg-red-800 disabled:opacity-50 text-red-100 py-2 px-4 rounded font-medium transition"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}