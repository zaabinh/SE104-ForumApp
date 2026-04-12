'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { api, fetchCurrentUser } from '@/lib/axios';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email') || '';
  const [message, setMessage] = useState('Please verify your email.');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    setLoading(true);
    api
      .post('/auth/verify-email', { token })
      .then(async (response) => {
        setMessage(response.data.message ?? 'Email verified successfully.');
        setVerified(true);
        try {
          const currentUser = await fetchCurrentUser();
          router.replace(currentUser.profile_completed ? '/feed' : '/complete-profile');
        } catch {
          // Keep verification message visible if not currently authenticated.
        }
      })
      .catch(() => {
        setMessage('Verification token is invalid or expired.');
      })
      .finally(() => setLoading(false));
  }, [router, token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card">
        <h1 className="mb-2 text-2xl font-bold">Verify email</h1>
        <p className="mb-6 text-sm text-slate-600">{message}</p>
        {!verified ? (
          <Button
            type="button"
            className="w-full"
            disabled={loading || !email}
            onClick={async () => {
              setLoading(true);
              try {
                const response = await api.post('/auth/resend-verification', { email });
                setMessage(response.data.message ?? 'Verification email sent.');
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? 'Sending...' : 'Resend verification'}
          </Button>
        ) : null}
      </section>
    </main>
  );
}
