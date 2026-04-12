'use client';

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiImage, FiPlusCircle, FiZap } from 'react-icons/fi';
import FeedFilter from '@/components/feed/FeedFilter';
import FeedSort from '@/components/feed/FeedSort';
import FeedTabs from '@/components/feed/FeedTabs';
import PostCard from '@/components/post/PostCard';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { getStoredUser } from '@/lib/axios';
import { getFeed } from '@/lib/forumApi';
import { FeedMode, SortOption, Post, UserProfile } from '@/lib/types';

type PostListProps = {
  searchQuery?: string;
};

const FALLBACK_AVATAR = '/images/uit.png';

function mapAuthor(author: {
  id: string;
  username: string | null;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: string;
}): UserProfile {
  const resolvedUsername = author.username || author.id;
  return {
    id: author.id,
    name: author.full_name || resolvedUsername,
    username: resolvedUsername,
    avatar: author.avatar_url || FALLBACK_AVATAR,
    bio: author.bio || '',
    role: author.role || 'Student',
    followers: 0,
    following: 0,
    followingIds: [],
    likedPostIds: [],
    bookmarkedPostIds: [],
    likedCommentIds: [],
  };
}

function mapPost(post: any): Post {
  return {
    id: post.id,
    authorId: post.user_id,
    title: post.title,
    content: post.content,
    excerpt: `${post.content.slice(0, 120)}${post.content.length > 120 ? '...' : ''}`,
    tags: post.tags || [],
    image: post.cover_image || FALLBACK_AVATAR,
    createdAt: post.created_at,
    likes: post.likes_count || 0,
    comments: post.comments_count || 0,
    shares: post.shares_count || 0,
    views: post.views_count || 0,
    trendingScore: post.trending_score || 0,
  };
}

export default function PostList({ searchQuery = '' }: PostListProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [usersById, setUsersById] = useState<Record<string, UserProfile>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedMode, setFeedMode] = useState<FeedMode>('for-you');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [visibleCount, setVisibleCount] = useState(4);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [likedPostIds, setLikedPostIds] = useState<number[]>([]);
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<number[]>([]);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const storedUser = useMemo(() => getStoredUser(), []);
  const currentUser = useMemo<UserProfile | null>(() => {
    if (!storedUser) {
      return null;
    }
    return {
      id: storedUser.id,
      name: storedUser.full_name || storedUser.username || storedUser.email,
      username: storedUser.username || storedUser.email,
      avatar: storedUser.avatar_url || FALLBACK_AVATAR,
      bio: storedUser.bio || '',
      role: storedUser.role || 'Student',
      followers: 0,
      following: 0,
      followingIds: [],
      likedPostIds,
      bookmarkedPostIds,
      likedCommentIds: [],
      isCurrentUser: true,
    };
  }, [bookmarkedPostIds, likedPostIds, storedUser]);

  useEffect(() => {
    let isMounted = true;

    const loadFeed = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getFeed({
          page: 1,
          pageSize: 50,
          search: searchQuery,
          tag: activeTag,
          mode: feedMode,
          sort: sortBy,
        });
        if (!isMounted) {
          return;
        }

        const mappedPosts = response.items.map(mapPost);
        const mappedUsers = response.items.reduce<Record<string, UserProfile>>((acc, item) => {
          acc[item.author.id] = mapAuthor(item.author);
          return acc;
        }, storedUser
          ? {
              [storedUser.id]: {
                id: storedUser.id,
                name: storedUser.full_name || storedUser.username || storedUser.email,
                username: storedUser.username || storedUser.email,
                avatar: storedUser.avatar_url || FALLBACK_AVATAR,
                bio: storedUser.bio || '',
                role: storedUser.role || 'Student',
                followers: 0,
                following: 0,
                followingIds: [],
                likedPostIds: [],
                bookmarkedPostIds: [],
                likedCommentIds: [],
                isCurrentUser: true,
              },
            }
          : {});

        setPosts(mappedPosts);
        setUsersById(mappedUsers);
        setTags(Array.from(new Set(response.items.flatMap((item) => item.tags))).sort());
        setLikedPostIds(response.items.filter((item) => item.is_liked).map((item) => item.id));
        setBookmarkedPostIds(response.items.filter((item) => item.is_bookmarked).map((item) => item.id));
      } catch (loadError) {
        const message =
          typeof loadError === 'object' &&
          loadError !== null &&
          'response' in loadError &&
          typeof loadError.response === 'object' &&
          loadError.response !== null &&
          'data' in loadError.response &&
          typeof loadError.response.data === 'object' &&
          loadError.response.data !== null &&
          'detail' in loadError.response.data
            ? String(loadError.response.data.detail)
            : 'Failed to load posts.';
        if (isMounted) {
          setError(message);
          setPosts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFeed();
    return () => {
      isMounted = false;
    };
  }, [activeTag, feedMode, searchQuery, sortBy, storedUser]);

  const handleSelectTag = useCallback((tag: string) => setActiveTag(tag), []);
  const handleClearTag = useCallback(() => setActiveTag(null), []);
  const handleFeedModeChange = useCallback((value: FeedMode) => setFeedMode(value), []);
  const handleSortChange = useCallback((value: SortOption) => setSortBy(value), []);

  const handleToggleLike = useCallback(
    (postId: number) => {
      const nextLiked = !likedPostIds.includes(postId);
      setLikedPostIds((prev) => (nextLiked ? [...prev, postId] : prev.filter((id) => id !== postId)));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: nextLiked ? post.likes + 1 : Math.max(0, post.likes - 1),
                trendingScore: nextLiked ? post.trendingScore + 4 : Math.max(0, post.trendingScore - 4),
              }
            : post
        )
      );
      import('@/lib/forumApi').then(({ togglePostLike }) => togglePostLike(postId)).catch(() => {
        setLikedPostIds((prev) => (nextLiked ? prev.filter((id) => id !== postId) : [...prev, postId]));
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes: nextLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
                  trendingScore: nextLiked ? Math.max(0, post.trendingScore - 4) : post.trendingScore + 4,
                }
              : post
          )
        );
      });
      return nextLiked;
    },
    [likedPostIds]
  );

  const handleToggleBookmark = useCallback(
    (postId: number) => {
      const nextBookmarked = !bookmarkedPostIds.includes(postId);
      setBookmarkedPostIds((prev) => (nextBookmarked ? [...prev, postId] : prev.filter((id) => id !== postId)));
      import('@/lib/forumApi').then(({ toggleBookmark }) => toggleBookmark(postId)).catch(() => {
        setBookmarkedPostIds((prev) => (nextBookmarked ? prev.filter((id) => id !== postId) : [...prev, postId]));
      });
      return nextBookmarked;
    },
    [bookmarkedPostIds]
  );

  const visiblePosts = posts.slice(0, visibleCount);

  const loadMore = useCallback(() => {
    if (isLoadingMore || visibleCount >= posts.length) {
      return;
    }
    setIsLoadingMore(true);
    window.requestAnimationFrame(() => {
      startTransition(() => {
        setVisibleCount((prev) => prev + 4);
      });
      setIsLoadingMore(false);
    });
  }, [isLoadingMore, posts.length, visibleCount]);

  useEffect(() => {
    setVisibleCount(4);
  }, [feedMode, activeTag, sortBy, searchQuery]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) {
      return;
    }

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
            <p className="text-sm font-semibold text-ink-800">{posts.length} posts</p>
          </div>
        </div>
        <div className="hidden items-center gap-3 xl:flex">
          <div className="card-surface flex items-center gap-3 px-4 py-3">
            <p className="text-sm font-semibold text-ink-800">{tags.length} tags</p>
          </div>
          <div className="card-surface flex items-center gap-3 px-4 py-3">
            <p className="text-sm font-semibold text-ink-800">{bookmarkedPostIds.length} saved</p>
          </div>
        </div>
      </section>

      <section className="dashboard-card overflow-hidden p-5">
        <div className="flex items-start gap-4">
          <Avatar src={currentUser?.avatar || FALLBACK_AVATAR} alt={currentUser?.name || 'Current user'} size={52} />
          <div className="min-w-0 flex-1">
            <div className="rounded-[26px] border border-uit-100 bg-gradient-to-r from-uit-50 via-white to-ai-cyan/10 p-4">
              <p className="text-sm font-medium text-ink-700">Share an update, ask a question, or let AI help draft your next technical post.</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button className="gap-2" onClick={() => router.push('/create')}>
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

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-surface p-5">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
              <Skeleton className="mt-5 h-48 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      ) : searchQuery ? (
        <div className="rounded-[24px] border border-white/70 bg-white/80 px-4 py-3 text-sm text-ink-600 shadow-card">
          Search results for <span className="font-semibold text-ink-900">"{searchQuery}"</span>
        </div>
      ) : null}

      {!loading && error ? <div className="card-surface p-6 text-center text-sm text-rose-600">{error}</div> : null}

      {!loading && !error && !posts.length ? (
        <div className="card-surface p-6 text-center">
          <h3 className="font-semibold text-ink-900">No posts found</h3>
          <p className="mt-2 text-sm text-ink-600">Try another keyword or clear the current tag filter.</p>
        </div>
      ) : (
        <div className="grid gap-5 2xl:grid-cols-2">
          {visiblePosts.map((post) => {
            const author = usersById[post.authorId];
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
