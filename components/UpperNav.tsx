'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UpperNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    setIsMenuOpen(false);
    router.push('/auth/login');
  };

  const handleNavigation = (path: string) => {
    setIsMenuOpen(false);
    router.push(path);
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#3a4a52] h-16 flex items-center justify-between px-4 z-20">
        {/* Burger Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white hover:text-gray-200 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>

        {/* Logo/Title */}
        <h1 className="text-xl font-bold text-white">SkillSwap</h1>

        {/* Notification Icon */}
        <button
          onClick={() => handleNavigation('/message')}
          className="text-white hover:text-gray-200 transition-colors"
          aria-label="Messages"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </button>
      </header>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-10 bg-black/50" onClick={() => setIsMenuOpen(false)}>
          <div
            className="absolute left-0 top-16 w-64 bg-[#3a4a52] shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="divide-y divide-[#4a5a62]">
              <button
                onClick={() => handleNavigation('/profile')}
                className="w-full text-left flex items-center gap-3 p-4 hover:bg-[#4a5a62] transition-colors"
              >
                <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span className="text-white font-medium">My Profile</span>
              </button>

              <button
                onClick={() => handleNavigation('/home')}
                className="w-full text-left flex items-center gap-3 p-4 hover:bg-[#4a5a62] transition-colors"
              >
                <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
                </svg>
                <span className="text-white font-medium">About SkillSwap</span>
              </button>

              <button
                onClick={() => handleNavigation('/home')}
                className="w-full text-left flex items-center gap-3 p-4 hover:bg-[#4a5a62] transition-colors"
              >
                <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
                <span className="text-white font-medium">Help & Support</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-3 p-4 hover:bg-[#4a5a62] transition-colors text-red-400"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                </svg>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  );
}
