'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { saveAuthSession, saveStoredUser } from '@/lib/axios';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const nextPath = searchParams.get('next') || '/feed';
    const email = searchParams.get('email') || '';
    const verified = searchParams.get('verified') === 'true';
    const profileCompleted = searchParams.get('profile_completed') === 'true';

    if (!accessToken || !refreshToken) {
      router.replace('/login');
      return;
    }

    saveAuthSession({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'bearer',
      expires_in: 3600,
    });

    // Store minimal state immediately. App can refresh full user profile via /auth/me later.
    saveStoredUser({
      id: '',
      username: null,
      email,
      full_name: email || 'User',
      avatar_url: null,
      bio: null,
      major: null,
      academic_year: null,
      career_goal: null,
      interest_tags: [],
      role: 'Student',
      status: 'active',
      provider: 'google',
      is_verified: verified,
      profile_completed: profileCompleted,
    });

    router.replace(nextPath);
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="rounded-2xl bg-white px-6 py-4 text-sm text-slate-700 shadow-card">
        Completing sign-in...
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-100">
          <div className="rounded-2xl bg-white px-6 py-4 text-sm text-slate-700 shadow-card">Loading...</div>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
