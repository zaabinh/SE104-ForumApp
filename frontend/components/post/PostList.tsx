'use client';

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiImage, FiPlusCircle, FiZap } from 'react-icons/fi';
import FeedFilter from '@/components/feed/FeedFilter';
import FeedSort from '@/components/feed/FeedSort';
import FeedTabs from '@/components/feed/FeedTabs';
import PostCard from '@/components/post/PostCard';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { getSortValue } from '@/lib/mockData';
import { useForum } from '@/lib/forumStore';
import { FeedMode, SortOption } from '@/lib/types';

type PostListProps = {
  searchQuery?: string;
};

export default function PostList({ searchQuery = '' }: PostListProps) {
  const { currentUser, posts, tags, users, toggleBookmark, togglePostLike } = useForum();
  const [feedMode, setFeedMode] = useState<FeedMode>('for-you');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [visibleCount, setVisibleCount] = useState(4);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const authorsById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);
  const likedPostIds = currentUser.likedPostIds;
  const bookmarkedPostIds = currentUser.bookmarkedPostIds;
  const handleSelectTag = useCallback((tag: string) => setActiveTag(tag), []);
  const handleClearTag = useCallback(() => setActiveTag(null), []);
  const handleFeedModeChange = useCallback((value: FeedMode) => setFeedMode(value), []);
  const handleSortChange = useCallback((value: SortOption) => setSortBy(value), []);
  const handleToggleLike = useCallback((postId: number) => togglePostLike(postId), [togglePostLike]);
  const handleToggleBookmark = useCallback((postId: number) => toggleBookmark(postId), [toggleBookmark]);

  const filteredPosts = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();

    return posts
      .filter((post) => {
        if (feedMode === 'following' && !currentUser.followingIds.includes(post.authorId)) {
          return false;
        }

        if (feedMode === 'trending' && post.trendingScore < 70) {
          return false;
        }

        if (activeTag && !post.tags.includes(activeTag)) {
          return false;
        }

        if (!term) {
          return true;
        }

        return `${post.title} ${post.tags.join(' ')}`.toLowerCase().includes(term);
      })
      .sort((left, right) => getSortValue(right, sortBy) - getSortValue(left, sortBy));
  }, [activeTag, currentUser.followingIds, feedMode, posts, searchQuery, sortBy]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  const loadMore = useCallback(() => {
    if (isLoadingMore || visibleCount >= filteredPosts.length) return;
    setIsLoadingMore(true);
    window.requestAnimationFrame(() => {
      startTransition(() => {
        setVisibleCount((prev) => prev + 4);
      });
      setIsLoadingMore(false);
    });
  }, [filteredPosts.length, isLoadingMore, visibleCount]);

  useEffect(() => {
    setVisibleCount(4);
  }, [feedMode, activeTag, sortBy, searchQuery]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMore();
          }
        });
      },
      { rootMargin: '220px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <section className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="card-surface flex items-center gap-3 px-4 py-3">
            <p className="text-sm font-semibold text-ink-800">Feed settings</p>
          </div>
          <div className="card-surface flex items-center gap-3 px-4 py-3">
            <p className="text-sm font-semibold text-ink-800">{filteredPosts.length} posts</p>
          </div>
        </div>
        <div className="hidden items-center gap-3 xl:flex">
          <div className="card-surface flex items-center gap-3 px-4 py-3">
            <p className="text-sm font-semibold text-ink-800">{tags.length} tags</p>
          </div>
          <div className="card-surface flex items-center gap-3 px-4 py-3">
            <p className="text-sm font-semibold text-ink-800">{currentUser.bookmarkedPostIds.length} saved</p>
          </div>
        </div>
      </section>

      <section className="dashboard-card overflow-hidden p-5">
        <div className="flex items-start gap-4">
          <Avatar src={currentUser.avatar} alt={currentUser.name} size={52} />
          <div className="min-w-0 flex-1">
            <div className="rounded-[26px] border border-uit-100 bg-gradient-to-r from-uit-50 via-white to-ai-cyan/10 p-4">
              <p className="text-sm font-medium text-ink-700">Share an update, ask a question, or let AI help draft your next technical post.</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button className="gap-2">
                <FiPlusCircle className="h-4 w-4" />
                Create post
              </Button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl border border-uit-100 bg-white/80 px-4 py-2.5 text-sm font-semibold text-ink-700 transition-all duration-200 hover:border-uit-300 hover:bg-uit-50"
              >
                <FiImage className="h-4 w-4 text-uit-700" />
                Add media
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl border border-uit-100 bg-white/80 px-4 py-2.5 text-sm font-semibold text-ink-700 transition-all duration-200 hover:border-uit-300 hover:bg-uit-50"
              >
                <FiZap className="h-4 w-4 text-uit-700" />
                AI draft
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <FeedTabs value={feedMode} onChange={handleFeedModeChange} />
        <FeedSort value={sortBy} onChange={handleSortChange} />
      </div>

      <FeedFilter tags={tags} activeTag={activeTag} onSelectTag={handleSelectTag} onClear={handleClearTag} />

      {searchQuery ? (
        <div className="rounded-[24px] border border-white/70 bg-white/80 px-4 py-3 text-sm text-ink-600 shadow-card">
          Search results for <span className="font-semibold text-ink-900">"{searchQuery}"</span>
        </div>
      ) : null}

      {!filteredPosts.length ? (
        <div className="card-surface p-6 text-center">
          <h3 className="font-semibold text-ink-900">No posts found</h3>
          <p className="mt-2 text-sm text-ink-600">Try another keyword or clear the current tag filter.</p>
        </div>
      ) : (
        <div className="grid gap-5 2xl:grid-cols-2">
          {visiblePosts.map((post) => {
            const author = authorsById.get(post.authorId);

            if (!author) {
              return null;
            }

            return (
              <PostCard
                key={post.id}
                post={post}
                author={author}
                activeTag={activeTag}
                onSelectTag={handleSelectTag}
                liked={likedPostIds.includes(post.id)}
                bookmarked={bookmarkedPostIds.includes(post.id)}
                onLikeToggle={handleToggleLike}
                onBookmarkToggle={handleToggleBookmark}
              />
            );
          })}
        </div>
      )}

      {isLoadingMore ? (
        <div className="grid gap-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="card-surface p-5">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
              <Skeleton className="mt-5 h-48 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      ) : null}

      <div ref={sentinelRef} className="h-6" />
    </section>
  );
}
