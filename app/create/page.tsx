'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillToTeach, setSkillToTeach] = useState('');
  const [skillToLearn, setSkillToLearn] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle post creation
    router.push('/home');
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
          <h1 className="text-xl font-bold text-white">Create Post</h1>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#2d3f47] text-white placeholder-gray-500 border border-[#3a4f5a] focus:outline-none focus:border-[#5fa4c3]"
            required
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-lg bg-[#2d3f47] text-white placeholder-gray-500 border border-[#3a4f5a] focus:outline-none focus:border-[#5fa4c3] resize-none"
            required
          />

          <input
            type="text"
            placeholder="Skill you want to teach"
            value={skillToTeach}
            onChange={(e) => setSkillToTeach(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#2d3f47] text-white placeholder-gray-500 border border-[#3a4f5a] focus:outline-none focus:border-[#5fa4c3]"
            required
          />

          <input
            type="text"
            placeholder="Skill you want to learn"
            value={skillToLearn}
            onChange={(e) => setSkillToLearn(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#2d3f47] text-white placeholder-gray-500 border border-[#3a4f5a] focus:outline-none focus:border-[#5fa4c3]"
            required
          />

          <button
            type="submit"
            className="w-full px-4 py-3 bg-[#5fa4c3] text-white rounded-full font-medium hover:bg-[#4a8fb5] transition-colors"
          >
            Post
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}