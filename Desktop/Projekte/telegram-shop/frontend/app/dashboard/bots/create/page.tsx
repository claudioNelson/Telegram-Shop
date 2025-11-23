'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateBotPage() {
  const router = useRouter();
  const [botName, setBotName] = useState('');
  const [botUsername, setBotUsername] = useState('');
  const [telegramToken, setTelegramToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!botName.trim()) {
      setError('Bot name is required');
      return;
    }

    if (!botUsername.trim()) {
      setError('Telegram bot username is required');
      return;
    }

    if (!telegramToken.trim()) {
      setError('Telegram token is required');
      return;
    }

    // Validiere Bot-Username Format
    if (!botUsername.match(/^[a-zA-Z0-9_]{5,32}bot$/i)) {
      setError('Bot username must end with "bot" (e.g., my_shop_bot)');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        router.push('/login');
        return;
      }

      // Hole Shop ID zuerst
      const shopRes = await fetch('http://localhost:3001/api/shops/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!shopRes.ok) throw new Error('Failed to fetch shop');
      const shop = await shopRes.json();

      // Erstelle Bot
      const botRes = await fetch(
        `http://localhost:3001/api/shops/${shop.id}/bots`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: botName,
            telegramBotToken: telegramToken,
            telegramBotUsername: botUsername,
            welcomeMessage: `Willkommen in ${botName}! 👋`,
          }),
        }
      );

      const botData = await botRes.json();

      if (!botRes.ok) {
        throw new Error(botData.message || 'Failed to create bot');
      }

      // Success - redirect to bots list
      router.push('/dashboard/bots');
    } catch (err: any) {
      setError(err.message || 'Error creating bot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">🤖 Neuen Bot erstellen</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white p-8 rounded-lg shadow">
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateBot} className="space-y-6">
            {/* Bot Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Bot Name</label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="z.B. Mein Coffee Shop"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                Der Name, der in deinem Dashboard und im Bot angezeigt wird
              </p>
            </div>

            {/* Telegram Bot Username */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Telegram Bot Username
              </label>
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">@</span>
                <input
                  type="text"
                  value={botUsername}
                  onChange={(e) => setBotUsername(e.target.value)}
                  placeholder="z.B. coffee_shop_bot"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Der Username von @BotFather (z.B. "coffee_shop_bot" → @coffee_shop_bot)
              </p>
            </div>

            {/* Telegram Token */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Telegram Bot Token
              </label>
              <textarea
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                placeholder="z.B. 123456789:ABCdefGHIjklmnoPQRstuvWXYZabcdefg"
                className="w-full px-4 py-2 border rounded-lg font-mono text-sm h-20 focus:ring-2 focus:ring-blue-600"
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                Den Token bekommst du von{' '}
                <a
                  href="https://t.me/botfather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  @BotFather
                </a>{' '}
                auf Telegram
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="font-semibold mb-2">Wie bekomme ich Bot-Daten?</p>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>
                  Öffne Telegram und schreibe{' '}
                  <code className="bg-white px-1">@BotFather</code>
                </li>
                <li>
                  Schreibe <code className="bg-white px-1">/newbot</code>
                </li>
                <li>Gib einen Namen ein (z.B. "Mein Coffee Shop")</li>
                <li>
                  Gib einen Username ein (z.B. "coffee_shop_bot") - muss mit "bot"
                  enden
                </li>
                <li>
                  @BotFather gibt dir den Token - kopiere den <strong>kompletten</strong> Token
                </li>
                <li>
                  Paste den Token und Username hier ein
                </li>
              </ol>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {loading ? 'Bot wird erstellt...' : '✨ Bot erstellen'}
            </button>
          </form>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/dashboard/bots')}
              className="text-blue-600 hover:text-blue-800"
            >
              Zurück zum Bot Manager
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}