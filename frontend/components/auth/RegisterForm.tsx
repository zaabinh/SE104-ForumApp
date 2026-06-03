'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startTransition, useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { api } from '@/lib/axios';
import { useI18n } from '@/lib/i18n';

export default function RegisterForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [form, setForm] = useState({ username: '', email: '', fullName: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const googleLoginUrl = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000'}/auth/google/login`;

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
      setError(t('registerInvalidInput'));
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

      setSuccess(response.data.message ?? t('registerSuccess'));
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
          : t('registerFailed');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Input id="register-username" label={t('registerUsername')} value={form.username} onChange={(e) => updateField('username', e.target.value)} required />
      <Input id="register-email" label={t('registerEmail')} type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
      <Input id="register-full-name" label={t('registerFullName')} value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} required />
      <Input
        id="register-password"
        label={t('registerPassword')}
        type={showPassword ? 'text' : 'password'}
        value={form.password}
        onChange={(e) => updateField('password', e.target.value)}
        required
      />
      <Input
        id="register-confirm-password"
        label={t('registerConfirmPassword')}
        type={showPassword ? 'text' : 'password'}
        value={form.confirmPassword}
        onChange={(e) => updateField('confirmPassword', e.target.value)}
        required
      />
      <button type="button" className="text-xs text-forum-primary" onClick={() => setShowPassword((prev) => !prev)}>
        {showPassword ? t('registerHidePassword') : t('registerShowPassword')}
      </button>

      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}
      {success ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            {t('registerSubmitting')}
          </span>
        ) : (
          t('registerSubmit')
        )}
      </Button>

      {/* <Button type="button" variant="outline" className="w-full" onClick={() => window.location.assign(googleLoginUrl)}>
        Continue with Google
      </Button> */}

      <p className="text-sm text-slate-600">
        {t('registerAlreadyRegistered')}{' '}
        <Link className="text-forum-primary" href="/login">
          {t('registerLogin')}
        </Link>
      </p>
    </form>
  );
}
