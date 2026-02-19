'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

export default function MenuPage() {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-[#1a2c36] pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="bg-[#2d3f47] border-b border-[#3a4f5a] p-4 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-white">Menu</h1>
        </header>

        {/* Menu Items */}
        <div className="divide-y divide-[#3a4f5a]">
          <Link
            href="/app/profile"
            className="flex items-center justify-between p-4 hover:bg-[#2d3f47] transition-colors border-b border-[#3a4f5a]"
          >
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              <span className="text-white font-medium">My Profile</span>
            </div>
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </Link>

          <button
            onClick={() => router.push('/app/home')}
            className="w-full text-left flex items-center justify-between p-4 hover:bg-[#2d3f47] transition-colors border-b border-[#3a4f5a]"
          >
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
              </svg>
              <span className="text-white font-medium">About SkillSwap</span>
            </div>
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>

          <button
            onClick={() => {}}
            className="w-full text-left flex items-center justify-between p-4 hover:bg-[#2d3f47] transition-colors border-b border-[#3a4f5a]"
          >
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span className="text-white font-medium">Settings</span>
            </div>
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>

          <button
            onClick={() => {}}
            className="w-full text-left flex items-center justify-between p-4 hover:bg-[#2d3f47] transition-colors border-b border-[#3a4f5a]"
          >
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
              </svg>
              <span className="text-white font-medium">Help & Support</span>
            </div>
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center justify-between p-4 hover:bg-[#2d3f47] transition-colors text-red-400"
          >
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
              <span className="font-medium">Logout</span>
            </div>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}