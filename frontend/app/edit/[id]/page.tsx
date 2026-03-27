'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import PostEditor from '@/components/post/PostEditor';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useForum } from '@/lib/forumStore';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useResponsiveSidebar } from '@/lib/useResponsiveSidebar';

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { currentUser, deletePost, getPostById, updatePost } = useForum();
  const { pushToast } = useToast();
  const { isCheckingAuth, userEmail } = useAuthGuard();
  const { isSidebarCollapsed, isMobileSidebarOpen, setIsSidebarCollapsed, setIsMobileSidebarOpen } = useResponsiveSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const post = getPostById(Number(params.id));

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

  if (!post || post.authorId !== currentUser.id) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="card-surface max-w-xl p-6">
          <h1 className="text-2xl font-bold text-slate-900">You can only edit your own posts</h1>
          <p className="mt-2 text-sm text-slate-600">This editor is restricted to posts created by the current mock user.</p>
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
        <div className="mx-auto max-w-[1500px] space-y-5">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Edit post</h1>
            <p className="mt-2 text-sm text-slate-600">Update your content, tags, and cover image.</p>
          </div>
          <PostEditor
            mode="edit"
            initialValue={{ title: post.title, content: post.content, tags: post.tags, image: post.image }}
            onSubmit={(draft) => {
              updatePost(post.id, draft);
              pushToast('Post updated');
              router.push(`/post/${post.id}`);
            }}
            onDelete={() => setIsDeleteOpen(true)}
          />
        </div>
      </div>
      <Modal
        open={isDeleteOpen}
        title="Delete this post?"
        description="This removes the post and all of its comments from the mock forum data."
        confirmLabel="Delete post"
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          deletePost(post.id);
          pushToast('Post deleted');
          router.push('/feed');
        }}
      />
    </main>
  );
}
