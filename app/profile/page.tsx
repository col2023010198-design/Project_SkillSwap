'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

import BottomNav from '@/components/BottomNav';
import PostCard, { Post } from '@/components/PostCard';
import { fetchProfile, Profile } from '@/lib/profile';

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

/** Renders a single pill-shaped skill tag */
function SkillTag({ label }: { label: string }) {
  return (
    <span className="inline-block bg-[#1a2c36] border border-[#3a4f5a] text-[#5fa4c3] text-xs font-medium px-3 py-1 rounded-full">
      {label}
    </span>
  );
}

/** Verified checkmark badge */
function VerifiedBadge() {
  return (
    <span
      title="Verified"
      className="inline-flex items-center gap-1 bg-[#5fa4c3] text-white text-xs font-semibold px-2 py-0.5 rounded-full"
    >
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      Verified
    </span>
  );
}

type PostRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  created_at: string;
};

export default function ProfilePage() {
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Missing Supabase env vars');
    return createClient(url, key);
  }, []);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);

  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile().then(({ profile: p, error: e }) => {
      setProfile(p);
      setProfileError(e);
      setLoadingProfile(false);
    });
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    })();
  }, [supabase]);

  const fullName =
    profile?.first_name || profile?.last_name ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() : 'Your Name';

  const initials =
    fullName
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .map((w) => w.charAt(0).toUpperCase())
      .join('') || 'U';

  const deletePost = useCallback(
    async (postId: string) => {
      setPostsError(null);
      const { error } = await supabase.from('skill_swap_posts').delete().eq('id', postId);
      if (error) {
        setPostsError(error.message);
        return;
      }
      setUserPosts((prev) => prev.filter((p) => p.id !== postId));
    },
    [supabase]
  );

  const loadMyPosts = useCallback(async () => {
    if (!userId) return;

    setPostsError(null);

    const { data: postData, error: postErr } = await supabase
      .from('skill_swap_posts')
      .select('id,user_id,title,description,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (postErr) {
      setPostsError(postErr.message);
      return;
    }

    const postsRows = (postData ?? []) as PostRow[];
    if (postsRows.length === 0) {
      setUserPosts([]);
      return;
    }

    const postIds = postsRows.map((p) => p.id);

    // likes count
    const { data: likesRows, error: likesErr } = await supabase.from('post_likes').select('post_id').in('post_id', postIds);
    if (likesErr) {
      setPostsError(likesErr.message);
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
      setPostsError(comErr.message);
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
      setPostsError(rateErr.message);
      return;
    }

    const ratingAgg = new Map<string, { sum: number; count: number }>();
    for (const row of ratingRows ?? []) {
      const pid = (row as any).post_id as string;
      const val = Number((row as any).rating ?? 0);
      const prev = ratingAgg.get(pid) ?? { sum: 0, count: 0 };
      ratingAgg.set(pid, { sum: prev.sum + val, count: prev.count + 1 });
    }

    const username = profile?.username ?? 'unknown';
    const first = profile?.first_name ?? '';
    const last = profile?.last_name ?? '';
    const displayName = `${first} ${last}`.trim() || username || 'Unknown';

    const avatarInitials =
      displayName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w.charAt(0).toUpperCase())
        .join('') || 'U';

    const avatarUrl = profile?.avatar_url ?? null;

    const mapped: Post[] = postsRows.map((r) => {
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
          avatar: avatarInitials,
          avatar_url: avatarUrl,
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

    setUserPosts(mapped);
  }, [supabase, userId, profile]);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      setLoadingPosts(true);
      await loadMyPosts();
      setLoadingPosts(false);
    })();
  }, [userId, loadMyPosts]);

  const totalPostsCount = userPosts.length;
  const totalRatesReceived = userPosts.reduce((sum, p) => sum + (p.ratings_count ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#1a2c36] pb-24">
      <div className="max-w-2xl mx-auto">
        <header className="bg-[#2d3f47] border-b border-[#3a4f5a] p-4 sticky top-0 z-10 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Profile</h1>
        </header>

        {loadingProfile ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-[#5fa4c3] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : profileError ? (
          <div className="p-6 text-center text-red-400 text-sm">{profileError}</div>
        ) : (
          <>
            <div className="bg-[#2d3f47] border-b border-[#3a4f5a] p-6">
              <div className="flex flex-col items-center gap-4">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={fullName} className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5fa4c3] to-[#4a7a8d] flex items-center justify-center text-white font-bold text-lg">
                    {initials}
                  </div>
                )}

                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-bold text-white">{fullName}</h2>
                    {profile?.is_verified && <VerifiedBadge />}
                  </div>
                  {profile?.username && <p className="text-gray-400">@{profile.username}</p>}
                  {profile?.role && <p className="text-xs text-[#5fa4c3] capitalize font-medium">{profile.role}</p>}
                  {profile?.bio ? (
                    <p className="text-gray-300 text-sm leading-relaxed mt-1">{profile.bio}</p>
                  ) : (
                    <p className="text-xs text-gray-500 italic mt-1">No bio yet</p>
                  )}
                </div>

                <div className="flex gap-8 w-full justify-center pt-4 border-t border-[#3a4f5a]">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#5fa4c3]">{loadingPosts ? '…' : totalPostsCount}</p>
                    <p className="text-xs text-gray-400">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#5fa4c3]">{loadingPosts ? '…' : totalRatesReceived}</p>
                    <p className="text-xs text-gray-400">Rates</p>
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

            <div className="p-6 border-b border-[#3a4f5a]">
              <h3 className="text-lg font-bold text-white mb-4">Skills</h3>
              <div className="space-y-4">
                <div className="bg-[#2d3f47] rounded-lg p-3 border border-[#3a4f5a]">
                  {profile?.skills_to_teach?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills_to_teach.map((skill) => (
                        <SkillTag key={skill} label={skill} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No skills added yet</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <h3 className="text-lg font-bold text-white">Recent Posts</h3>

              {postsError && (
                <div className="rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
                  {postsError}
                </div>
              )}

              {loadingPosts ? (
                <div className="text-white/70 text-sm">Loading posts…</div>
              ) : userPosts.length > 0 ? (
                userPosts.map((post) => <PostCard key={post.id} post={post} onDeletePost={deletePost} />)
              ) : (
                <div className="bg-[#2d3f47] rounded-lg p-8 text-center border border-[#3a4f5a]">
                  <p className="text-gray-400 text-sm">No posts yet</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}