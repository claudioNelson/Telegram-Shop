'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface NavbarProps {
  shopName?: string;
}

export default function Navbar({ shopName = 'Telegram Shop' }: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <nav className="bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-2xl font-bold">
            {shopName}
          </Link>
          <div className="flex gap-6">
            <Link href="/dashboard" className="hover:text-blue-100 transition">
              Dashboard
            </Link>
            <Link href="/dashboard/products" className="hover:text-blue-100 transition">
              Products
            </Link>
            <Link href="/dashboard/orders" className="hover:text-blue-100 transition">
              Orders
            </Link>
            <Link href="/dashboard/settings" className="hover:text-blue-100 transition">
              Settings
            </Link>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}