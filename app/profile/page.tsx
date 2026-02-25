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

                {/* Name, username, badge */}
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-bold text-white">{fullName}</h2>
                    {profile?.is_verified && <VerifiedBadge />}
                  </div>
                  {profile?.username && (
                    <p className="text-gray-400">@{profile.username}</p>
                  )}
                  {profile?.role && (
                    <p className="text-xs text-[#5fa4c3] capitalize font-medium">
                      {profile.role}
                    </p>
                  )}
                  {profile?.bio ? (
                    <p className="text-gray-300 text-sm leading-relaxed mt-1">{profile.bio}</p>
                  ) : (
                    <p className="text-xs text-gray-500 italic mt-1">No bio yet</p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-8 w-full justify-center pt-4 border-t border-[#3a4f5a]">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#5fa4c3]">
                      {profile?.rating != null
                        ? Number(profile.rating).toFixed(1)
                        : '0.0'}
                    </p>
                    <p className="text-xs text-gray-400">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#5fa4c3]">
                      {profile?.posts_count ?? 0}
                    </p>
                    <p className="text-xs text-gray-400">Posts</p>
                  </div>
                </div>

                  {/* Edit Profile Button */}
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

            {/* Posts */}
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-bold text-white">Recent Posts</h3>
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="bg-[#2d3f47] rounded-lg p-8 text-center border border-[#3a4f5a]">
                  <p className="text-gray-400 text-sm">No posts yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}