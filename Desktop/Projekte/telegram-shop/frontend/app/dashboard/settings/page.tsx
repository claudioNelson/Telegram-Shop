'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Shop {
  id: number;
  publicName: string;
  slug: string;
  btcAddress?: string;
  ethAddress?: string;
  ltcAddress?: string;
  usdtAddress?: string;
  xmrAddress?: string;
}

export default function SettingsPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [btc, setBtc] = useState('');
  const [eth, setEth] = useState('');
  const [ltc, setLtc] = useState('');
  const [usdt, setUsdt] = useState('');
  const [xmr, setXmr] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchShop();
  }, []);

  const fetchShop = async () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/shops/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shopData = await response.json();
      
      setShop(shopData);
      setBtc(shopData.btcAddress || '');
      setEth(shopData.ethAddress || '');
      setLtc(shopData.ltcAddress || '');
      setUsdt(shopData.usdtAddress || '');
      setXmr(shopData.xmrAddress || '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`http://localhost:3001/api/shops/${shop?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          btcAddress: btc,
          ethAddress: eth,
          ltcAddress: ltc,
          usdtAddress: usdt,
          xmrAddress: xmr,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {success && <div className="bg-green-100 p-4 rounded-lg mb-6">{success}</div>}
        {error && <div className="bg-red-100 p-4 rounded-lg mb-6">{error}</div>}

        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-6">Wallet Addresses</h2>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Bitcoin Address</label>
              <input
                type="text"
                value={btc}
                onChange={(e) => setBtc(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ethereum Address</label>
              <input
                type="text"
                value={eth}
                onChange={(e) => setEth(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Litecoin Address</label>
              <input
                type="text"
                value={ltc}
                onChange={(e) => setLtc(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">USDT Address</label>
              <input
                type="text"
                value={usdt}
                onChange={(e) => setUsdt(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Monero Address</label>
              <input
                type="text"
                value={xmr}
                onChange={(e) => setXmr(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Addresses'}
            </button>
          </form>
        </div>

        <a href="/dashboard" className="text-blue-600 hover:underline mt-8 block">
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}