'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getMyProfile } from '@/lib/profileApi';

export default function CurrentUserProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyProfile();
        setProfile(data);
      } catch {
        setError('Unable to load profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <main className="flex min-h-screen items-center justify-center">Loading...</main>;
  if (error) return <main className="p-6 text-red-600">{error}</main>;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h1 className="text-2xl font-bold">{profile.full_name}</h1>
        <p className="mt-1 text-slate-600">@{profile.username}</p>
        <p className="mt-4 text-slate-700">{profile.bio || 'No bio yet.'}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Major</p>
            <p className="mt-1 font-semibold text-slate-900">{profile.major || 'Not set'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Academic year</p>
            <p className="mt-1 font-semibold text-slate-900">{profile.academic_year || 'Not set'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Career goal</p>
            <p className="mt-1 font-semibold text-slate-900">{profile.career_goal || 'Not set'}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Interest tags</p>
          <p className="mt-1 text-slate-800">
            {profile.interest_tags?.length ? profile.interest_tags.join(', ') : 'Not set'}
          </p>
        </div>
        <Link href="/profile/edit" className="mt-6 inline-flex rounded-xl bg-forum-primary px-4 py-2 text-sm font-semibold text-white">
          Edit profile
        </Link>
      </div>
    </main>
  );
}
