'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DetailsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/app/home');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#2d3f47] to-[#1a2c36] p-6">
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
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5fa4c3]"
            required
          />
          <textarea
            name="bio"
            placeholder="Bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5fa4c3] resize-none"
          />
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