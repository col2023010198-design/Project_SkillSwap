'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === confirmPassword) {
      router.push('/auth/verify');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#2d3f47] to-[#1a2c36] p-6">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">SkillSwap</h1>
          <p className="text-sm text-gray-300">Learn, Teach, and Exchange Skills</p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5fa4c3]"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5fa4c3]"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5fa4c3]"
            required
          />
          <button
            type="submit"
            className="w-full px-4 py-3 bg-[#5fa4c3] text-white rounded-full font-medium hover:bg-[#4a8fb5] transition-colors"
          >
            Continue
          </button>
        </form>

        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#5fa4c3] font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
