'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  rating: number;
  title: string;
  description: string;
  timestamp: string;
  likes: number;
  comments: number;
}

type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
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

export default function PostCard({ post }: { post: Post }) {
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      // Make the error obvious instead of failing in weird ways
      throw new Error(
        'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Check your .env.local and restart dev server.'
      );
    }

    return createClient(url, key);
  }, []);

  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<string | null>(null);

  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const [actionError, setActionError] = useState<string | null>(null);
  const [likesLocal, setLikesLocal] = useState(post.likes);
  const [commentsLocal, setCommentsLocal] = useState(post.comments);

  useEffect(() => setLikesLocal(post.likes), [post.likes]);
  useEffect(() => setCommentsLocal(post.comments), [post.comments]);

  useEffect(() => {
    if (!open) return;

    let active = true;

    (async () => {
      setActionError(null);
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;

      if (error) {
        setActionError(error.message);
        setMe(null);
        return;
      }

      setMe(data.user?.id ?? null);
    })();

    return () => {
      active = false;
    };
  }, [open, supabase]);

  const loadComments = async () => {
    setLoadingComments(true);
    setActionError(null);

    // ✅ IMPORTANT FIX: explicit FK join to profiles
    const { data, error } = await supabase
      .from('post_comments')
      .select(
        `
        id,
        content,
        created_at,
        user_id,
        profiles:profiles!post_comments_user_id_fkey (
          username,
          full_name,
          avatar_url
        )
      `
      )
      .eq('post_id', post.id)
      .order('created_at', { ascending: false });

    if (error) {
      setActionError(error.message);
      setLoadingComments(false);
      return;
    }

    setComments((data ?? []) as unknown as CommentRow[]);
    setLoadingComments(false);
  };

  useEffect(() => {
    if (!open) return;

    loadComments();

    // realtime updates for this post's comments
    const channel = supabase
      .channel(`comments:${post.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${post.id}`,
        },
        () => loadComments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, post.id, supabase]);

  const toggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setActionError(null);

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      setActionError(userErr?.message ?? 'Not authenticated');
      return;
    }

    const { data: existing, error: existErr } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('post_id', post.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existErr) {
      setActionError(existErr.message);
      return;
    }

    if (existing) {
      const { error: delErr } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', user.id);

      if (delErr) setActionError(delErr.message);
      else setLikesLocal((n) => Math.max(0, n - 1));
    } else {
      const { error: insErr } = await supabase
        .from('post_likes')
        .insert({ post_id: post.id, user_id: user.id });

      if (insErr) setActionError(insErr.message);
      else setLikesLocal((n) => n + 1);
    }
  };

  const submitComment = async () => {
    const clean = commentText.trim();
    if (!clean) return;

    setActionError(null);

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      setActionError(userErr?.message ?? 'Not authenticated');
      return;
    }

    const { error } = await supabase
      .from('post_comments')
      .insert({ post_id: post.id, user_id: user.id, content: clean });

    if (error) {
      setActionError(error.message);
      return;
    }

    setCommentText('');
    setCommentsLocal((n) => n + 1);
    // list refreshes via realtime
  };

  const deleteComment = async (commentId: string) => {
    setActionError(null);

    const { error } = await supabase.from('post_comments').delete().eq('id', commentId);

    if (error) {
      setActionError(error.message);
      return;
    }

    setCommentsLocal((n) => Math.max(0, n - 1));
    // list refreshes via realtime
  };

  return (
    <>
      {/* Card */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setOpen(true);
        }}
        className="bg-[#2d3f47] rounded-lg p-4 border border-[#3a4f5a] hover:border-[#5fa4c3] transition-colors cursor-pointer"
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5fa4c3] to-[#4a7a8d] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white truncate">{post.author.name}</h3>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-xs ${i < Math.floor(post.rating) ? 'text-yellow-400' : 'text-gray-600'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400">@{post.author.username}</p>
          </div>

          <button className="text-gray-400 hover:text-gray-300" onClick={(e) => e.stopPropagation()}>
            ⋮
          </button>
        </div>

        <h4 className="font-medium text-white mb-2">{post.title}</h4>
        <p className="text-sm text-gray-300 mb-3 line-clamp-2">{post.description}</p>

        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-[#3a4f5a] pt-3">
          <span>{post.timestamp}</span>
          <div className="flex gap-4">
            <button
              className="hover:text-[#5fa4c3] transition-colors flex items-center gap-1"
              onClick={toggleLike}
              aria-label="Like"
            >
              ❤️ {likesLocal}
            </button>
            <button
              className="hover:text-[#5fa4c3] transition-colors flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
              aria-label="Open comments"
            >
              💬 {commentsLocal}
            </button>
          </div>
        </div>

        {actionError && (
          <div className="mt-3 rounded-md border border-red-400/40 bg-red-500/10 p-2 text-xs text-red-200">
            {actionError}
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />

          <div
            className="relative w-full sm:max-w-2xl bg-[#1a2c36] border border-[#3a4f5a] rounded-t-2xl sm:rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#3a4f5a] flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-white font-semibold truncate">{post.title}</div>
                <div className="text-xs text-gray-400 truncate">
                  {post.author.name} · @{post.author.username}
                </div>
              </div>
              <button
                className="text-gray-300 hover:text-white px-2 py-1"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-200 mb-4">{post.description}</p>

              <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                <span>Comments</span>
                <span>{commentsLocal}</span>
              </div>

              <div className="space-y-3 max-h-[45vh] overflow-auto pr-1">
                {loadingComments ? (
                  <div className="text-sm text-white/70">Loading comments…</div>
                ) : comments.length === 0 ? (
                  <div className="text-sm text-white/60">No comments yet.</div>
                ) : (
                  comments.map((c) => {
                    const name = c.profiles?.full_name ?? c.profiles?.username ?? 'Unknown';
                    const uname = c.profiles?.username ?? 'unknown';
                    return (
                      <div key={c.id} className="bg-[#2d3f47] border border-[#3a4f5a] rounded-lg p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm text-white truncate">{name}</div>
                            <div className="text-xs text-gray-400 truncate">
                              @{uname} · {timeAgo(c.created_at)}
                            </div>
                          </div>

                          {me && c.user_id === me && (
                            <button
                              className="text-xs text-red-200 hover:text-red-100 px-2 py-1"
                              onClick={() => deleteComment(c.id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>

                        <div className="mt-2 text-sm text-gray-200 whitespace-pre-wrap break-words">{c.content}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="p-4 border-t border-[#3a4f5a]">
              <div className="flex items-center gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment…"
                  className="flex-1 bg-[#2d3f47] border border-[#3a4f5a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5fa4c3]"
                />
                <button
                  onClick={submitComment}
                  className="bg-[#5fa4c3] hover:bg-[#4f93b1] text-[#0b1b22] font-semibold rounded-lg px-4 py-2 text-sm"
                >
                  Send
                </button>
              </div>

              {actionError && (
                <div className="mt-2 rounded-md border border-red-400/40 bg-red-500/10 p-2 text-xs text-red-200">
                  {actionError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}