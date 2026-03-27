'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FeedFilter from '@/components/feed/FeedFilter';
import FeedSort from '@/components/feed/FeedSort';
import FeedTabs from '@/components/feed/FeedTabs';
import PostCard from '@/components/post/PostCard';
import Skeleton from '@/components/ui/Skeleton';
import { getSortValue } from '@/lib/mockData';
import { useForum } from '@/lib/forumStore';
import { FeedMode, SortOption } from '@/lib/types';

type PostListProps = {
  searchQuery?: string;
};

export default function PostList({ searchQuery = '' }: PostListProps) {
  const { currentUser, posts, tags } = useForum();
  const [feedMode, setFeedMode] = useState<FeedMode>('for-you');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

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
    window.setTimeout(() => {
      setVisibleCount((prev) => prev + 6);
      setIsLoadingMore(false);
    }, 650);
  }, [filteredPosts.length, isLoadingMore, visibleCount]);

  useEffect(() => {
    setVisibleCount(6);
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
    <section className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <FeedTabs value={feedMode} onChange={setFeedMode} />
        <FeedSort value={sortBy} onChange={setSortBy} />
      </div>

      <FeedFilter tags={tags} activeTag={activeTag} onSelectTag={setActiveTag} onClear={() => setActiveTag(null)} />

      {searchQuery ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          Search results for <span className="font-semibold text-slate-900">"{searchQuery}"</span>
        </div>
      ) : null}

      {!filteredPosts.length ? (
        <div className="card-surface p-6 text-center">
          <h3 className="font-semibold text-slate-900">No posts found</h3>
          <p className="mt-2 text-sm text-slate-600">Try another keyword or clear the current tag filter.</p>
        </div>
      ) : (
        visiblePosts.map((post) => <PostCard key={post.id} post={post} activeTag={activeTag} onSelectTag={setActiveTag} />)
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
