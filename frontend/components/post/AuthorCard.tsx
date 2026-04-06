'use client';

import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import FollowButton from '@/components/profile/FollowButton';
import { useForum } from '@/lib/forumStore';
import { Post } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';

type AuthorCardProps = {
  post: Post;
};

export default function AuthorCard({ post }: AuthorCardProps) {
  const router = useRouter();
  const { currentUser, getUserById, toggleFollowUser } = useForum();
  const { pushToast } = useToast();
  const author = getUserById(post.authorId);

  if (!author) {
    return null;
  }

  const isCurrentUser = author.id === currentUser.id;
  const isFollowing = currentUser.followingIds.includes(author.id);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-start gap-4">
        <Avatar src={author.avatar} alt={author.name} size={56} />
        <div className="min-w-0">
          <button type="button" onClick={() => router.push(`/profile/${author.id}`)} className="truncate text-left text-lg font-semibold text-slate-900 hover:text-forum-primary">
            {author.name}
          </button>
          <p className="text-sm text-slate-500">{author.username}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{author.role}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{author.bio}</p>
      <div className="mt-4 flex items-center justify-between rounded-2xl border border-forum-primary/10 bg-forum-primary/[0.06] px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Followers</p>
          <p className="text-lg font-semibold text-slate-900">{author.followers.toLocaleString()}</p>
        </div>
        {isCurrentUser ? (
          <button type="button" onClick={() => router.push(`/profile/${author.id}`)} className="rounded-2xl bg-forum-primary px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-forum-secondary">
            View profile
          </button>
        ) : (
          <FollowButton
            userId={author.id}
            isFollowing={isFollowing}
            onToggle={(nextFollowing) => {
              const next = toggleFollowUser(author.id);
              const resolved = typeof nextFollowing === 'boolean' ? nextFollowing : next;
              pushToast(resolved ? `Following ${author.name}` : `Unfollowed ${author.name}`);
            }}
          />
        )}
      </div>
    </section>
  );
}
