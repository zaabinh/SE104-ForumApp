'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useResponsiveSidebar } from '@/lib/useResponsiveSidebar';

export default function SettingsPage() {
  const { isCheckingAuth, userEmail } = useAuthGuard();
  const { isSidebarCollapsed, isMobileSidebarOpen, setIsSidebarCollapsed, setIsMobileSidebarOpen } = useResponsiveSidebar();
  const [searchQuery, setSearchQuery] = useState('');

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-card">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-forum-primary" />
          Loading settings...
        </div>
      </main>
    );
  }

  const sidebarOffsetClass = isSidebarCollapsed ? 'md:ml-16' : 'md:ml-60';

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
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-card">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="mt-3 text-sm text-slate-600">
            Authenticated route is active. Use this page for password changes, profile updates, and notification preferences.
          </p>
        </div>
      </div>
    </main>
  );
}



