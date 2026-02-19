'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

export default function EditProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: 'Ron',
    lastName: 'Hansen Person',
    username: 'ronhansen',
    bio: 'Web developer passionate about teaching and learning new technologies.',
    teachingSkills: 'JavaScript, React, Node.js',
    learningSkills: 'Python, Data Science',
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
    router.push('/app/profile');
  };

  return (
    <div className="min-h-screen bg-[#1a2c36] pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="bg-[#2d3f47] border-b border-[#3a4f5a] p-4 sticky top-0 z-10 flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-300">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">Edit Profile</h1>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5fa4c3] to-[#4a7a8d] mx-auto mb-4" />
            <button type="button" className="text-[#5fa4c3] text-sm font-medium hover:underline">
              Change Photo
            </button>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-[#2d3f47] text-white placeholder-gray-500 border border-[#3a4f5a] focus:outline-none focus:border-[#5fa4c3]"
              required
            />

            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-[#2d3f47] text-white placeholder-gray-500 border border-[#3a4f5a] focus:outline-none focus:border-[#5fa4c3]"
              required
            />

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-[#2d3f47] text-white placeholder-gray-500 border border-[#3a4f5a] focus:outline-none focus:border-[#5fa4c3]"
              required
            />

            <textarea
              name="bio"
              placeholder="Bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-[#2d3f47] text-white placeholder-gray-500 border border-[#3a4f5a] focus:outline-none focus:border-[#5fa4c3] resize-none"
            />

            <input
              type="text"
              name="teachingSkills"
              placeholder="Skills you can teach (comma-separated)"
              value={formData.teachingSkills}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-[#2d3f47] text-white placeholder-gray-500 border border-[#3a4f5a] focus:outline-none focus:border-[#5fa4c3]"
            />

            <input
              type="text"
              name="learningSkills"
              placeholder="Skills you want to learn (comma-separated)"
              value={formData.learningSkills}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-[#2d3f47] text-white placeholder-gray-500 border border-[#3a4f5a] focus:outline-none focus:border-[#5fa4c3]"
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-full font-medium hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-[#5fa4c3] text-white rounded-full font-medium hover:bg-[#4a8fb5] transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
