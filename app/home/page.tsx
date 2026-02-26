'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

import UpperNav from '@/components/UpperNav';
import BottomNav from '@/components/BottomNav';
import PostCard, { Post } from '@/components/PostCard';

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

export default function HomePage() {
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Missing Supabase env vars');
    return createClient(url, key);
  }, []);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const deletePost = useCallback(
    async (postId: string) => {
      setErr(null);
      const { error } = await supabase.from('skill_swap_posts').delete().eq('id', postId);
      if (error) {
        setErr(error.message);
        return;
      }
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    },
    [supabase]
  );

  const loadFeed = useCallback(async () => {
    setErr(null);

    const { data: postData, error: postErr } = await supabase
      .from('skill_swap_posts')
      .select('id,user_id,title,description,skill_to_teach,skill_to_learn,created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (postErr) {
      setErr(postErr.message);
      return;
    }

    const postsRows = (postData ?? []) as PostRow[];
    if (postsRows.length === 0) {
      setPosts([]);
      return;
    }

    const userIds = Array.from(new Set(postsRows.map((p) => p.user_id)));
    const { data: profData, error: profErr } = await supabase
      .from('profiles')
      .select('id,username,first_name,last_name,avatar_url')
      .in('id', userIds);

    if (profErr) {
      setErr(profErr.message);
      return;
    }

    const profileMap = new Map<string, ProfileRow>();
    for (const pr of (profData ?? []) as ProfileRow[]) profileMap.set(pr.id, pr);

    const postIds = postsRows.map((p) => p.id);

    // likes count
    const { data: likesRows, error: likesErr } = await supabase.from('post_likes').select('post_id').in('post_id', postIds);
    if (likesErr) {
      setErr(likesErr.message);
      return;
    }
    const likeCountMap = new Map<string, number>();
    for (const row of likesRows ?? []) {
      const pid = (row as any).post_id as string;
      likeCountMap.set(pid, (likeCountMap.get(pid) ?? 0) + 1);
    }

    // comments count
    const { data: commentRows, error: comErr } = await supabase.from('post_comments').select('post_id').in('post_id', postIds);
    if (comErr) {
      setErr(comErr.message);
      return;
    }
    const commentCountMap = new Map<string, number>();
    for (const row of commentRows ?? []) {
      const pid = (row as any).post_id as string;
      commentCountMap.set(pid, (commentCountMap.get(pid) ?? 0) + 1);
    }

    // ratings avg + count
    const { data: ratingRows, error: rateErr } = await supabase
      .from('post_ratings')
      .select('post_id, rating')
      .in('post_id', postIds);

    if (rateErr) {
      setErr(rateErr.message);
      return;
    }

    const ratingAgg = new Map<string, { sum: number; count: number }>();
    for (const row of ratingRows ?? []) {
      const pid = (row as any).post_id as string;
      const val = Number((row as any).rating ?? 0);
      const prev = ratingAgg.get(pid) ?? { sum: 0, count: 0 };
      ratingAgg.set(pid, { sum: prev.sum + val, count: prev.count + 1 });
    }

    const mapped: Post[] = postsRows.map((r) => {
      const pr = profileMap.get(r.user_id);

      const first = pr?.first_name ?? '';
      const last = pr?.last_name ?? '';
      const username = pr?.username ?? 'unknown';
      const displayName = `${first} ${last}`.trim() || username || 'Unknown';

      const avatar =
        displayName
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w.charAt(0).toUpperCase())
          .join('') || 'U';

      const agg = ratingAgg.get(r.id);
      const ratings_count = agg?.count ?? 0;
      const rating = ratings_count > 0 ? agg!.sum / ratings_count : 0;

      return {
        id: r.id,
        user_id: r.user_id,
        author: {
          first_name: first || (!last ? 'Unknown' : ''),
          last_name: last,
          username,
          avatar,
          avatar_url: pr?.avatar_url ?? null,
        },
        rating,
        ratings_count,
        title: r.title,
        description: r.description,
        timestamp: timeAgo(r.created_at),
        likes: likeCountMap.get(r.id) ?? 0,
        comments: commentCountMap.get(r.id) ?? 0,
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

    const channel = supabase
      .channel('feed-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skill_swap_posts' }, () => loadFeed())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, () => loadFeed())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, () => loadFeed())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_ratings' }, () => loadFeed())
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, loadFeed]);

  return (
    <div className="min-h-screen bg-[#1a2c36] pb-24">
      <UpperNav />
      <div className="max-w-2xl mx-auto">

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
            posts.map((p) => <PostCard key={p.id} post={p} onDeletePost={deletePost} />)
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
