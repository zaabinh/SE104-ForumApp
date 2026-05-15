'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs, { ProfileTab } from '@/components/profile/ProfileTabs';
import { useToast } from '@/components/ui/Toast';
import { getStoredUser } from '@/lib/axios';
import { useI18n } from '@/lib/i18n';
import { getMyProfile, getUserBookmarks, getUserComments, getUserPosts, getUserProfile, ProfileComment, ProfilePost, ProfileSummary } from '@/lib/profileApi';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useResponsiveSidebar } from '@/lib/useResponsiveSidebar';

type ProfileHeaderData = ProfileSummary & {
  id?: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function PostList({ posts, emptyMessage, viewPostLabel }: { posts: ProfilePost[]; emptyMessage: string; viewPostLabel: string }) {
  if (!posts.length) {
    return <div className="card-surface p-6 text-sm text-ink-600">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article key={post.id} className="dashboard-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-ink-900">{post.title}</h3>
            <span className="shrink-0 text-xs text-ink-500">{formatDate(post.created_at)}</span>
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-ink-600">{post.content}</p>
          <Link href={`/post/${post.id}`} className="mt-4 inline-flex text-sm font-semibold text-uit-700">
            {viewPostLabel}
          </Link>
        </article>
      ))}
    </div>
  );
}

function ActivityList({ comments, emptyLabel, removedPostLabel, discussionLabel }: { comments: ProfileComment[]; emptyLabel: string; removedPostLabel: string; discussionLabel: string }) {
  if (!comments.length) {
    return <div className="card-surface p-6 text-sm text-ink-600">{emptyLabel}</div>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <article key={comment.id} className="dashboard-card p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink-900">{comment.post_title || removedPostLabel}</p>
            <span className="shrink-0 text-xs text-ink-500">{formatDate(comment.created_at)}</span>
          </div>
          <p className="mt-3 text-sm leading-7 text-ink-600">{comment.content}</p>
          <Link href={`/post/${comment.post_id}`} className="mt-4 inline-flex text-sm font-semibold text-uit-700">
            {discussionLabel}
          </Link>
        </article>
      ))}
    </div>
  );
}

function AboutPanel({ profile }: { profile: ProfileHeaderData }) {
  const { t } = useI18n();
  return (
    <section className="dashboard-card p-6">
      <p className="eyebrow">About wireframe</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink-900">Professional snapshot</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-[24px] border border-uit-100 bg-white/75 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-ink-400">Bio</p>
          <p className="mt-3 text-sm leading-7 text-ink-600">{profile.bio || t('profileNoBio')}</p>
        </div>
        <div className="rounded-[24px] border border-uit-100 bg-white/75 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-ink-400">Presence</p>
          <p className="mt-3 text-sm leading-7 text-ink-600">Followers, posts, and saved discussions are surfaced in a clean LinkedIn-like summary block.</p>
        </div>
      </div>
    </section>
  );
}

export default function Profile() {
  const params = useParams<{ id: string }>();
  const { pushToast } = useToast();
  const { t } = useI18n();
  const { isCheckingAuth, userEmail } = useAuthGuard();
  const { isSidebarCollapsed, isMobileSidebarOpen, setIsSidebarCollapsed, setIsMobileSidebarOpen } = useResponsiveSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<ProfileTab>('posts');
  const [profile, setProfile] = useState<ProfileHeaderData | null>(null);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [comments, setComments] = useState<ProfileComment[]>([]);
  const [bookmarks, setBookmarks] = useState<ProfilePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const handleCloseMobileSidebar = useCallback(() => setIsMobileSidebarOpen(false), [setIsMobileSidebarOpen]);
  const handleToggleSidebarCollapse = useCallback(() => setIsSidebarCollapsed((prev) => !prev), [setIsSidebarCollapsed]);
  const handleOpenMobileSidebar = useCallback(() => setIsMobileSidebarOpen(true), [setIsMobileSidebarOpen]);

  const username = useMemo(() => params.id, [params.id]);

  useEffect(() => {
    if (!username) {
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const [myProfile, userProfile, userPosts, userComments] = await Promise.all([
          getMyProfile(),
          getUserProfile(username),
          getUserPosts(username),
          getUserComments(username),
        ]);

        if (!isMounted) {
          return;
        }

        setProfile({
          ...userProfile,
          id: userProfile.id,
        });
        setPosts(userPosts);
        setComments(userComments);

        if (userProfile.is_current_user) {
          const savedPosts = await getUserBookmarks(username);
          if (isMounted) {
            setProfile((prev) => (prev ? { ...prev, id: myProfile.id } : prev));
            setBookmarks(savedPosts);
          }
        } else {
          setBookmarks([]);
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
            : 'Unable to load this profile.';
        if (isMounted) {
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [username]);

  if (isCheckingAuth || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-medium text-ink-700 shadow-card">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-uit-600" />
          {t('profileLoading')}
        </div>
      </main>
    );
  }

  const sidebarOffsetClass = isSidebarCollapsed ? 'md:ml-16' : 'md:ml-60';

  if (error || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="card-surface max-w-xl p-6">
          <h1 className="text-2xl font-bold text-ink-900">{t('profileUnavailable')}</h1>
          <p className="mt-3 text-sm text-ink-600">{error || t('profileNotFound')}</p>
        </div>
      </main>
    );
  }

  const storedUser = getStoredUser();
  const isCurrentUser = profile.is_current_user || storedUser?.username === profile.username;

  return (
    <main className="min-h-screen">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={handleCloseMobileSidebar}
        onToggleCollapse={handleToggleSidebarCollapse}
      />
      <Topbar
        isSidebarCollapsed={isSidebarCollapsed}
        onOpenMobileSidebar={handleOpenMobileSidebar}
        userEmail={userEmail}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className={`px-4 py-6 transition-all duration-300 ${sidebarOffsetClass}`}>
        <div className="mx-auto max-w-[1100px]">
          <section className="space-y-5">
            <ProfileHeader
              user={profile}
              isCurrentUser={isCurrentUser}
              isFollowing={profile.is_following}
              onToggleFollow={(nextFollowing) => {
                setProfile((prev) =>
                  prev
                    ? {
                        ...prev,
                        is_following: nextFollowing,
                        followers_count: prev.followers_count + (nextFollowing ? 1 : -1),
                      }
                    : prev
                );
                pushToast(nextFollowing ? `Following @${profile.username}` : `Unfollowed @${profile.username}`);
              }}
            />
            <ProfileTabs value={tab} onChange={setTab} />

            {tab === 'posts' ? <PostList posts={posts} emptyMessage={t('profileNoPostsYet')} viewPostLabel={t('profileViewPost')} /> : null}
            {tab === 'about' ? <AboutPanel profile={profile} /> : null}
            {tab === 'activity' ? (
              <ActivityList
                comments={comments}
                emptyLabel={t('profileNoActivity')}
                removedPostLabel={t('profileRemovedPost')}
                discussionLabel={t('profileGoDiscussion')}
              />
            ) : null}
            {tab === 'bookmarks' ? (
              isCurrentUser ? (
                <PostList posts={bookmarks} emptyMessage={t('profileNoSavedYet')} viewPostLabel={t('profileViewPost')} />
              ) : (
                <div className="card-surface p-6 text-sm text-ink-600">{t('profileSavedPrivate')}</div>
              )
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}







