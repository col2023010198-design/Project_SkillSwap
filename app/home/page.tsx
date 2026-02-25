'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

import BottomNav from '@/components/BottomNav';
import PostCard, { Post } from '@/components/PostCard';

type PostRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  skill_to_teach: string;
  skill_to_learn: string;
  created_at: string;

  profiles: {
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;

  post_likes: { count: number }[];
  post_comments: { count: number }[];
};

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

export default function HomePage() {
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, key);
  }, []);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    setErr(null);

    const { data, error } = await supabase
      .from('skill_swap_posts')
      .select(
        `
        id,
        user_id,
        title,
        description,
        skill_to_teach,
        skill_to_learn,
        created_at,
        profiles ( username, full_name, avatar_url ),
        post_likes ( count ),
        post_comments ( count )
      `
      )
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      setErr(error.message);
      return;
    }

    const mapped: Post[] = ((data ?? []) as unknown as PostRow[]).map((r) => {
      const name = r.profiles?.first_name && r.profiles?.last_name
        ? `${r.profiles.first_name} ${r.profiles.last_name}`
        : r.profiles?.username ?? 'Unknown';
      const username = r.profiles?.username ?? 'unknown';
      const likes = r.post_likes?.[0]?.count ?? 0;
      const comments = r.post_comments?.[0]?.count ?? 0;

      return {
        id: r.id,
        author: {
          name,
          username,
          avatar:
            name
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((s) => s[0]?.toUpperCase())
              .join('') || 'U',
        },
        rating: 5,
        title: r.title,
        description: r.description,
        timestamp: timeAgo(r.created_at),
        likes,
        comments,
      };
    });

    setPosts(mapped);
  }, [supabase]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      await loadFeed();
      if (alive) setLoading(false);
    })();

    // Realtime refresh
    const channel = supabase
      .channel('feed-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skill_swap_posts' }, () => loadFeed())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, () => loadFeed())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, () => loadFeed())
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, loadFeed]);

  return (
    <div className="min-h-screen bg-[#1a2c36] pb-24">
      <div className="max-w-2xl mx-auto">
        <header className="bg-[#2d3f47] border-b border-[#3a4f5a] p-4 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-white">SkillSwap</h1>
        </header>

        <div className="p-4 space-y-4">
          {err && (
            <div className="rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
              {err}
            </div>
          )}

          {loading ? (
            <div className="text-white/70 text-sm">Loading feed…</div>
          ) : posts.length === 0 ? (
            <div className="text-white/70 text-sm">No posts yet.</div>
          ) : (
            posts.map((p) => <PostCard key={p.id} post={p} />)
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}