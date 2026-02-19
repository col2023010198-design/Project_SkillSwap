'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerificationPage() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.every((digit) => digit !== '')) {
      router.push('/auth/details');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#2d3f47] to-[#1a2c36] p-6">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">SkillSwap</h1>
          <p className="text-sm text-gray-300">Verification number sent to your email</p>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col gap-6">
          <div className="flex gap-2 justify-center">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                className="w-12 h-12 rounded-lg bg-[#3a4f5a] text-white text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#5fa4c3]"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 bg-[#5fa4c3] text-white rounded-full font-medium hover:bg-[#4a8fb5] transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
