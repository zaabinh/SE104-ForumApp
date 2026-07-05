'use client';

import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import PostList from '@/components/post/PostList';
import { useI18n } from '@/lib/i18n';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { useResponsiveSidebar } from '@/lib/useResponsiveSidebar';
import { Suspense, useCallback, useState } from 'react';

export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-100">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-card">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-forum-primary" />
            Loading feed...
          </div>
        </main>
      }
    >
      <FeedPageContent />
    </Suspense>
  );
}

function FeedPageContent() {
  const { isCheckingAuth, userEmail } = useAuthGuard();
  const { t } = useI18n();
  const searchParams = useSearchParams();
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
          {t('feedCheckingSession')}
        </div>
      </main>
    );
  }

  const sidebarOffsetClass = isSidebarCollapsed ? 'md:ml-16' : 'md:ml-60';
  const tab = searchParams.get('tab');
  const initialFeedMode = tab === 'following' || tab === 'trending' ? tab : 'for-you';

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
      <div className={`h-[calc(100dvh-5.25rem)] min-h-0 px-4 pt-6 pb-0 transition-[margin] duration-300 ease-in-out ${sidebarOffsetClass}`}>
        <section className="scroll-panel h-full w-full min-w-0 overflow-y-auto">
          <PostList searchQuery={debouncedSearch} initialFeedMode={initialFeedMode} />
        </section>
      </div>
    </main>
  );
}
