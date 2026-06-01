'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { getPost, sharePostWithEdit } from '@/lib/forumApi';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useResponsiveSidebar } from '@/lib/useResponsiveSidebar';

export default function SharePostPage() {
  const params = useParams<{ id: string }>();
  const postId = Number(params.id);
  const router = useRouter();
  const { pushToast } = useToast();
  const { isCheckingAuth, userEmail } = useAuthGuard();
  const { isSidebarCollapsed, isMobileSidebarOpen, setIsSidebarCollapsed, setIsMobileSidebarOpen } = useResponsiveSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState('');
  const [original, setOriginal] = useState<{ title: string; content: string; author: string } | null>(null);

  useEffect(() => {
    if (!Number.isFinite(postId)) return;
    let mounted = true;
    (async () => {
      try {
        const post = await getPost(postId);
        if (!mounted) return;
        setOriginal({
          title: post.title,
          content: post.content,
          author: post.author.username || post.author.id,
        });
      } catch {
        pushToast('Cannot load post to share');
        router.replace('/feed');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [postId, pushToast, router]);

  if (isCheckingAuth || loading) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-100">Loading...</main>;
  }
  if (!original) return null;

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
        <div className="mx-auto max-w-3xl space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">Share post</h1>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Say something about this post</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-forum-primary"
              placeholder="Write your caption..."
            />
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Original post (read-only)</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">{original.title}</h2>
            <p className="mt-1 text-sm text-slate-500">From @{original.author}</p>
            <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{original.content}</p>
          </section>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={async () => {
                try {
                  const result = await sharePostWithEdit(postId, { caption });
                  pushToast('Shared successfully');
                  router.push(result.message || '/feed');
                } catch {
                  pushToast('Failed to share post');
                }
              }}
            >
              Share now
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
