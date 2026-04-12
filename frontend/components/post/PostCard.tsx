'use client';

import { memo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiEye, FiTrendingUp, FiZap } from 'react-icons/fi';
import { PurePostActions } from '@/components/post/PostActions';
import Tag from '@/components/ui/Tag';
import { formatRelativeTime } from '@/lib/mockData';
import { Post, UserProfile } from '@/lib/types';

type PostCardProps = {
  post: Post;
  author: UserProfile;
  activeTag?: string | null;
  onSelectTag?: (tag: string) => void;
  liked?: boolean;
  bookmarked?: boolean;
  onLikeToggle?: (postId: number) => boolean;
  onBookmarkToggle?: (postId: number) => boolean;
};

function PostCard({ post, author, activeTag, onSelectTag, liked, bookmarked, onLikeToggle, onBookmarkToggle }: PostCardProps) {
  const router = useRouter();
  const handleOpenPost = useCallback(() => router.push(`/post/${post.id}`), [post.id, router]);
  const handleCommentClick = useCallback(() => router.push(`/post/${post.id}`), [post.id, router]);
  const resolvedLiked = liked ?? false;
  const resolvedBookmarked = bookmarked ?? false;
  const resolvedLikeToggle = onLikeToggle ?? (() => false);
  const resolvedBookmarkToggle = onBookmarkToggle ?? (() => false);

  return (
    <article className="dashboard-card content-auto cursor-pointer select-none overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1" onClick={handleOpenPost}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Image src={author.avatar} alt={author.name} width={48} height={48} sizes="48px" className="rounded-full border border-white/70 object-cover shadow-sm" />
          <div>
            <p className="text-sm font-semibold text-ink-900">{author.name}</p>
            <p className="text-xs text-ink-500">
              {author.role} · {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </div>
        <div className="rounded-full bg-gradient-to-r from-uit-50 to-ai-cyan/10 px-3 py-1 text-xs font-semibold text-uit-700">#{post.tags[0]}</div>
      </header>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-uit-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-uit-700">Feed wireframe</span>
        <span className="rounded-full bg-ink-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">Post card</span>
      </div>

      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink-900 transition-all duration-200 hover:text-uit-700">{post.title}</h2>
      <p className="mt-3 text-sm leading-7 text-ink-600">{post.excerpt}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <Tag key={`${post.id}-${tag}`} label={tag} active={activeTag === tag} onClick={onSelectTag ? () => onSelectTag(tag) : undefined} />
        ))}
      </div>

      <div className="relative mt-5 h-64 overflow-hidden rounded-[26px]">
        {post.image ? (
          <>
            <Image src={post.image} alt={post.title} fill sizes="(max-width: 1280px) 100vw, 900px" loading="lazy" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/55 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/20 bg-white/12 px-4 py-3 text-white backdrop-blur-md">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/70">AI relevance</p>
                <p className="mt-1 text-sm font-semibold">Recommended for developers following {post.tags[0]}</p>
              </div>
              <FiZap className="h-5 w-5" />
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-r from-slate-100 to-slate-200 text-sm font-medium text-slate-400">
            No image
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-ink-500">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5">
          <FiTrendingUp className="h-4 w-4 text-uit-700" />
          Score {post.trendingScore}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5">
          <FiEye className="h-4 w-4 text-uit-700" />
          {post.views} views
        </span>
      </div>

      <PurePostActions
        post={post}
        compact
        liked={resolvedLiked}
        bookmarked={resolvedBookmarked}
        onLikeToggle={resolvedLikeToggle}
        onBookmarkToggle={resolvedBookmarkToggle}
        onCommentClick={handleCommentClick}
      />
    </article>
  );
}

export default memo(PostCard);
