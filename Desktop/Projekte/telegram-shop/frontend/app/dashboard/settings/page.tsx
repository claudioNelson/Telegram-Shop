'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';

interface Shop {
  id: number;
  btcAddress?: string;
  ethAddress?: string;
  ltcAddress?: string;
  usdtAddress?: string;
  xmrAddress?: string;
}

interface TwoFaStatus {
  enabled: boolean;
  hasPublicKey: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [shop, setShop] = useState<Shop | null>(null);
  const [twoFaStatus, setTwoFaStatus] = useState<TwoFaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Wallet States
  const [btcAddress, setBtcAddress] = useState('');
  const [ethAddress, setEthAddress] = useState('');
  const [ltcAddress, setLtcAddress] = useState('');
  const [usdtAddress, setUsdtAddress] = useState('');
  const [xmrAddress, setXmrAddress] = useState('');
  const [savingWallets, setSavingWallets] = useState(false);

  // 2FA States
  const [publicKey, setPublicKey] = useState('');
  const [publicKeyFile, setPublicKeyFile] = useState<File | null>(null);
  const [uploadingKey, setUploadingKey] = useState(false);
  const [disabling2Fa, setDisabling2Fa] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchSettings(token);
  }, [router]);

  const fetchSettings = async (token: string) => {
    try {
      // Fetch Shop
      const shopRes = await fetch('http://localhost:3001/api/shops/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shopData = await shopRes.json();
      setShop(shopData);
      setBtcAddress(shopData.btcAddress || '');
      setEthAddress(shopData.ethAddress || '');
      setLtcAddress(shopData.ltcAddress || '');
      setUsdtAddress(shopData.usdtAddress || '');
      setXmrAddress(shopData.xmrAddress || '');

      // Fetch 2FA Status
      const twoFaRes = await fetch('http://localhost:3001/api/two-fa/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const twoFaData = await twoFaRes.json();
      setTwoFaStatus(twoFaData.data);

      setLoading(false);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to load settings');
      setLoading(false);
    }
  };

  const handleSaveWallets = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWallets(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:3001/api/shops/${shop?.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            btcAddress,
            ethAddress,
            ltcAddress,
            usdtAddress,
            xmrAddress,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to save wallets');

      setSuccess('Wallet addresses saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save wallets');
    } finally {
      setSavingWallets(false);
    }
  };

  const handlePublicKeyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPublicKeyFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPublicKey(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleUploadPublicKey = async () => {
    if (!publicKey.trim()) {
      setError('Please provide a PGP public key');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('No authentication token found. Please login again.');
      return;
    }

    setUploadingKey(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:3001/api/two-fa/upload-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ publicKey }),
      });

      if (!response.ok) throw new Error('Failed to upload public key');

      setSuccess('PGP Public Key uploaded successfully! 2FA is now enabled.');
      setPublicKey('');
      setPublicKeyFile(null);

      // Refresh 2FA status
      const token2 = localStorage.getItem('accessToken');
      const twoFaRes = await fetch('http://localhost:3001/api/two-fa/status', {
        headers: { Authorization: `Bearer ${token2}` },
      });
      const twoFaData = await twoFaRes.json();
      setTwoFaStatus(twoFaData.data);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload public key');
    } finally {
      setUploadingKey(false);
    }
  };

  const handleDisable2Fa = async () => {
    if (!confirm('Are you sure you want to disable 2FA?')) return;

    setDisabling2Fa(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3001/api/two-fa/disable', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to disable 2FA');

      setSuccess('2FA disabled successfully');

      // Refresh 2FA status
      const token2 = localStorage.getItem('accessToken');
      const twoFaRes = await fetch('http://localhost:3001/api/two-fa/status', {
        headers: { Authorization: `Bearer ${token2}` },
      });
      const twoFaData = await twoFaRes.json();
      setTwoFaStatus(twoFaData.data);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to disable 2FA');
    } finally {
      setDisabling2Fa(false);
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-800 text-red-100 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-900 border border-emerald-800 text-emerald-100 rounded-lg">
            {success}
          </div>
        )}

        {/* Wallet Management Section */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-lg mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">💰 Wallet Addresses</h2>
          <form onSubmit={handleSaveWallets} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Bitcoin Address
              </label>
              <input
                type="text"
                value={btcAddress}
                onChange={(e) => setBtcAddress(e.target.value)}
                placeholder="Your BTC address"
                className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Ethereum Address
              </label>
              <input
                type="text"
                value={ethAddress}
                onChange={(e) => setEthAddress(e.target.value)}
                placeholder="Your ETH address"
                className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Litecoin Address
              </label>
              <input
                type="text"
                value={ltcAddress}
                onChange={(e) => setLtcAddress(e.target.value)}
                placeholder="Your LTC address"
                className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                USDT Address
              </label>
              <input
                type="text"
                value={usdtAddress}
                onChange={(e) => setUsdtAddress(e.target.value)}
                placeholder="Your USDT address"
                className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Monero Address
              </label>
              <input
                type="text"
                value={xmrAddress}
                onChange={(e) => setXmrAddress(e.target.value)}
                placeholder="Your XMR address"
                className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={savingWallets}
              className="flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white px-6 py-2 rounded font-medium transition"
            >
              {savingWallets ? 'Saving...' : (
                <>
                  <Check size={18} />
                  Save Wallets
                </>
              )}
            </button>
          </form>
        </div>

        {/* 2FA Section */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-6">🔐 Two-Factor Authentication (PGP)</h2>

          {twoFaStatus && (
            <div className="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-lg">
              <p className="text-sm text-slate-300">
                <strong>Status:</strong>{' '}
                {twoFaStatus.enabled ? (
                  <span className="text-emerald-400">✓ Enabled</span>
                ) : (
                  <span className="text-red-400">✗ Disabled</span>
                )}
              </p>
              {twoFaStatus.hasPublicKey && (
                <p className="text-sm mt-2 text-slate-300">
                  <strong>Public Key:</strong> <span className="text-emerald-400">✓ Configured</span>
                </p>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                PGP Public Key
              </label>
              <input
                type="file"
                accept=".asc,.pub,.txt"
                onChange={handlePublicKeyFileChange}
                className="w-full bg-slate-800 border border-slate-700 text-slate-300 px-4 py-2 rounded"
              />
              <p className="text-xs text-slate-400 mt-2">
                Or paste your PGP public key below:
              </p>
              <textarea
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="Paste your PGP public key here (-----BEGIN PGP PUBLIC KEY BLOCK-----)"
                className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded h-40 font-mono text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleUploadPublicKey}
                disabled={uploadingKey || !publicKey.trim()}
                className="flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white px-6 py-2 rounded font-medium transition"
              >
                {uploadingKey ? 'Uploading...' : (
                  <>
                    <Check size={18} />
                    Upload Public Key
                  </>
                )}
              </button>

              {twoFaStatus?.enabled && (
                <button
                  onClick={handleDisable2Fa}
                  disabled={disabling2Fa}
                  className="bg-red-900 hover:bg-red-800 disabled:opacity-50 text-red-100 px-6 py-2 rounded font-medium transition"
                >
                  {disabling2Fa ? 'Disabling...' : 'Disable 2FA'}
                </button>
              )}
            </div>

            <div className="bg-slate-800 p-4 rounded-lg text-sm text-slate-300">
              <p className="font-semibold text-white mb-2">How PGP 2FA works:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Upload your PGP public key here</li>
                <li>When you login, you'll receive an encrypted challenge</li>
                <li>Decrypt the challenge with your private key</li>
                <li>Sign the decrypted challenge</li>
                <li>Send the signature back to complete login</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}