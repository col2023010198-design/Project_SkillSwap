'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import PostCard, { Post } from '@/components/PostCard';
import { fetchProfile, Profile } from '@/lib/profile';

// TODO: Fetch from 'posts' table dynamically
// For now, posts are hardcoded. Future implementation should:
// 1. Create a posts table in Supabase (ID, User_ID, Content, Created_At, etc.)
// 2. Fetch posts using: supabase.from('posts').select('*').eq('user_id', userId)
// 3. Remove this hardcoded array and replace with dynamic data
const userPosts: Post[] = [];

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

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile().then(({ profile: p, error: e }) => {
      setProfile(p);
      setError(e);
      setLoading(false);
    });
  }, []);

  const fullName =
    profile?.first_name || profile?.last_name
      ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
      : 'Your Name';

  const initials = fullName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#1a2c36] pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="bg-[#2d3f47] border-b border-[#3a4f5a] p-4 sticky top-0 z-10 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Profile</h1>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-[#5fa4c3] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400 text-sm">{error}</div>
        ) : (
          <>
            {/* Profile Info */}
            <div className="bg-[#2d3f47] border-b border-[#3a4f5a] p-6">
              <div className="flex flex-col items-center gap-4">
                {/* Avatar */}
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={fullName}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5fa4c3] to-[#4a7a8d] flex items-center justify-center text-white font-bold text-lg">
                    {initials}
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

                {/* Bio */}
                <p className="text-center mt-4 px-4">
                  {profile?.bio?.trim() ? (
                    <span className="text-gray-400">{profile.bio}</span>
                  ) : (
                    <span className="text-gray-500 italic">No Bio</span>
                  )}
                </p>

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
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}