'use client';

import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import PostCard, { Post } from '@/components/PostCard';

const userPosts: Post[] = [
  {
    id: '1',
    author: {
      name: 'Ron Hansen Person',
      avatar: 'RHP',
      username: 'ronhansen',
    },
    rating: 5,
    title: 'Web Development Expert',
    description: 'Looking for Web development trainers. I can help you learn JavaScript, React, and Node.js.',
    timestamp: '2 hours ago',
    likes: 127,
    comments: 24,
  },
];

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#1a2c36] pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="bg-[#2d3f47] border-b border-[#3a4f5a] p-4 sticky top-0 z-10 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Profile</h1>
          <button className="text-gray-400 hover:text-gray-300">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        </header>

        {/* Profile Info */}
        <div className="bg-[#2d3f47] border-b border-[#3a4f5a] p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5fa4c3] to-[#4a7a8d]" />
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">Ron Hansen Person</h2>
              <p className="text-gray-400">@ronhansen</p>
            </div>
            <p className="text-gray-300 text-center text-sm">
              Web developer passionate about teaching and learning new technologies. Always eager to help others grow.
            </p>

            {/* Stats */}
            <div className="flex gap-8 w-full justify-center pt-4 border-t border-[#3a4f5a]">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#5fa4c3]">24</p>
                <p className="text-xs text-gray-400">Connections</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#5fa4c3]">5.0</p>
                <p className="text-xs text-gray-400">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#5fa4c3]">12</p>
                <p className="text-xs text-gray-400">Posts</p>
              </div>
            </div>

            <Link
              href="/app/edit-profile"
              className="w-full px-4 py-2 bg-[#5fa4c3] text-white rounded-full font-medium hover:bg-[#4a8fb5] transition-colors text-center"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Skills Section */}
        <div className="p-6 border-b border-[#3a4f5a]">
          <h3 className="text-lg font-bold text-white mb-4">Skills</h3>
          <div className="space-y-3">
            <div className="bg-[#2d3f47] rounded-lg p-3 border border-[#3a4f5a]">
              <p className="text-sm font-medium text-white">Teaching</p>
              <p className="text-xs text-gray-400 mt-1">JavaScript, React, Node.js, Web Development</p>
            </div>
            <div className="bg-[#2d3f47] rounded-lg p-3 border border-[#3a4f5a]">
              <p className="text-sm font-medium text-white">Learning</p>
              <p className="text-xs text-gray-400 mt-1">Python, Data Science, Machine Learning</p>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-bold text-white">Recent Posts</h3>
          {userPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}