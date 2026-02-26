'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.includes(path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#2d3f47] border-t border-[#3a4f5a] h-16">
      <div className="flex justify-around items-center h-full relative max-w-2xl mx-auto">
        {/* Home */}
        <Link
          href="/home"
          className={`flex flex-col items-center justify-center flex-1 h-16 transition-colors ${
            isActive('/home') ? 'text-[#5fa4c3]' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </Link>

        {/* Profile */}
        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center flex-1 h-16 transition-colors ${
            isActive('/profile') ? 'text-[#5fa4c3]' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </Link>

        {/* Create Button - Centered & Elevated */}
        <div className="flex-1 flex items-center justify-center">
          <Link
            href="/create"
            className="absolute -top-6 w-14 h-14 bg-[#5fa4c3] rounded-full flex items-center justify-center shadow-lg border-4 border-[#2d3f47] hover:bg-[#4a8fb5] transition-all hover:scale-110"
          >
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </Link>
        </div>

        {/* Messages */}
        <Link
          href="/message"
          className={`flex flex-col items-center justify-center flex-1 h-16 transition-colors ${
            isActive('/message') ? 'text-[#5fa4c3]' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        </Link>

        {/* Menu */}
        <Link
          href="/menu"
          className={`flex flex-col items-center justify-center flex-1 h-16 transition-colors ${
            isActive('/menu') ? 'text-[#5fa4c3]' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </Link>
      </div>
    </nav>
  );
}
