'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatRelativeTime } from '@/lib/mockData';
import { useForum } from '@/lib/forumStore';

type RelatedPostsProps = {
  currentPostId: number;
};

export default function RelatedPosts({ currentPostId }: RelatedPostsProps) {
  const router = useRouter();
  const { posts, getUserById } = useForum();
  const relatedPosts = posts.filter((post) => post.id !== currentPostId).slice(0, 4);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
      <h3 className="text-lg font-semibold text-slate-900">Related posts</h3>
      <div className="mt-4 space-y-3">
        {relatedPosts.map((post) => {
          const author = getUserById(post.authorId);
          if (!author) return null;

          return (
            <button
              key={post.id}
              type="button"
              onClick={() => router.push(`/post/${post.id}`)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left transition-all duration-200 hover:border-forum-primary/60 hover:bg-forum-primary/[0.04]"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                <Image src={post.image} alt={post.title} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-semibold text-slate-900">{post.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {author.name} / {formatRelativeTime(post.createdAt)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
