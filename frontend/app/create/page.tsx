'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import PostEditor from '@/components/post/PostEditor';
import { useToast } from '@/components/ui/Toast';
import { useForum } from '@/lib/forumStore';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useResponsiveSidebar } from '@/lib/useResponsiveSidebar';

export default function CreatePostPage() {
  const router = useRouter();
  const { createPost } = useForum();
  const { pushToast } = useToast();
  const { isCheckingAuth, userEmail } = useAuthGuard();
  const { isSidebarCollapsed, isMobileSidebarOpen, setIsSidebarCollapsed, setIsMobileSidebarOpen } = useResponsiveSidebar();
  const [searchQuery, setSearchQuery] = useState('');

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-card">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-forum-primary" />
          Loading editor...
        </div>
      </main>
    );
  }

  const sidebarOffsetClass = isSidebarCollapsed ? 'md:ml-20' : 'md:ml-60';

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
        <div className="mx-auto max-w-[1500px] space-y-5">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Create post</h1>
            <p className="mt-2 text-sm text-slate-600">Draft a developer-focused post with image, tags, and preview.</p>
          </div>
          <PostEditor
            mode="create"
            onSubmit={(draft) => {
              const nextPost = createPost(draft);
              pushToast('Post published');
              router.push(`/post/${nextPost.id}`);
            }}
          />
        </div>
      </div>
    </main>
  );
}
