'use client';

import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import FollowButton from '@/components/profile/FollowButton';
import { UserProfile } from '@/lib/types';

type ProfileHeaderProps = {
  user: UserProfile;
  isCurrentUser: boolean;
  isFollowing: boolean;
  onToggleFollow: () => void;
};

export default function ProfileHeader({ user, isCurrentUser, isFollowing, onToggleFollow }: ProfileHeaderProps) {
  return (
    <section className="card-surface p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <Avatar src={user.avatar} alt={user.name} size={80} />
          <div>
            <p className="text-2xl font-bold text-slate-900">{user.name}</p>
            <p className="text-sm font-medium text-forum-primary">{user.username}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{user.role}</p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">{user.bio}</p>
          </div>
        </div>
        {isCurrentUser ? <Button>Edit profile</Button> : <FollowButton isFollowing={isFollowing} onToggle={onToggleFollow} />}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Followers</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{user.followers.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Following</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{user.following.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Bookmarks</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{user.bookmarkedPostIds.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Likes</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{user.likedPostIds.length + user.likedCommentIds.length}</p>
        </div>
      </div>
    </section>
  );
}
