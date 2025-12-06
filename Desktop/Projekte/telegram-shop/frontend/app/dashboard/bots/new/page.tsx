'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';

export default function CreateBotPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [shop, setShop] = useState<any>(null);
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        telegramBotUsername: '',
        telegramBotToken: '',
        welcomeMessage: 'Welcome to our shop! 🛍',
    });

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
            const res = await fetch('http://localhost:3001/api/shops/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setShop(data);
        } catch (err) {
            console.error('Error:', err);
            setError('Failed to load shop');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            if (!formData.telegramBotToken.includes(':')) {
                throw new Error('Invalid Telegram bot token format');
            }

            const res = await fetch(
                `http://localhost:3001/api/shops/${shop.id}/bots`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: formData.name || null,
                        telegramBotToken: formData.telegramBotToken,
                        telegramBotUsername: formData.telegramBotUsername,  // <- NEU
                        welcomeMessage: formData.welcomeMessage,
                    }),
                }
            );

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to create bot');
            }

            setSuccess('Bot created successfully!');
            setTimeout(() => router.push('/dashboard/bots'), 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create bot');
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
                    <h1 className="text-2xl font-bold text-white">Create New Bot</h1>
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

                <form onSubmit={handleSubmit} className="space-y-8">
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
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="My Shop Bot"
                                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600"
                                />
                                <p className="text-slate-400 text-xs mt-2">
                                    If empty, the Telegram bot username will be used
                                </p>
                            </div>

                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2">
                                    Telegram Bot Token *
                                </label>
                                <input
                                    type="text"
                                    name="telegramBotToken"
                                    value={formData.telegramBotToken}
                                    onChange={handleChange}
                                    required
                                    placeholder="123456789:ABCdefGHIjklmnoPQRstuvWXYZabcdefghi"
                                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600 font-mono text-sm"
                                />
                                <p className="text-slate-400 text-xs mt-2">
                                    Get this from BotFather on Telegram: /newbot
                                </p>
                            </div>

                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2">
                                    Telegram Bot Username *
                                </label>
                                <input
                                    type="text"
                                    name="telegramBotUsername"
                                    value={formData.telegramBotUsername}
                                    onChange={handleChange}
                                    required
                                    placeholder="my_shop_bot"
                                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600"
                                />
                                <p className="text-slate-400 text-xs mt-2">
                                    Without the @ - you can find this in BotFather
                                </p>
                            </div>

                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2">
                                    Welcome Message
                                </label>
                                <textarea
                                    name="welcomeMessage"
                                    value={formData.welcomeMessage}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:border-emerald-600 resize-none"
                                    placeholder="Welcome to our shop! 🛍"
                                />
                                <p className="text-slate-400 text-xs mt-2">
                                    This message appears when customers start your bot
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
                        <h3 className="text-lg font-bold text-white mb-4">How to get your Bot Token:</h3>
                        <ol className="list-decimal list-inside space-y-3 text-slate-300 text-sm">
                            <li>Open Telegram and search for <code className="bg-slate-800 px-2 py-1 rounded text-xs">@BotFather</code></li>
                            <li>Send the command <code className="bg-slate-800 px-2 py-1 rounded text-xs">/newbot</code></li>
                            <li>Follow the instructions (give your bot a name)</li>
                            <li>BotFather will give you a token - copy and paste it above</li>
                            <li>Keep this token secret!</li>
                        </ol>
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
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white py-2 px-4 rounded font-medium transition"
                        >
                            {loading ? 'Creating...' : (
                                <>
                                    <Check size={18} />
                                    Create Bot
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}