'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import FollowButton from '@/components/profile/FollowButton';
import { UserProfile } from '@/lib/types';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';

type AuthorCardProps = {
  author: UserProfile;
  currentUserId?: string;
};

export default function AuthorCard({ author, currentUserId }: AuthorCardProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const { t } = useI18n();
  const isCurrentUser = author.id === currentUserId;
  const profileHref = `/profile/${author.username.replace(/^@/, '')}`;
  const [isFollowing, setIsFollowing] = useState(Boolean(author.isFollowing));
  const [followersCount, setFollowersCount] = useState(author.followers);

  useEffect(() => {
    setIsFollowing(Boolean(author.isFollowing));
    setFollowersCount(author.followers);
  }, [author.followers, author.isFollowing]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-start gap-4">
        <Avatar src={author.avatar} alt={author.name} size={56} />
        <div className="min-w-0">
          <button type="button" onClick={() => router.push(profileHref)} className="truncate text-left text-lg font-semibold text-slate-900 hover:text-forum-primary">
            {author.name}
          </button>
          <p className="text-sm text-slate-500">{author.username}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{author.role}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{author.bio}</p>
      <div className="mt-4 flex items-center justify-between rounded-2xl border border-forum-primary/10 bg-forum-primary/[0.06] px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t('authorFollowers')}</p>
          <p className="text-lg font-semibold text-slate-900">{followersCount.toLocaleString()}</p>
        </div>
        {isCurrentUser ? (
          <button type="button" onClick={() => router.push(profileHref)} className="rounded-2xl bg-forum-primary px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-forum-secondary">
            {t('authorViewProfile')}
          </button>
        ) : (
          <FollowButton
            userId={author.id}
            isFollowing={isFollowing}
            onToggle={(nextFollowing) => {
              setIsFollowing(nextFollowing);
              setFollowersCount((prev) => Math.max(0, prev + (nextFollowing ? 1 : -1)));
              pushToast(nextFollowing ? `${t('authorFollowed')} ${author.name}` : `${t('authorUnfollowed')} ${author.name}`);
            }}
          />
        )}
      </div>
    </section>
  );
}
