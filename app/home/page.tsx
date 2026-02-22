'use client';

import BottomNav from '@/components/BottomNav';
import PostCard, { Post } from '@/components/PostCard';

const samplePosts: Post[] = [
  {
    id: '1',
    author: {
      name: 'Ron Hansen Person',
      avatar: 'RHP',
      username: 'ronhansen',
    },
    rating: 5,
    title: 'Web Development Expert',
    description: 'Looking for Web development trainers. I can help you learn JavaScript, React, and Node.js. Let me learn backend development in return!',
    timestamp: '2 hours ago',
    likes: 127,
    comments: 24,
  },
  {
    id: '2',
    author: {
      name: 'YoKi Guada',
      avatar: 'YG',
      username: 'yokiguada',
    },
    rating: 5,
    title: 'Graphic Design Skills',
    description: 'Need to level-up Python coding. I can assist with Adobe tools. Let me learn coding in return what you need help with.',
    timestamp: '4 hours ago',
    likes: 89,
    comments: 16,
  },
  {
    id: '3',
    author: {
      name: 'Prather Ttasks',
      avatar: 'PT',
      username: 'pratherttasks',
    },
    rating: 5,
    title: 'Business Mentorship',
    description: 'Looking for guidance with startup strategy. I have expertise in leadership and team building. Can teach soft skills in exchange for business consulting.',
    timestamp: '1 day ago',
    likes: 203,
    comments: 42,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#1a2c36] pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="bg-[#2d3f47] border-b border-[#3a4f5a] p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">SkillSwap</h1>
          </div>
        </header>

        {/* Feed */}
        <div className="p-4 space-y-4">
          {samplePosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}