'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function DetailsPage() {
  const router = useRouter();
  const { updateProfile, user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    teachingSkills: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await updateProfile({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      bio: formData.bio.trim(),
      skills_to_teach: formData.teachingSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      isProfileComplete: true,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to update profile.');
      return;
    }

    router.push('/home');
  };

  const isValid =
    formData.firstName.trim() &&
    formData.lastName.trim();

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#2d3f47] to-[#1a2c36] p-6 overflow-hidden">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">SkillSwap</h1>
          <p className="text-sm text-gray-300">Complete your profile</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5fa4c3]"
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5fa4c3]"
            required
          />
          <input
            type="text"
            name="bio"
            placeholder="Bio (optional)"
            value={formData.bio}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5fa4c3]"
          />
          <input
            type="text"
            name="teachingSkills"
            placeholder="Skills you can teach (comma-separated)"
            value={formData.teachingSkills}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5fa4c3]"
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !isValid}
            className="w-full px-4 py-3 bg-[#5fa4c3] text-white rounded-full font-medium hover:bg-[#4a8fb5] transition-colors disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
