'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const CODE_LENGTH = 6;

export default function VerifyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < CODE_LENGTH - 1) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    const newCode = Array(CODE_LENGTH).fill('');
    pasted.split('').forEach((digit, i) => {
      newCode[i] = digit;
    });
    setCode(newCode);
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    document.getElementById(`code-${focusIndex}`)?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const otp = code.join('');

    if (otp.length < CODE_LENGTH || !/^\d+$/.test(otp)) {
      setError(`Please enter the full ${CODE_LENGTH}-digit code.`);
      return;
    }

    setLoading(true);

    const { data, error: otpError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup',
    });

    if (otpError || !data.session) {
      setLoading(false);
      setError('Invalid or expired code. Please try again.');
      setCode(Array(CODE_LENGTH).fill(''));
      document.getElementById('code-0')?.focus();
      return;
    }

    const userId = data.session.user.id;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ skills_to_teach: [] })
      .eq('id', userId);

    setLoading(false);

    if (profileError) {
      console.warn('Profile init warning:', profileError.message);
    }

    router.push('/auth/details');
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#2d3f47] to-[#1a2c36] p-6 overflow-hidden">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">SkillSwap</h1>
          <p className="text-sm text-gray-300">
            Enter the {CODE_LENGTH}-digit code sent to
          </p>
          <p className="text-sm text-[#5fa4c3] font-medium mt-1 truncate">{email}</p>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col gap-6">
          <div className="flex gap-2 justify-center">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-11 h-14 rounded-lg bg-[#3a4f5a] text-white text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#5fa4c3]"
              />
            ))}
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || code.some((d) => d === '')}
            className="w-full px-4 py-3 bg-[#5fa4c3] text-white rounded-full font-medium hover:bg-[#4a8fb5] transition-colors disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
