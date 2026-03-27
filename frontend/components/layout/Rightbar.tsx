'use client';

import { useRouter } from 'next/navigation';
import { useForum } from '@/lib/forumStore';
import { formatRelativeTime } from '@/lib/mockData';

export default function Rightbar() {
  const router = useRouter();
  const { posts, tags, getUserById } = useForum();
  const trendingPosts = [...posts].sort((left, right) => right.trendingScore - left.trendingScore).slice(0, 3);

  return (
    <aside className="sticky top-20 hidden h-fit space-y-4 xl:block">
      <section className="card-surface p-4">
        <h3 className="font-semibold text-slate-900">Trending posts</h3>
        <div className="mt-3 space-y-3 text-sm">
          {trendingPosts.map((post) => {
            const author = getUserById(post.authorId);
            if (!author) return null;

            return (
              <button key={post.id} type="button" onClick={() => router.push(`/post/${post.id}`)} className="block w-full rounded-2xl bg-slate-50 px-3 py-3 text-left transition-all duration-200 hover:bg-forum-primary/[0.06]">
                <p className="font-semibold text-slate-900">{post.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {author.name} / {formatRelativeTime(post.createdAt)}
                </p>
              </button>
            );
          })}
        </div>
      </section>
      <section className="card-surface p-4">
        <h3 className="font-semibold text-slate-900">Popular tags</h3>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {tags.slice(0, 8).map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              #{tag}
            </span>
          ))}
        </div>
      </section>
    </aside>
  );
}
