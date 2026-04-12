'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchCurrentUser, saveAuthSession } from '@/lib/axios';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const next = searchParams.get('next') || '/feed';
    const email = searchParams.get('email');

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

    fetchCurrentUser()
      .then(() => {
        if (next.startsWith('/verify-email') && email) {
          router.replace(`/verify-email?email=${encodeURIComponent(email)}`);
          return;
        }
        router.replace(next);
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-card">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-forum-primary" />
        Completing sign in...
      </div>
    </main>
  );
}
