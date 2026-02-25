'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

import BottomNav from '@/components/BottomNav';
import PostCard, { Post } from '@/components/PostCard';

type FeedRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  skill_to_teach: string;
  skill_to_learn: string;
  created_at: string;

  username: string | null;
  full_name: string | null;
  avatar_url: string | null;

  likes_count: number;
  comments_count: number;
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
      .from('v_post_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      setErr(error.message);
      return;
    }

    const mapped: Post[] = (data as FeedRow[]).map((r) => ({
      id: r.id,
      author: {
        name: r.full_name ?? r.username ?? 'Unknown',
        avatar: (r.username ?? r.full_name ?? 'U')
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((s) => s[0]?.toUpperCase())
          .join('') || 'U',
        username: r.username ?? 'unknown',
      },
      rating: 5, // keep your UI value; replace with real rating later if you want
      title: r.title,
      description: r.description,
      timestamp: timeAgo(r.created_at),
      likes: r.likes_count,
      comments: r.comments_count,
    }));

    setPosts(mapped);
  }, [supabase]);

  // Optional: like toggle (wire this into PostCard if it supports it)
  const toggleLike = useCallback(
    async (postId: string) => {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr || !user) {
        setErr(userErr?.message ?? 'Not authenticated');
        return;
      }

      // Check if liked
      const { data: existing, error: existErr } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existErr) {
        setErr(existErr.message);
        return;
      }

      if (existing) {
        const { error: delErr } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (delErr) setErr(delErr.message);
      } else {
        const { error: insErr } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });

        if (insErr) setErr(insErr.message);
      }
      // No manual refresh needed: realtime will refetch
    },
    [supabase]
  );

  // Optional: add comment (wire into PostCard/comment modal)
  const addComment = useCallback(
    async (postId: string, content: string) => {
      const clean = content.trim();
      if (!clean) return;

      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr || !user) {
        setErr(userErr?.message ?? 'Not authenticated');
        return;
      }

      const { error } = await supabase
        .from('post_comments')
        .insert({ post_id: postId, user_id: user.id, content: clean });

      if (error) setErr(error.message);
      // realtime will refetch
    },
    [supabase]
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      await loadFeed();
      if (mounted) setLoading(false);
    })();

    // Realtime subscriptions: any change triggers a refetch
    const channel = supabase
      .channel('feed-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'skill_swap_posts' },
        () => loadFeed()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_likes' },
        () => loadFeed()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_comments' },
        () => loadFeed()
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, loadFeed]);

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
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}

                // If your PostCard supports handlers, uncomment and match prop names:
                // onLike={() => toggleLike(post.id)}
                // onComment={(text: string) => addComment(post.id, text)}
              />
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}