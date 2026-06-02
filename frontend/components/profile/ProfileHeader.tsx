'use client';

import Link from 'next/link';
import { FiBookOpen, FiCalendar, FiEdit3, FiMapPin, FiTarget, FiZap } from 'react-icons/fi';
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
          Profile
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
                <span className="rounded-full bg-gradient-to-r from-uit-50 to-ai-cyan/20 px-3 py-1 text-xs font-semibold text-uit-700">
                  @{user.username}
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-600">{user.bio || 'No bio yet.'}</p>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Major</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{user.major || 'Not set'}</p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Academic year</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{user.academic_year || 'Not set'}</p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Career goal</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{user.career_goal || 'Not set'}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <FiBookOpen className="h-3.5 w-3.5" />
                  Interests
                </span>
                {user.interest_tags?.length ? (
                  user.interest_tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-uit-100 bg-white px-2.5 py-1 text-xs font-medium text-uit-700">
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Not set</span>
                )}
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