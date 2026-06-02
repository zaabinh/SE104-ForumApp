'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { formatRelativeTime } from '@/lib/mockData';
import { Post, UserProfile } from '@/lib/types';

type RelatedPostsProps = {
  posts: Array<{
    post: Post;
    author: UserProfile;
    similarity_score?: number;
    similarity_reason?: string;
  }>;
};

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  const router = useRouter();
  const { t } = useI18n();

  // Nếu không có bài viết, hiển thị thông báo
  if (!posts || posts.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
        <h3 className="text-lg font-semibold text-slate-900">{t('postRelatedTitle')}</h3>
        <div className="mt-4 text-center text-sm text-slate-500">
          Không có bài viết tương tự
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{t('postRelatedTitle')}</h3>
        {posts[0]?.similarity_score !== undefined && (
          <span className="text-xs font-medium text-forum-primary">Đề xuất</span>
        )}
      </div>
      <div className="mt-4 space-y-3">
        {posts.map(({ post, author, similarity_score, similarity_reason }) => (
          <button
            key={post.id}
            type="button"
            onClick={() => router.push(`/post/${post.id}`)}
            className="group flex w-full cursor-pointer flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-left transition-all duration-200 hover:border-forum-primary/60 hover:bg-forum-primary/[0.04]"
          >
            {/* Similarity badge và reason */}
            {similarity_score !== undefined && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-forum-primary">
                  {similarity_reason || 'Bài viết tương tự'}
                </span>
                <span className="inline-flex items-center rounded-full bg-forum-primary/10 px-2 py-1 text-xs font-semibold text-forum-primary">
                  {Math.round(similarity_score * 100)}% tương đồng
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              {post.image ? (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                  <Image src={post.image} alt={post.title} fill className="object-cover" />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold text-slate-900">{post.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {author.name} / {formatRelativeTime(post.createdAt)}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

