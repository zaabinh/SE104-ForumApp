'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { api } from '@/lib/axios';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card">
        <h1 className="mb-2 text-2xl font-bold">Reset password</h1>
        <p className="mb-6 text-sm text-slate-600">Set a new password for your account.</p>
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setError('');
            if (!token || password.length < 6 || password !== confirmPassword) {
              setError('Please provide a valid token and matching passwords.');
              return;
            }
            setLoading(true);
            try {
              const response = await api.post('/auth/reset-password', { token, password });
              setMessage(response.data.message ?? 'Password reset successfully.');
              setTimeout(() => router.push('/login'), 800);
            } catch (submitError) {
              const detail =
                typeof submitError === 'object' &&
                submitError !== null &&
                'response' in submitError &&
                typeof submitError.response === 'object' &&
                submitError.response !== null &&
                'data' in submitError.response &&
                typeof submitError.response.data === 'object' &&
                submitError.response.data !== null &&
                'detail' in submitError.response.data
                  ? String(submitError.response.data.detail)
                  : 'Unable to reset password.';
              setError(detail);
            } finally {
              setLoading(false);
            }
          }}
        >
          <Input id="reset-password" label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Input id="reset-confirm-password" label="Confirm password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}
          {message ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Updating...' : 'Reset password'}
          </Button>
        </form>
      </section>
    </main>
  );
}
