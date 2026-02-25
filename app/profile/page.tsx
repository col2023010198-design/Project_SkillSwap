'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import PostCard, { Post } from '@/components/PostCard';
import BottomNav from '@/components/BottomNav';

function timeAgo(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

type PostRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  skill_to_teach: string;
  skill_to_learn: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

export default function ProfilePage() {
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Missing Supabase env vars');
    return createClient(url, key);
  }, []);

  const [posts, setPosts] = useState<Post[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load current user
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    })();
  }, [supabase]);

  const deletePost = useCallback(
    async (postId: string) => {
      const { error } = await supabase
        .from('skill_swap_posts')
        .delete()
        .eq('id', postId);

      if (error) {
        setErr(error.message);
        return;
      }

      // instant UI update
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    },
    [supabase]
  );

  const loadMyPosts = useCallback(async () => {
    if (!userId) return;

    setErr(null);

    const { data: postData, error: postErr } = await supabase
      .from('skill_swap_posts')
      .select('id,user_id,title,description,skill_to_teach,skill_to_learn,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (postErr) {
      setErr(postErr.message);
      return;
    }

    const postsRows = (postData ?? []) as PostRow[];

    const { data: profileData } = await supabase
      .from('profiles')
      .select('id,username,first_name,last_name,avatar_url')
      .eq('id', userId)
      .maybeSingle();

    const first = profileData?.first_name ?? '';
    const last = profileData?.last_name ?? '';
    const username = profileData?.username ?? 'unknown';
    const displayName = `${first} ${last}`.trim() || username || 'Unknown';

    const safeName: string = (displayName ?? '').toString();

    const avatar =
      safeName
        .trim()
        .split(/\s+/)
        .filter((w: string) => w.length > 0)
        .slice(0, 2)
        .map((w: string) => w.charAt(0).toUpperCase())
        .join('') || 'U';
        
    const mapped: Post[] = postsRows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      author: {
        first_name: first || (!last ? 'Unknown' : ''),
        last_name: last,
        username,
        avatar,
      },
      rating: 5,
      title: r.title,
      description: r.description,
      timestamp: timeAgo(r.created_at),
      likes: 0, // optional: you can load counts like homepage if needed
      comments: 0,
    }));

    setPosts(mapped);
  }, [supabase, userId]);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      setLoading(true);
      await loadMyPosts();
      setLoading(false);
    })();
  }, [userId, loadMyPosts]);

  return (
    <div className="min-h-screen bg-[#1a2c36] pb-24">
      <div className="max-w-2xl mx-auto">
        <header className="bg-[#2d3f47] border-b border-[#3a4f5a] p-4 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-white">My Posts</h1>
        </header>

        <div className="p-4 space-y-4">
          {err && (
            <div className="rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
              {err}
            </div>
          )}

          {loading ? (
            <div className="text-white/70 text-sm">Loading…</div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDeletePost={deletePost} // ✅ now works here
              />
            ))
          ) : (
            <div className="bg-[#2d3f47] rounded-lg p-8 text-center border border-[#3a4f5a] text-white/70">
              No posts yet.
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}