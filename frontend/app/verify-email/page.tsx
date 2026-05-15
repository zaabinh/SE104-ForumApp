'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { api, fetchCurrentUser } from '@/lib/axios';
import { useI18n } from '@/lib/i18n';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email') || '';
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage(t('verifyEmailDefault'));
      return;
    }

    setLoading(true);
    setMessage(t('verifyEmailDefault'));
    api
      .post('/auth/verify-email', { token })
      .then(async (response) => {
        setMessage(response.data.message ?? t('verifyEmailSuccess'));
        setVerified(true);
        try {
          await fetchCurrentUser();
        } catch {
          // No-op: verification link may be opened without an active session.
        }
        router.replace('/login');
      })
      .catch(() => {
        setMessage(t('verifyEmailInvalid'));
      })
      .finally(() => setLoading(false));
  }, [router, t, token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card">
        <h1 className="mb-2 text-2xl font-bold">{t('verifyEmailTitle')}</h1>
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
                setMessage(response.data.message ?? t('verifyEmailSent'));
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? t('verifyEmailSending') : t('verifyEmailResend')}
          </Button>
        ) : null}
      </section>
    </main>
  );
}
