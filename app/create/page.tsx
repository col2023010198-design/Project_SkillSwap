'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import BottomNav from '@/components/BottomNav';

export default function CreatePostPage() {
  const router = useRouter();

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, key);
  }, []);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillToTeach, setSkillToTeach] = useState('');
  const [skillToLearn, setSkillToLearn] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      setErr(userErr?.message ?? 'You must be logged in to post.');
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from('skill_swap_posts').insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      skill_to_teach: skillToTeach.trim(),
      skill_to_learn: skillToLearn.trim(),
    });

    if (error) {
      setErr(error.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    router.push('/home'); // goes to feed
  };

  return (
    <div className="min-h-screen bg-[#1a2c36] pb-24">
      <div className="max-w-2xl mx-auto">
        <header className="bg-[#2d3f47] border-b border-[#3a4f5a] p-4 sticky top-0 z-10 flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-300">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">Create Post</h1>
        </header>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {err && (
            <div className="rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
              {err}
            </div>
          )}

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
            disabled={submitting}
            className="w-full px-4 py-3 bg-[#5fa4c3] text-white rounded-full font-medium hover:bg-[#4a8fb5] transition-colors disabled:opacity-60"
          >
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}