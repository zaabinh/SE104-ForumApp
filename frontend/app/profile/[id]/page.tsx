'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import PostCard from '@/components/post/PostCard';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs, { ProfileTab } from '@/components/profile/ProfileTabs';
import { useToast } from '@/components/ui/Toast';
import { useForum } from '@/lib/forumStore';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useResponsiveSidebar } from '@/lib/useResponsiveSidebar';

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const { currentUser, comments, getPostById, getUserById, posts, toggleFollowUser } = useForum();
  const { pushToast } = useToast();
  const { isCheckingAuth, userEmail } = useAuthGuard();
  const { isSidebarCollapsed, isMobileSidebarOpen, setIsSidebarCollapsed, setIsMobileSidebarOpen } = useResponsiveSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<ProfileTab>('posts');

  const profile = getUserById(params.id);

  const profilePosts = useMemo(() => posts.filter((post) => post.authorId === params.id), [params.id, posts]);
  const profileComments = useMemo(() => comments.filter((comment) => comment.authorId === params.id), [comments, params.id]);
  const bookmarkedPosts = useMemo(() => posts.filter((post) => profile?.bookmarkedPostIds.includes(post.id)), [posts, profile?.bookmarkedPostIds]);
  const likedPosts = useMemo(() => posts.filter((post) => profile?.likedPostIds.includes(post.id)), [posts, profile?.likedPostIds]);

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-card">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-forum-primary" />
          Loading profile...
        </div>
      </main>
    );
  }

  const sidebarOffsetClass = isSidebarCollapsed ? 'md:ml-20' : 'md:ml-60';

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="card-surface max-w-xl p-6">
          <h1 className="text-2xl font-bold text-slate-900">Profile not found</h1>
        </div>
      </main>
    );
  }

  const isCurrentUser = profile.id === currentUser.id;
  const isFollowing = currentUser.followingIds.includes(profile.id);

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
        <div className="mx-auto max-w-[1400px] space-y-5">
          <ProfileHeader
            user={profile}
            isCurrentUser={isCurrentUser}
            isFollowing={isFollowing}
            onToggleFollow={() => {
              const next = toggleFollowUser(profile.id);
              pushToast(next ? `Following ${profile.name}` : `Unfollowed ${profile.name}`);
            }}
          />
          <ProfileTabs value={tab} onChange={setTab} />

          {tab === 'posts' ? (
            profilePosts.length ? (
              <div className="space-y-4">{profilePosts.map((post) => <PostCard key={post.id} post={post} />)}</div>
            ) : (
              <div className="card-surface p-6 text-sm text-slate-600">No posts yet.</div>
            )
          ) : null}

          {tab === 'comments' ? (
            profileComments.length ? (
              <div className="space-y-3">
                {profileComments.map((comment) => {
                  const post = getPostById(comment.postId);
                  return (
                    <article key={comment.id} className="card-surface p-5">
                      <p className="text-sm font-semibold text-slate-900">{post?.title ?? 'Post removed'}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{comment.content}</p>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="card-surface p-6 text-sm text-slate-600">No comments yet.</div>
            )
          ) : null}

          {tab === 'bookmarks' ? (
            bookmarkedPosts.length ? (
              <div className="space-y-4">{bookmarkedPosts.map((post) => <PostCard key={post.id} post={post} />)}</div>
            ) : (
              <div className="card-surface p-6 text-sm text-slate-600">No bookmarks saved.</div>
            )
          ) : null}

          {tab === 'likes' ? (
            likedPosts.length ? (
              <div className="space-y-4">{likedPosts.map((post) => <PostCard key={post.id} post={post} />)}</div>
            ) : (
              <div className="card-surface p-6 text-sm text-slate-600">No liked posts yet.</div>
            )
          ) : null}
        </div>
      </div>
    </main>
  );
}
