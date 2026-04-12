'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import PostEditor from '@/components/post/PostEditor';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { fetchCurrentUser } from '@/lib/axios';
import { deletePost, getPost, updatePost } from '@/lib/forumApi';
import { EditorPostDraft } from '@/lib/types';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useResponsiveSidebar } from '@/lib/useResponsiveSidebar';

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { pushToast } = useToast();
  const { isCheckingAuth, userEmail } = useAuthGuard();
  const { isSidebarCollapsed, isMobileSidebarOpen, setIsSidebarCollapsed, setIsMobileSidebarOpen } = useResponsiveSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<EditorPostDraft | null>(null);
  const [postId, setPostId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadEditor = async () => {
      setLoading(true);
      try {
        const id = Number(params.id);
        const [postData, currentUser] = await Promise.all([getPost(id), fetchCurrentUser()]);

        if (!isMounted) {
          return;
        }

        if (postData.user_id !== currentUser.id) {
          router.replace('/feed');
          return;
        }

        setPostId(postData.id);
        setPost({
          title: postData.title,
          content: postData.content,
          tags: postData.tags,
          image: postData.cover_image || '',
        });
      } catch {
        if (isMounted) {
          router.replace('/feed');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadEditor();
    return () => {
      isMounted = false;
    };
  }, [params.id, router]);

  if (isCheckingAuth || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-card">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-forum-primary" />
          Loading editor...
        </div>
      </main>
    );
  }

  const sidebarOffsetClass = isSidebarCollapsed ? 'md:ml-16' : 'md:ml-60';

  if (!post || postId === null) {
    return null;
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
            initialValue={post}
            onSubmit={async (draft) => {
              try {
                await updatePost(postId, {
                  title: draft.title,
                  content: draft.content,
                  cover_image: draft.image,
                  tags: draft.tags,
                });
                pushToast('Post updated');
                router.push(`/post/${postId}`);
              } catch (error) {
                pushToast('Failed to update post');
              }
            }}
            onDelete={() => setIsDeleteOpen(true)}
          />
        </div>
      </div>
      <Modal
        open={isDeleteOpen}
        title="Delete this post?"
        description="This removes the post from the forum."
        confirmLabel="Delete post"
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={async () => {
          try {
            await deletePost(postId);
            pushToast('Post deleted');
            router.push('/feed');
          } catch (error) {
            pushToast('Failed to delete post');
          }
        }}
      />
    </main>
  );
}



