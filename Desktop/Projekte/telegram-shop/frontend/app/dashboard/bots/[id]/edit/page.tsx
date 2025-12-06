'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Check, Trash2 } from 'lucide-react';

interface Bot {
  id: number;
  name?: string;
  telegramBotToken: string;
  telegramBotUsername: string;
  welcomeMessage: string;
  isActive: boolean;
}

export default function EditBotPage() {
  const router = useRouter();
  const params = useParams();
  const botId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shop, setShop] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    telegramBotToken: '',
    telegramBotUsername: '',
    welcomeMessage: '',
  });

  useEffect(() => {
    fetchBot();
  }, []);

  const fetchBot = async () => {
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

      const botRes = await fetch(
        `http://localhost:3001/api/shops/${shopData.id}/bots/${botId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const botData = await botRes.json();

      setFormData({
        name: botData.name || '',
        telegramBotToken: botData.telegramBotToken || '',
        telegramBotUsername: botData.telegramBotUsername || '',
        welcomeMessage: botData.welcomeMessage || '',
      });

      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load bot');
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      const response = await fetch(
        `http://localhost:3001/api/shops/${shop.id}/bots/${botId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name || null,
            telegramBotToken: formData.telegramBotToken,
            telegramBotUsername: formData.telegramBotUsername,
            welcomeMessage: formData.welcomeMessage,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update bot');

      setSuccess('Bot updated successfully!');
      setTimeout(() => router.push('/dashboard/bots'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bot');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this bot?')) return;

    setDeleting(true);
    setError('');

    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/shops/${shop.id}/bots/${botId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Failed to delete bot');

      setSuccess('Bot deleted successfully!');
      setTimeout(() => router.push('/dashboard/bots'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bot');
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
          <h1 className="text-2xl font-bold text-white">Edit Bot</h1>
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
            <h2 className="text-xl font-bold text-white mb-6">Bot Details</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Bot Name (Optional)
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  placeholder="My Shop Bot"
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Telegram Bot Token *
                </label>
                <input
                  type="text"
                  name="telegramBotToken"
                  value={formData.telegramBotToken || ''}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Telegram Bot Username *
                </label>
                <input
                  type="text"
                  name="telegramBotUsername"
                  value={formData.telegramBotUsername || ''}
                  onChange={handleChange}
                  required
                  placeholder="my_shop_bot"
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600"
                />
                <p className="text-slate-400 text-xs mt-2">
                  Without the @ symbol
                </p>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Welcome Message
                </label>
                <textarea
                  name="welcomeMessage"
                  value={formData.welcomeMessage || ''}
                  onChange={handleChange}
                  rows={5}
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600 resize-none"
                  placeholder="Welcome to our shop! 🛍"
                />
              </div>
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
                  Update Bot
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 bg-red-900 hover:bg-red-800 disabled:opacity-50 text-red-100 py-2 px-4 rounded font-medium transition"
            >
              {deleting ? 'Deleting...' : (
                <>
                  <Trash2 size={18} />
                  Delete
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}