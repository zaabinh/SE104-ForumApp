'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startTransition, useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { api, fetchCurrentUser, saveAuthSession } from '@/lib/axios';

export default function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => password.length >= 6, [identifier, password]);

  useEffect(() => {
    router.prefetch('/feed');
  }, [router]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!canSubmit) {
      setError('Please provide a valid email and at least 6 characters password.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', { identifier, password });
      saveAuthSession(response.data);
      await fetchCurrentUser();
      setSuccess('Welcome back. Redirecting to your feed...');
      startTransition(() => router.push('/feed'));
    } catch (submitError) {
      const message =
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
          : 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Input id="login-identifier" label="Email or Username" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
      <div className="space-y-2">
        <Input
          id="login-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="button" className="text-xs text-forum-primary" onClick={() => setShowPassword((prev) => !prev)}>
          {showPassword ? 'Hide password' : 'Show password'}
        </button>
      </div>

      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}
      {success ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Logging in...
          </span>
        ) : (
          'Login'
        )}
      </Button>

      <p className="text-sm text-slate-600">
        Need an account?{' '}
        <Link className="text-forum-primary" href="/register">
          Register
        </Link>
      </p>
    </form>
  );
}
