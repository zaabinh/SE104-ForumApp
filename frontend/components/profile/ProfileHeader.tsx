'use client';

import Link from 'next/link';
import { FiCalendar, FiEdit3, FiMapPin, FiZap } from 'react-icons/fi';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import FollowButton from '@/components/profile/FollowButton';
import { ProfileSummary } from '@/lib/profileApi';

type ProfileHeaderProps = {
  user: ProfileSummary & { id?: string };
  isCurrentUser: boolean;
  isFollowing: boolean;
  onToggleFollow: (nextFollowing: boolean) => void;
};

const stats = [
  { key: 'posts_count', label: 'Posts' },
  { key: 'followers_count', label: 'Followers' },
  { key: 'following_count', label: 'Following' },
] as const;

export default function ProfileHeader({ user, isCurrentUser, isFollowing, onToggleFollow }: ProfileHeaderProps) {
  return (
    <section className="dashboard-card overflow-hidden">
      <div className="relative h-44 bg-[radial-gradient(circle_at_top_left,rgba(72,200,255,0.55),transparent_28%),linear-gradient(135deg,#1c44b4_0%,#376bb4_48%,#88a8ff_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_45%)]" />
        <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/90 backdrop-blur-md">
          Profile wireframe
        </div>
      </div>

      <div className="relative px-6 pb-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="-mt-12 rounded-full border-[6px] border-white/85 shadow-dashboard">
              <Avatar src={user.avatar_url} alt={user.full_name} size={104} />
            </div>
            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight text-ink-900">{user.full_name}</h1>
                <span className="rounded-full bg-gradient-to-r from-uit-50 to-ai-cyan/20 px-3 py-1 text-xs font-semibold text-uit-700">@{user.username}</span>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-600">{user.bio || 'No bio yet.'}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink-500">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5">
                  <FiCalendar className="h-4 w-4 text-uit-700" />
                  Joined community
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5">
                  <FiMapPin className="h-4 w-4 text-uit-700" />
                  UIT ecosystem
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5">
                  <FiZap className="h-4 w-4 text-uit-700" />
                  AI-ready profile
                </span>
              </div>
            </div>
          </div>

          {isCurrentUser ? (
            <Link href="/profile/edit">
              <Button className="gap-2">
                <FiEdit3 className="h-4 w-4" />
                Edit profile
              </Button>
            </Link>
          ) : user.id ? (
            <FollowButton userId={user.id} isFollowing={isFollowing} onToggle={onToggleFollow} />
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.key} className="rounded-[24px] border border-uit-100 bg-white/80 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-ink-400">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">{user[stat.key].toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

