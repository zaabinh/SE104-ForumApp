'use client';

import Rightbar from '@/components/layout/Rightbar';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import PostList from '@/components/post/PostList';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { useResponsiveSidebar } from '@/lib/useResponsiveSidebar';
import { useState } from 'react';

export default function FeedPage() {
  const { isCheckingAuth, userEmail } = useAuthGuard();
  const { isSidebarCollapsed, isMobileSidebarOpen, setIsSidebarCollapsed, setIsMobileSidebarOpen } = useResponsiveSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 350);

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

  const sidebarOffsetClass = isSidebarCollapsed ? 'md:ml-20' : 'md:ml-60';

  return (
    <main>
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
      <div className={`mx-auto grid max-w-[1600px] gap-6 px-4 py-6 transition-all duration-200 ${sidebarOffsetClass} xl:grid-cols-[minmax(0,1fr)_300px]`}>
        <section>
          <PostList searchQuery={debouncedSearch} />
        </section>
        <Rightbar />
      </div>
    </main>
  );
}
