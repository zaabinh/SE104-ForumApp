'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startTransition, useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { api } from '@/lib/axios';

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', fullName: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canSubmit = useMemo(
    () =>
      form.username.length > 2 &&
      form.email.includes('@') &&
      form.fullName.trim().length > 1 &&
      form.password.length >= 6 &&
      form.password === form.confirmPassword,
    [form]
  );

  useEffect(() => {
    router.prefetch('/login');
  }, [router]);

  const updateField = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!canSubmit) {
      setError('Please fill all fields correctly and ensure passwords match.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        username: form.username,
        email: form.email,
        full_name: form.fullName,
        password: form.password,
      });

      setSuccess(response.data.message ?? 'Registration completed. Redirecting to login...');
      setTimeout(() => {
        startTransition(() => router.push('/login'));
      }, 800);
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
          : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Input id="register-username" label="Username" value={form.username} onChange={(e) => updateField('username', e.target.value)} required />
      <Input id="register-email" label="Email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
      <Input id="register-full-name" label="Full name" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} required />
      <Input
        id="register-password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={form.password}
        onChange={(e) => updateField('password', e.target.value)}
        required
      />
      <Input
        id="register-confirm-password"
        label="Confirm Password"
        type={showPassword ? 'text' : 'password'}
        value={form.confirmPassword}
        onChange={(e) => updateField('confirmPassword', e.target.value)}
        required
      />
      <button type="button" className="text-xs text-forum-primary" onClick={() => setShowPassword((prev) => !prev)}>
        {showPassword ? 'Hide password' : 'Show password'}
      </button>

      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}
      {success ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Registering...
          </span>
        ) : (
          'Register'
        )}
      </Button>

      <p className="text-sm text-slate-600">
        Already registered?{' '}
        <Link className="text-forum-primary" href="/login">
          Login
        </Link>
      </p>
    </form>
  );
}
