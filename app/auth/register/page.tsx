'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// ── Helpers ────────────────────────────────────────────────────────────────

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function deriveRole(email: string): 'student' | 'professional' | null {
  if (!email.includes('@')) return null;
  const domain = email.split('@')[1].toLowerCase();
  const academic = [
    /\.edu$/, /\.edu\./, /\.ac\.[a-z]{2}$/, /\.edu\.[a-z]{2}$/,
    /^school\./, /university/, /college/, /institute/,
  ];
  return academic.some((p) => p.test(domain)) ? 'student' : 'professional';
}

// ── Sub-components ─────────────────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.121-3.364M6.343 6.343A9.965 9.965 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.97 9.97 0 01-1.284 2.516M6.343 6.343L3 3m3.343 3.343l11.314 11.314M15 12a3 3 0 00-3-3m0 0L9 6m3 3l3 3" />
    </svg>
  );
}

function RoleBadge({ role }: { role: 'student' | 'professional' }) {
  const isStudent = role === 'student';
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
      isStudent
        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
    }`}>
      <span>{isStudent ? '🎓' : '💼'}</span>
      {isStudent ? 'Student Account' : 'Professional Account'}
    </span>
  );
}

function FieldError({ msg }: { msg: string | undefined }) {
  if (!msg) return null;
  return <p className="text-red-400 text-xs mt-1 ml-1">{msg}</p>;
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [touched, setTouched]               = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError]       = useState<string | null>(null);
  const [loading, setLoading]               = useState(false);

  const touch = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  // ── Real-time validation ──
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!email)                                   e.email = 'Email is required.';
    else if (!isValidEmail(email))                e.email = 'Enter a valid email address.';
    if (!password)                                e.password = 'Password is required.';
    else if (password.length < 8)                 e.password = 'Password must be at least 8 characters.';
    if (!confirmPassword)                         e.confirmPassword = 'Please confirm your password.';
    else if (confirmPassword !== password)        e.confirmPassword = 'Passwords do not match.';
    return e;
  }, [email, password, confirmPassword]);

  const isFormValid = Object.keys(errors).length === 0;
  const role = deriveRole(email);

  // ── Submit ──
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mark all fields touched to surface any remaining errors
    setTouched({ email: true, password: true, confirmPassword: true });
    if (!isFormValid) return;

    setSubmitError(null);
    setLoading(true);

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.signInWithPassword({
      email,
      password: 'test', // dummy password to check if user exists
    });

    if (existingUser?.user) {
      setLoading(false);
      setSubmitError('This email is already registered. Please log in instead.');
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({ 
      email, 
      password,
    });

    setLoading(false);

    if (signUpError) {
      // Handle specific error types
      if (signUpError.message.toLowerCase().includes('rate limit')) {
        setSubmitError(
          'Too many verification emails sent. Please wait a few minutes before trying again, or contact support if this persists.'
        );
      } else if (signUpError.message.toLowerCase().includes('already registered')) {
        setSubmitError('This email is already registered. Please log in instead.');
      } else {
        setSubmitError(signUpError.message);
      }
      return;
    }

    // If user was created but email is not confirmed, proceed to verify
    if (data?.user && !data.user.confirmed_at) {
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    } else if (data?.user && data.user.confirmed_at) {
      // User already confirmed (shouldn't happen in signup, but handle it)
      router.push('/auth/details');
    } else {
      setSubmitError('Registration failed. Please try again.');
    }
  };

  // ── Render ──
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#2d3f47] to-[#1a2c36] p-6 overflow-y-auto">
      <div className="w-full max-w-sm flex flex-col gap-6 py-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-1">SkillSwap</h1>
          <p className="text-sm text-gray-300">Learn, Teach, and Exchange Skills</p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-3" noValidate>

          {/* Email + role badge */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => touch('email')}
              className={`w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5fa4c3] ${touched.email && errors.email ? 'ring-2 ring-red-400' : ''}`}
            />
            {touched.email && <FieldError msg={errors.email} />}
            {/* Dynamic role preview — shown as soon as a valid email is typed */}
            {role && !errors.email && (
              <div className="mt-2 flex justify-start">
                <RoleBadge role={role} />
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min. 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => touch('password')}
                className={`w-full px-4 py-3 pr-12 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5fa4c3] ${touched.password && errors.password ? 'ring-2 ring-red-400' : ''}`}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}>
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {touched.password && <FieldError msg={errors.password} />}
            {/* Strength bar */}
            {password.length > 0 && (
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4].map((lvl) => (
                  <div key={lvl} className={`h-1 flex-1 rounded-full transition-colors ${
                    password.length >= lvl * 3
                      ? lvl <= 1 ? 'bg-red-400'
                        : lvl <= 2 ? 'bg-yellow-400'
                        : lvl <= 3 ? 'bg-blue-400'
                        : 'bg-emerald-400'
                      : 'bg-gray-600'
                  }`} />
                ))}
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => touch('confirmPassword')}
                className={`w-full px-4 py-3 pr-12 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5fa4c3] ${touched.confirmPassword && errors.confirmPassword ? 'ring-2 ring-red-400' : ''}`}
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}>
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {touched.confirmPassword && <FieldError msg={errors.confirmPassword} />}
          </div>

          {/* Server-side error */}
          {submitError && (
            <p className="text-red-400 text-sm text-center">{submitError}</p>
          )}

          {/* Submit — disabled until form is clean */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 mt-1 bg-[#5fa4c3] text-white rounded-full font-medium hover:bg-[#4a8fb5] transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Continue'}
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