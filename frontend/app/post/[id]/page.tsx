'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import AuthorCard from '@/components/post/AuthorCard';
import PostDetail from '@/components/post/PostDetail';
import RelatedPosts from '@/components/post/RelatedPosts';
import { useForum } from '@/lib/forumStore';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useResponsiveSidebar } from '@/lib/useResponsiveSidebar';
import { useState } from 'react';

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const { isCheckingAuth, userEmail } = useAuthGuard();
  const { isSidebarCollapsed, isMobileSidebarOpen, setIsSidebarCollapsed, setIsMobileSidebarOpen } = useResponsiveSidebar();
  const { getPostById } = useForum();
  const [searchQuery, setSearchQuery] = useState('');

  const post = getPostById(Number(params.id));

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-card">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-forum-primary" />
          Loading post...
        </div>
      </main>
    );
  }

  const sidebarOffsetClass = isSidebarCollapsed ? 'md:ml-16' : 'md:ml-60';

  if (!post) {
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
            <h1 className="text-2xl font-bold text-slate-900">Post not found</h1>
            <p className="mt-3 text-sm text-slate-500">The post may have been removed or the URL is incorrect.</p>
            <Link href="/feed" className="mt-5 inline-flex rounded-2xl bg-forum-primary px-4 py-2 text-sm font-semibold text-white">
              Back to feed
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
              Back to feed
            </Link>
            <PostDetail post={post} />
          </div>
          <aside className="hidden h-fit space-y-4 xl:sticky xl:top-24 xl:block">
            <AuthorCard post={post} />
            <RelatedPosts currentPostId={post.id} />
          </aside>
        </div>
      </div>
    </main>
  );
}



