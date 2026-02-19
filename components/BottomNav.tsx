'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.includes(path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#2d3f47] border-t border-[#3a4f5a] flex justify-around items-center h-16">
      <Link
        href="/app/home"
        className={`flex flex-col items-center justify-center w-16 h-16 transition-colors ${
          isActive('/home') ? 'text-[#5fa4c3]' : 'text-gray-400 hover:text-gray-300'
        }`}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      </Link>

      <Link
        href="/app/create"
        className={`flex flex-col items-center justify-center w-16 h-16 transition-colors ${
          isActive('/create') ? 'text-[#5fa4c3]' : 'text-gray-400 hover:text-gray-300'
        }`}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </Link>

      <Link
        href="/app/profile"
        className={`flex flex-col items-center justify-center w-16 h-16 transition-colors ${
          isActive('/profile') ? 'text-[#5fa4c3]' : 'text-gray-400 hover:text-gray-300'
        }`}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </Link>

      <Link
        href="/app/messages"
        className={`flex flex-col items-center justify-center w-16 h-16 transition-colors ${
          isActive('/messages') ? 'text-[#5fa4c3]' : 'text-gray-400 hover:text-gray-300'
        }`}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      </Link>

      <Link
        href="/app/menu"
        className={`flex flex-col items-center justify-center w-16 h-16 transition-colors ${
          isActive('/menu') ? 'text-[#5fa4c3]' : 'text-gray-400 hover:text-gray-300'
        }`}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
      </Link>
    </nav>
  );
}
