'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { api } from '@/lib/axios';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromQuery = searchParams.get('token') || '';
  const emailFromQuery = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailFromQuery);
  const [token, setToken] = useState(tokenFromQuery);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const canVerify = useMemo(() => token.trim().length > 0, [token]);

  useEffect(() => {
    if (!tokenFromQuery) return;
    setToken(tokenFromQuery);
  }, [tokenFromQuery]);

  const verifyNow = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.post('/auth/verify-email', { token: token.trim() });
      setMessage('Email verified successfully. Redirecting to login...');
      setTimeout(() => router.push('/login'), 1000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Unable to verify email.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!email.trim()) {
      setError('Please enter your email to resend verification.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.post('/auth/resend-verification', { email: email.trim() });
      setMessage('Verification email sent.');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Unable to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card">
        <h1 className="mb-2 text-2xl font-bold">Verify email</h1>
        <p className="mb-6 text-sm text-slate-600">Use your verification token or request a new verification email.</p>

        <div className="space-y-4">
          <Input id="verify-token" label="Verification token" value={token} onChange={(e) => setToken(e.target.value)} />
          <Button type="button" className="w-full" disabled={!canVerify || loading} onClick={verifyNow}>
            {loading ? 'Verifying...' : 'Verify email'}
          </Button>
        </div>

        <div className="my-5 border-t border-slate-200" />

        <div className="space-y-4">
          <Input id="verify-email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="button" variant="outline" className="w-full" disabled={loading} onClick={resend}>
            {loading ? 'Sending...' : 'Resend verification email'}
          </Button>
        </div>

        {message ? <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-100">
          <div className="rounded-2xl bg-white px-6 py-4 text-sm text-slate-700 shadow-card">Loading...</div>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
