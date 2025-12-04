'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Wallet, Bell, AlertTriangle, MessageSquare, Lock } from 'lucide-react';

interface Shop {
  id: number;
  btcAddress?: string;
  ethAddress?: string;
  ltcAddress?: string;
  usdtAddress?: string;
  xmrAddress?: string;
  notificationsEnabled?: boolean;
  notificationEmail?: string;
  notifyOnOrder?: boolean;
  notifyOnLowStock?: boolean;
  lowStockThreshold?: number;
  botWelcomeMessage?: string;
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

  // Notification States
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [notifyOnOrder, setNotifyOnOrder] = useState(true);
  const [notifyOnLowStock, setNotifyOnLowStock] = useState(true);
  const [savingNotifications, setSavingNotifications] = useState(false);

  // Stock Warning States
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [savingStock, setSavingStock] = useState(false);

  // Bot Settings States
  const [botWelcomeMessage, setBotWelcomeMessage] = useState('');
  const [savingBot, setSavingBot] = useState(false);

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
      setNotificationsEnabled(shopData.notificationsEnabled || false);
      setNotificationEmail(shopData.notificationEmail || '');
      setNotifyOnOrder(shopData.notifyOnOrder ?? true);
      setNotifyOnLowStock(shopData.notifyOnLowStock ?? true);
      setLowStockThreshold(shopData.lowStockThreshold || 5);
      setBotWelcomeMessage(shopData.botWelcomeMessage || 'Welcome to our shop! 🛍');

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
      const response = await fetch(`http://localhost:3001/api/shops/${shop?.id}`, {
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
      });

      if (!response.ok) throw new Error('Failed to save wallets');
      setSuccess('Wallet addresses saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save wallets');
    } finally {
      setSavingWallets(false);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNotifications(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3001/api/shops/${shop?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          notificationsEnabled,
          notificationEmail,
          notifyOnOrder,
          notifyOnLowStock,
        }),
      });

      if (!response.ok) throw new Error('Failed to save notifications');
      setSuccess('Notification settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save notifications');
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStock(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3001/api/shops/${shop?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lowStockThreshold }),
      });

      if (!response.ok) throw new Error('Failed to save stock settings');
      setSuccess('Stock warning threshold saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save stock settings');
    } finally {
      setSavingStock(false);
    }
  };

  const handleSaveBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBot(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3001/api/shops/${shop?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ botWelcomeMessage }),
      });

      if (!response.ok) throw new Error('Failed to save bot message');
      setSuccess('Bot welcome message saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save bot message');
    } finally {
      setSavingBot(false);
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
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to disable 2FA');
      setSuccess('2FA disabled successfully');

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
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-4xl font-bold text-white">Settings</h1>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-900 border border-red-800 text-red-100 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-8 p-4 bg-emerald-900 border border-emerald-800 text-emerald-100 rounded-lg">
            {success}
          </div>
        )}

        {/* Wallets Section - Emerald Border */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <Wallet className="text-emerald-400" size={24} />
            <h2 className="text-2xl font-bold text-white">Wallet Addresses</h2>
          </div>

          <div className="bg-slate-900 border-l-4 border-l-emerald-500 border border-slate-800 rounded-lg p-8">
            <form onSubmit={handleSaveWallets} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-3">
                    Bitcoin (BTC)
                  </label>
                  <input
                    type="text"
                    value={btcAddress}
                    onChange={(e) => setBtcAddress(e.target.value)}
                    placeholder="Your BTC address"
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-emerald-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-3">
                    Ethereum (ETH)
                  </label>
                  <input
                    type="text"
                    value={ethAddress}
                    onChange={(e) => setEthAddress(e.target.value)}
                    placeholder="Your ETH address"
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-emerald-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-3">
                    Litecoin (LTC)
                  </label>
                  <input
                    type="text"
                    value={ltcAddress}
                    onChange={(e) => setLtcAddress(e.target.value)}
                    placeholder="Your LTC address"
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-emerald-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-3">
                    USDT (Ethereum)
                  </label>
                  <input
                    type="text"
                    value={usdtAddress}
                    onChange={(e) => setUsdtAddress(e.target.value)}
                    placeholder="Your USDT address"
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-emerald-600 transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 text-sm font-semibold mb-3">
                    Monero (XMR)
                  </label>
                  <input
                    type="text"
                    value={xmrAddress}
                    onChange={(e) => setXmrAddress(e.target.value)}
                    placeholder="Your XMR address"
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-emerald-600 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingWallets}
                className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                {savingWallets ? 'Saving...' : (
                  <>
                    <Check size={20} />
                    Save Wallet Addresses
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Email Notifications Section - Blue Border */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="text-blue-400" size={24} />
            <h2 className="text-2xl font-bold text-white">Email Notifications</h2>
          </div>

          <div className="bg-slate-900 border-l-4 border-l-blue-500 border border-slate-800 rounded-lg p-8">
            <form onSubmit={handleSaveNotifications} className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-lg">
                <input
                  type="checkbox"
                  id="notificationsEnabled"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-5 h-5 cursor-pointer rounded"
                />
                <label
                  htmlFor="notificationsEnabled"
                  className="text-white font-semibold cursor-pointer flex-1"
                >
                  Enable Email Notifications
                </label>
              </div>

              {notificationsEnabled && (
                <div className="space-y-6 pt-4 border-t border-slate-700">
                  <div>
                    <label className="block text-slate-300 text-sm font-semibold mb-3">
                      Notification Email Address
                    </label>
                    <input
                      type="email"
                      value={notificationEmail}
                      onChange={(e) => setNotificationEmail(e.target.value)}
                      required={notificationsEnabled}
                      placeholder="your-email@example.com"
                      className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-600 transition"
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-slate-300 text-sm font-semibold">Notification Types:</p>
                    <div className="flex items-center gap-4 p-3 bg-slate-800 rounded-lg">
                      <input
                        type="checkbox"
                        id="notifyOnOrder"
                        checked={notifyOnOrder}
                        onChange={(e) => setNotifyOnOrder(e.target.checked)}
                        className="w-4 h-4 cursor-pointer rounded"
                      />
                      <label
                        htmlFor="notifyOnOrder"
                        className="text-slate-200 cursor-pointer flex-1"
                      >
                        Notify when new order arrives
                      </label>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-slate-800 rounded-lg">
                      <input
                        type="checkbox"
                        id="notifyOnLowStock"
                        checked={notifyOnLowStock}
                        onChange={(e) => setNotifyOnLowStock(e.target.checked)}
                        className="w-4 h-4 cursor-pointer rounded"
                      />
                      <label
                        htmlFor="notifyOnLowStock"
                        className="text-slate-200 cursor-pointer flex-1"
                      >
                        Notify when product stock is low
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={savingNotifications}
                className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                {savingNotifications ? 'Saving...' : (
                  <>
                    <Check size={20} />
                    Save Notification Settings
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Stock Warning Section - Orange Border */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="text-orange-400" size={24} />
            <h2 className="text-2xl font-bold text-white">Stock Warning</h2>
          </div>

          <div className="bg-slate-900 border-l-4 border-l-orange-500 border border-slate-800 rounded-lg p-8">
            <form onSubmit={handleSaveStock} className="space-y-6">
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  Low Stock Alert Threshold
                </label>
                <p className="text-slate-400 text-sm mb-4">
                  You'll receive an alert when a product's stock falls below this number
                </p>
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(parseInt(e.target.value))}
                  min="1"
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-orange-600 transition text-lg font-semibold"
                />
                <p className="text-slate-400 text-xs mt-2">
                  Current threshold: <span className="text-orange-400 font-semibold">{lowStockThreshold} units</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={savingStock}
                className="w-full flex items-center justify-center gap-2 bg-orange-700 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                {savingStock ? 'Saving...' : (
                  <>
                    <Check size={20} />
                    Save Stock Threshold
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bot Settings Section - Purple Border */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="text-purple-400" size={24} />
            <h2 className="text-2xl font-bold text-white">Bot Welcome Message</h2>
          </div>

          <div className="bg-slate-900 border-l-4 border-l-purple-500 border border-slate-800 rounded-lg p-8">
            <form onSubmit={handleSaveBot} className="space-y-6">
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  Welcome Message
                </label>
                <p className="text-slate-400 text-sm mb-4">
                  This message is displayed when customers start your Telegram bot
                </p>
                <textarea
                  value={botWelcomeMessage}
                  onChange={(e) => setBotWelcomeMessage(e.target.value)}
                  rows={5}
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-600 transition resize-none"
                  placeholder="Welcome to our shop! 🛍"
                />
                <p className="text-slate-400 text-xs mt-2">
                  Characters: <span className="text-purple-400">{botWelcomeMessage.length}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={savingBot}
                className="w-full flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                {savingBot ? 'Saving...' : (
                  <>
                    <Check size={20} />
                    Save Bot Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* 2FA Section - Red Border */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Lock className="text-red-400" size={24} />
            <h2 className="text-2xl font-bold text-white">Two-Factor Authentication (PGP)</h2>
          </div>

          <div className="bg-slate-900 border-l-4 border-l-red-500 border border-slate-800 rounded-lg p-8">
            {twoFaStatus && (
              <div className="mb-8 p-4 bg-slate-800 border border-slate-700 rounded-lg">
                <p className="text-slate-300 mb-2">
                  <strong>Status:</strong>{' '}
                  {twoFaStatus.enabled ? (
                    <span className="text-emerald-400 font-semibold">✓ Enabled</span>
                  ) : (
                    <span className="text-red-400 font-semibold">✗ Disabled</span>
                  )}
                </p>
                {twoFaStatus.hasPublicKey && (
                  <p className="text-slate-300">
                    <strong>Public Key:</strong> <span className="text-emerald-400 font-semibold">✓ Configured</span>
                  </p>
                )}
              </div>
            )}

            <div className="space-y-8">
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-3">
                  PGP Public Key
                </label>
                <p className="text-slate-400 text-sm mb-4">
                  Upload your public key file or paste it below
                </p>
                <input
                  type="file"
                  accept=".asc,.pub,.txt"
                  onChange={handlePublicKeyFileChange}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-300 px-4 py-3 rounded-lg mb-4 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-red-700 file:text-white file:cursor-pointer"
                />

                <textarea
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  placeholder="Paste your PGP public key here (-----BEGIN PGP PUBLIC KEY BLOCK-----)"
                  rows={8}
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg font-mono text-xs focus:outline-none focus:border-red-600 transition resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleUploadPublicKey}
                  disabled={uploadingKey || !publicKey.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  {uploadingKey ? 'Uploading...' : (
                    <>
                      <Check size={20} />
                      Upload Public Key
                    </>
                  )}
                </button>

                {twoFaStatus?.enabled && (
                  <button
                    onClick={handleDisable2Fa}
                    disabled={disabling2Fa}
                    className="flex-1 bg-red-900 hover:bg-red-800 disabled:opacity-50 text-red-100 px-6 py-3 rounded-lg font-semibold transition"
                  >
                    {disabling2Fa ? 'Disabling...' : 'Disable 2FA'}
                  </button>
                )}
              </div>

              <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg text-sm text-slate-300">
                <p className="font-semibold text-white mb-3">How PGP 2FA Works:</p>
                <ol className="list-decimal list-inside space-y-2 text-slate-400">
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
    </div>
  );
}