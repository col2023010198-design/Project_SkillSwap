'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/auth/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#1a2c36] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">SkillSwap</h1>
        <p className="text-gray-300">Learn, Teach, and Exchange Skills</p>
      </div>
    </div>
  );
}