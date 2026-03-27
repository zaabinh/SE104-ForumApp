'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { mockLogin } from '@/lib/mockAuth';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => email.includes('@') && password.length >= 6, [email, password]);

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
      const response = await mockLogin({ email, password });
      localStorage.setItem('user', JSON.stringify(response.user));
      setSuccess(`Welcome back! ${remember ? 'Your session will be remembered.' : ''}`);
      router.push('/feed');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Input id="login-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me
      </label>

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

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline">Login with Google</Button>
        <Button type="button" variant="outline">Login with GitHub</Button>
      </div>

      <p className="text-sm text-slate-600">
        Need an account?{' '}
        <Link className="text-forum-primary" href="/register">
          Register
        </Link>
      </p>
    </form>
  );
}
