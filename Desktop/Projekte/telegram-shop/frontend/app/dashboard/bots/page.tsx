'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Bot {
  id: number;
  name: string;
  telegramBotUsername: string;
  isActive: boolean;
  createdAt: string;
}

export default function BotsPage() {
  const router = useRouter();
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shopId, setShopId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      router.push('/login');
      return;
    }

    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      // Hole Shop
      const shopRes = await fetch('http://localhost:3001/api/shops/me', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!shopRes.ok) {
        console.error('Shop response:', shopRes.status);
        if (shopRes.status === 401) {
          localStorage.clear();
          router.push('/login');
          return;
        }
        throw new Error(`Failed to fetch shop (${shopRes.status})`);
      }

      const shopData = await shopRes.json();
      setShopId(shopData.id);

      // Hole Bots
      const botsRes = await fetch(
        `http://localhost:3001/api/shops/${shopData.id}/bots`,
        {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!botsRes.ok) {
        console.error('Bots response:', botsRes.status);
        throw new Error(`Failed to fetch bots (${botsRes.status})`);
      }

      const botsData = await botsRes.json();

      // botsData könnte ein Array oder einzeln sein
      if (Array.isArray(botsData)) {
        setBots(botsData);
      } else if (botsData && typeof botsData === 'object') {
        setBots([botsData]);
      } else {
        setBots([]);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Error loading bots');
      setBots([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading bots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">🤖 Bot Manager</h1>
            <button
              onClick={() => router.push('/dashboard/bots/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Neuen Bot erstellen
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {bots.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-600 mb-6">
              Du hast noch keinen Telegram Bot erstellt.
            </p>
            <button
              onClick={() => router.push('/dashboard/bots/create')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Bot jetzt erstellen
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {bots.map((bot) => (
              <div key={bot.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">{bot.name}</h2>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          bot.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {bot.isActive ? '🟢 Online' : '🔴 Offline'}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4">
                      <strong>Bot-Username:</strong>{' '}
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        @{bot.telegramBotUsername}
                      </code>
                    </p>

                    <p className="text-sm text-gray-500">
                      Erstellt:{' '}
                      {new Date(bot.createdAt).toLocaleDateString('de-DE')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`https://t.me/${bot.telegramBotUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                      🔗 Bot öffnen
                    </a>
                    <button
                      onClick={() =>
                        router.push(`/dashboard/bots/${bot.id}/edit`)
                      }
                      className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                    >
                      ✏️ Bearbeiten
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}