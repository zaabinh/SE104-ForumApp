'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import AuthorCard from '@/components/post/AuthorCard';
import PostDetail from '@/components/post/PostDetail';
import RelatedPosts from '@/components/post/RelatedPosts';
import { fetchCurrentUser } from '@/lib/axios';
import { getFeed, getPost, toggleBookmark, togglePostLike, getSimilarPosts } from '@/lib/forumApi';
import { useI18n } from '@/lib/i18n';
import { getUserProfile } from '@/lib/profileApi';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useResponsiveSidebar } from '@/lib/useResponsiveSidebar';
import { Post, UserProfile } from '@/lib/types';

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
    status: post.status,
    title: post.title,
    content: post.content,
    excerpt: `${post.content.slice(0, 120)}${post.content.length > 120 ? '...' : ''}`,
    tags: post.tags || [],
    image: post.cover_image ?? '',
    createdAt: post.created_at,
    likes: post.likes_count || 0,
    comments: post.comments_count || 0,
    shares: post.shares_count || 0,
    views: post.views_count || 0,
    trendingScore: post.trending_score || 0,
  };
}

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const { t } = useI18n();
  const { isCheckingAuth, userEmail } = useAuthGuard();
  const { isSidebarCollapsed, isMobileSidebarOpen, setIsSidebarCollapsed, setIsMobileSidebarOpen } = useResponsiveSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<UserProfile | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Array<{ post: Post; author: UserProfile }>>([]);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const postId = Number(params.id);

  useEffect(() => {
    if (!Number.isFinite(postId)) {
      setError(t('postInvalidId'));
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadPost = async () => {
      setLoading(true);
      setError('');
      try {
        const [postData, currentUserData] = await Promise.all([
          getPost(postId),
          fetchCurrentUser(),
        ]);

        if (!isMounted) {
          return;
        }

        setPost(mapPost(postData));
        const baseAuthor = mapAuthor(postData.author);
        try {
          const authorProfile = await getUserProfile(baseAuthor.username.replace(/^@/, ''));
          if (isMounted) {
            setAuthor({
              ...baseAuthor,
              followers: authorProfile.followers_count,
              isFollowing: authorProfile.is_following,
            });
          }
        } catch {
          if (isMounted) {
            setAuthor(baseAuthor);
          }
        }
        setLiked(postData.is_liked);
        setBookmarked(postData.is_bookmarked);
        setCurrentUser({
          id: currentUserData.id,
          name: currentUserData.full_name || currentUserData.username || currentUserData.email,
          username: currentUserData.username || currentUserData.email,
          avatar: currentUserData.avatar_url || FALLBACK_AVATAR,
          bio: currentUserData.bio || '',
          role: currentUserData.role || 'Student',
          followers: 0,
          following: 0,
          followingIds: [],
          likedPostIds: [],
          bookmarkedPostIds: [],
          likedCommentIds: [],
          isCurrentUser: true,
        });

        // Lấy bài viết tương tự
        try {
          const similarPostsData = await getSimilarPosts(postId, { limit: 5, min_similarity: 0.1 });
          if (isMounted && similarPostsData.items) {
            setRelatedPosts(
              similarPostsData.items.map((item) => ({
                post: mapPost(item.post),
                author: mapAuthor(item.post.author),
                similarity_score: item.similarity_score,
                similarity_reason: item.similarity_reason,
              }))
            );
          }
        } catch (similarError) {
          // Nếu API gợi ý thất bại, dùng fallback là getFeed
          console.warn('Failed to fetch similar posts, using fallback:', similarError);
          try {
            const feedData = await getFeed({ page: 1, pageSize: 5 });
            if (isMounted && feedData.items) {
              setRelatedPosts(
                feedData.items
                  .filter((item) => item.id !== postId)
                  .slice(0, 5)
                  .map((item) => ({
                    post: mapPost(item),
                    author: mapAuthor(item.author),
                  }))
              );
            }
          } catch {
            // Nếu cả 2 đều fail, không hiển thị gợi ý
            if (isMounted) {
              setRelatedPosts([]);
            }
          }
        }
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
            : t('postLoadError');
        if (isMounted) {
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadPost();
    return () => {
      isMounted = false;
    };
  }, [postId, t]);

  const isOwner = useMemo(() => (post ? post.authorId === currentUser?.id : false), [currentUser?.id, post]);
  const isPendingOwnerView = Boolean(post && post.status === 'pending' && isOwner);

  const handleToggleLike = useCallback(
    (id: number) => {
      const next = !liked;
      setLiked(next);
      setPost((prev) => (prev ? { ...prev, likes: next ? prev.likes + 1 : Math.max(0, prev.likes - 1), trendingScore: next ? prev.trendingScore + 4 : Math.max(0, prev.trendingScore - 4) } : prev));
      void togglePostLike(id).catch(() => {
        setLiked(!next);
        setPost((prev) => (prev ? { ...prev, likes: next ? Math.max(0, prev.likes - 1) : prev.likes + 1, trendingScore: next ? Math.max(0, prev.trendingScore - 4) : prev.trendingScore + 4 } : prev));
      });
      return next;
    },
    [liked]
  );

  const handleToggleBookmark = useCallback(
    (id: number) => {
      const next = !bookmarked;
      setBookmarked(next);
      void toggleBookmark(id).catch(() => {
        setBookmarked(!next);
      });
      return next;
    },
    [bookmarked]
  );

  if (isCheckingAuth || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-card">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-forum-primary" />
          {t('postLoading')}
        </div>
      </main>
    );
  }

  const sidebarOffsetClass = isSidebarCollapsed ? 'md:ml-16' : 'md:ml-60';

  if (error || !post || !author) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
        <Topbar
          isSidebarCollapsed={isSidebarCollapsed}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          userEmail={userEmail}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className={`px-4 py-8 transition-all duration-200 ${sidebarOffsetClass}`}>
          <div className="card-surface mx-auto max-w-3xl p-8">
            <h1 className="text-2xl font-bold text-slate-900">{t('postNotFound')}</h1>
            <p className="mt-3 text-sm text-slate-500">{error || t('postNotFoundDesc')}</p>
            <Link href="/feed" className="mt-5 inline-flex rounded-2xl bg-forum-primary px-4 py-2 text-sm font-semibold text-white">
              {t('postBackToFeed')}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />
      <Topbar
        isSidebarCollapsed={isSidebarCollapsed}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        userEmail={userEmail}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className={`px-4 py-6 transition-all duration-200 ${sidebarOffsetClass}`}>
        <div className="mx-auto grid max-w-[1600px] gap-6 xl:grid-cols-[minmax(0,760px)_320px] xl:justify-center">
          <div className="space-y-4 lg:pr-2">
            <Link href="/feed" className="inline-flex text-sm font-medium text-slate-500 transition-all duration-200 hover:text-forum-primary">
              {t('postBackToFeed')}
            </Link>
            {isPendingOwnerView ? (
              <div className="card-surface rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
                Bài viết của bạn đang chờ duyệt. Bài chỉ hiển thị công khai sau khi admin phê duyệt.
              </div>
            ) : null}
            <PostDetail
              post={post}
              author={author}
              currentUser={currentUser}
              isOwner={isOwner}
              liked={liked}
              bookmarked={bookmarked}
              onLikeToggle={handleToggleLike}
              onBookmarkToggle={handleToggleBookmark}
            />
          </div>
          <aside className="hidden h-fit space-y-4 xl:sticky xl:top-24 xl:block">
            <AuthorCard author={author} currentUserId={currentUser?.id} />
            <RelatedPosts posts={relatedPosts} />
          </aside>
        </div>
      </div>
    </main>
  );
}
