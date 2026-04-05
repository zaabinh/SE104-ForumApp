'use client';

import { memo, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import { useForum } from '@/lib/forumStore';
import { formatRelativeTime } from '@/lib/mockData';

function Rightbar() {
  const router = useRouter();
  const { currentUser, posts, tags, users, getUserById } = useForum();
  const trendingPosts = useMemo(() => [...posts].sort((left, right) => right.trendingScore - left.trendingScore).slice(0, 3), [posts]);
  const suggestedUsers = useMemo(
    () => users.filter((user) => user.id !== currentUser.id && !currentUser.followingIds.includes(user.id)).slice(0, 3),
    [currentUser.followingIds, currentUser.id, users]
  );
  const aiSuggestedPosts = useMemo(
    () => [...posts].sort((left, right) => right.likes + right.comments - (left.likes + left.comments)).slice(3, 6),
    [posts]
  );

  return (
    <aside className="scroll-panel hidden h-full min-h-0 space-y-4 overflow-y-auto pr-2 xl:block">
      <section className="card-surface soft-grid p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Trending</p>
            <h3 className="section-title mt-2">Topics gaining momentum</h3>
          </div>
          <div className="rounded-full bg-uit-100 px-3 py-1 text-xs font-semibold text-uit-700">Live</div>
        </div>
        <div className="mt-4 space-y-3 text-sm">
          {trendingPosts.map((post) => {
            const author = getUserById(post.authorId);
            if (!author) return null;

            return (
              <button
                key={post.id}
                type="button"
                onClick={() => router.push(`/post/${post.id}`)}
                className="block w-full rounded-[22px] border border-white/70 bg-white/80 px-4 py-4 text-left transition-all duration-200 hover:border-uit-200 hover:bg-uit-50/70"
              >
                <p className="font-semibold text-ink-900">{post.title}</p>
                <p className="mt-1 text-xs text-ink-500">
                  {author.name} · {formatRelativeTime(post.createdAt)}
                </p>
                <p className="mt-2 text-xs font-medium text-uit-700">{post.comments} comments · {post.likes} reactions</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="card-surface p-5">
        <p className="eyebrow">Community</p>
        <h3 className="section-title mt-2">Suggested people</h3>
        <div className="mt-4 space-y-3">
          {suggestedUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => router.push(`/profile/${user.username.replace('@', '')}`)}
              className="flex w-full items-center gap-3 rounded-[22px] border border-white/70 bg-white/80 p-3 text-left transition-all duration-200 hover:border-uit-200 hover:bg-uit-50/60"
            >
              <Avatar src={user.avatar} alt={user.name} size={44} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink-900">{user.name}</p>
                <p className="truncate text-xs text-ink-500">{user.role}</p>
              </div>
              <span className="rounded-full bg-uit-50 px-3 py-1 text-xs font-semibold text-uit-700">Follow</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card-surface p-5">
        <p className="eyebrow">AI Suggestions</p>
        <h3 className="section-title mt-2">Recommended reading</h3>
        <div className="mt-4 space-y-3">
          {aiSuggestedPosts.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => router.push(`/post/${post.id}`)}
              className="block w-full rounded-[22px] bg-gradient-to-r from-uit-50 via-white to-ai-cyan/10 px-4 py-4 text-left transition-all duration-200 hover:shadow-card"
            >
              <p className="font-semibold text-ink-900">{post.title}</p>
              <p className="mt-2 text-xs text-ink-500">Matched to #{post.tags[0]} and your recent saves</p>
            </button>
          ))}
        </div>
      </section>

      <section className="card-surface p-5">
        <p className="eyebrow">Signals</p>
        <h3 className="section-title mt-2">Popular tags</h3>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {tags.slice(0, 8).map((tag) => (
            <span key={tag} className="rounded-full border border-uit-100 bg-uit-50/80 px-3 py-1.5 font-medium text-ink-700">
              #{tag}
            </span>
          ))}
        </div>
      </section>
    </aside>
  );
}

export default memo(Rightbar);

