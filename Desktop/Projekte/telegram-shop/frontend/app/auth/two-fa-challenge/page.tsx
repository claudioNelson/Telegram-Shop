'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TwoFaChallengePagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [userId, setUserId] = useState<number | null>(null);
  const [challengeId, setChallengeId] = useState('');
  const [encryptedChallenge, setEncryptedChallenge] = useState('');

  const [decryptedChallenge, setDecryptedChallenge] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem('twoFaUserId');
    const storedChallengeId = sessionStorage.getItem('twoFaChallengeId');
    const storedEncrypted = sessionStorage.getItem('encryptedChallenge');

    if (!storedUserId || !storedChallengeId || !storedEncrypted) {
      setError('Challenge data not found. Please login again.');
      setLoading(false);
      return;
    }

    setUserId(parseInt(storedUserId));
    setChallengeId(storedChallengeId);
    setEncryptedChallenge(storedEncrypted);
    setLoading(false);
  }, []);

  const handleVerifyChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!decryptedChallenge.trim()) {
      setError('Please paste the decrypted challenge');
      return;
    }

    setVerifying(true);

    try {
      const response = await fetch(
        'http://localhost:3001/api/two-fa/verify-challenge',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            challengeId,
            decryptedChallenge,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Challenge verification failed');
      }

      setSuccess('Challenge verified! Logging in...');

      // WICHTIG: Speichere Token!
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      setTimeout(() => {
        sessionStorage.removeItem('twoFaUserId');
        sessionStorage.removeItem('twoFaChallengeId');
        sessionStorage.removeItem('encryptedChallenge');
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to verify challenge');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-2">2FA Verification</h1>
        <p className="text-gray-600 mb-6">
          Decrypt the challenge with your PGP private key
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleVerifyChallenge} className="space-y-6">
          {/* Encrypted Challenge */}
          <div>
            <label className="block text-sm font-medium mb-2">
              🔒 Encrypted Challenge
            </label>
            <textarea
              value={encryptedChallenge}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 font-mono text-xs h-24"
            />
            <p className="text-xs text-gray-600 mt-2">
              Copy this and decrypt with your PGP private key
            </p>
          </div>

          {/* Decrypted Challenge */}
          <div>
            <label className="block text-sm font-medium mb-2">
              🔓 Decrypted Challenge
            </label>
            <textarea
              value={decryptedChallenge}
              onChange={(e) => setDecryptedChallenge(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg font-mono text-sm h-24"
              placeholder="Paste the decrypted challenge here..."
              required
            />
            <p className="text-xs text-gray-600 mt-2">
              Run: gpg --decrypt (paste encrypted challenge)
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold mb-2">Steps:</p>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Copy the encrypted challenge above</li>
              <li>Decrypt: <code className="bg-white px-1">gpg --decrypt</code></li>
              <li>Paste the decrypted text here</li>
              <li>Click "Verify"</li>
            </ol>
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            {verifying ? 'Verifying...' : 'Verify Challenge'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              sessionStorage.clear();
              router.push('/login');
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}