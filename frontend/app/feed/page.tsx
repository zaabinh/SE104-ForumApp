'use client';

import dynamic from 'next/dynamic';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import PostList from '@/components/post/PostList';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { useResponsiveSidebar } from '@/lib/useResponsiveSidebar';
import { useCallback, useState } from 'react';

const Rightbar = dynamic(() => import('@/components/layout/Rightbar'));

export default function FeedPage() {
  const { isCheckingAuth, userEmail } = useAuthGuard();
  const { isSidebarCollapsed, isMobileSidebarOpen, setIsSidebarCollapsed, setIsMobileSidebarOpen } = useResponsiveSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 350);
  const handleCloseMobileSidebar = useCallback(() => setIsMobileSidebarOpen(false), [setIsMobileSidebarOpen]);
  const handleToggleSidebarCollapse = useCallback(() => setIsSidebarCollapsed((prev) => !prev), [setIsSidebarCollapsed]);
  const handleOpenMobileSidebar = useCallback(() => setIsMobileSidebarOpen(true), [setIsMobileSidebarOpen]);

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-card">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-forum-primary" />
          Checking session...
        </div>
      </main>
    );
  }

  const sidebarOffsetClass = isSidebarCollapsed ? 'md:ml-16' : 'md:ml-60';

  return (
    <main className="min-h-screen overflow-hidden">
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
      <div className={`grid h-[calc(100dvh-5.25rem)] gap-6 px-4 py-6 transition-[margin] duration-300 ease-in-out ${sidebarOffsetClass} xl:grid-cols-[minmax(0,1fr)_320px]`}>
        <section className="scroll-panel min-w-0 overflow-y-auto pr-2">
          <PostList searchQuery={debouncedSearch} />
        </section>
        <Rightbar />
      </div>
    </main>
  );
}
