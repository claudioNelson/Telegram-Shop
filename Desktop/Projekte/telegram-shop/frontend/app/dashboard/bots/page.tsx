'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit2, Trash2, Circle } from 'lucide-react';

interface Bot {
  id: number;
  name?: string;
  telegramBotToken: string;
  telegramBotUsername: string;
  welcomeMessage: string;
  isActive: boolean;
  createdAt: string;
}

export default function BotsPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shop, setShop] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchBotsAndShop();
  }, []);

  const fetchBotsAndShop = async () => {
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

      const botsRes = await fetch(
        `http://localhost:3001/api/shops/${shopData.id}/bots`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const botsData = await botsRes.json();
      setBots(Array.isArray(botsData) ? botsData : []);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load bots');
      setBots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (botId: number) => {
    if (!confirm('Delete this bot?')) return;

    const token = localStorage.getItem('accessToken');
    try {
      await fetch(`http://localhost:3001/api/shops/${shop.id}/bots/${botId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setBots(bots.filter((b) => b.id !== botId));
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to delete bot');
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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-white">Telegram Bots</h1>
          </div>
          <button
            onClick={() => router.push('/dashboard/bots/new')}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded transition"
          >
            <Plus size={18} />
            New Bot
          </button>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-800 text-red-100 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {bots.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
            <div className="mb-4">
              <div className="text-4xl mb-4">🤖</div>
              <p className="text-slate-400 mb-6">No bots created yet</p>
              <button
                onClick={() => router.push('/dashboard/bots/new')}
                className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded transition"
              >
                <Plus size={18} />
                Create your first bot
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">
                        {bot.name || bot.telegramBotUsername}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Circle
                          size={8}
                          className="fill-emerald-500 text-emerald-500"
                        />
                        <span className="text-xs text-emerald-400 font-medium">
                          {bot.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">
                      @{bot.telegramBotUsername}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-4 mb-4">
                  <p className="text-slate-400 text-xs font-medium mb-2">
                    Welcome Message
                  </p>
                  <p className="text-white text-sm line-clamp-2">
                    {bot.welcomeMessage}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                  <span>Created {new Date(bot.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/bots/${bot.id}/edit`)}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded transition font-medium"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(bot.id)}
                    className="flex items-center justify-center gap-2 bg-red-900 hover:bg-red-800 text-red-100 px-4 py-2 rounded transition font-medium"
                  >
                    <Trash2 size={16} />
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