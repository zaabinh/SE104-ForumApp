'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { api, fetchCurrentUser, saveAuthSession, saveStoredUser } from '@/lib/axios';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bannedMessage = useMemo(
    () => (searchParams.get('status') === 'banned' ? 'Your account has been banned.' : ''),
    [searchParams]
  );

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const tokenResponse = await api.post('/auth/login', {
        identifier: identifier.trim(),
        password,
      });
      saveAuthSession(tokenResponse.data);
      const currentUser = await fetchCurrentUser();
      saveStoredUser(currentUser);
      const skipKey = `profile_details_skipped:${currentUser.id || currentUser.email}`;
      const hasExtendedProfile = Boolean(
        (currentUser.major && currentUser.major.trim()) ||
          (currentUser.academic_year && currentUser.academic_year.trim()) ||
          (currentUser.career_goal && currentUser.career_goal.trim())
      );
      if (!currentUser.profile_completed) {
        router.replace('/complete-profile');
        return;
      }
      if (!hasExtendedProfile && typeof window !== 'undefined' && localStorage.getItem(skipKey) !== '1') {
        router.replace('/complete-profile?prompt=details');
        return;
      }
      router.replace('/feed');
    } catch (submitError: any) {
      setError(submitError?.response?.data?.detail || 'Unable to login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <h1 className="text-2xl font-bold text-slate-900">Đăng nhập</h1>
      <Input
        id="login-identifier"
        label="Email hoặc tên đăng nhập"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        required
      />
      <Input
        id="login-password"
        label="Mật khẩu"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="text-sm font-medium text-forum-primary"
      >
        {showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      </button>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>
      {bannedMessage ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{bannedMessage}</p> : null}
      {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}
      <p className="text-sm text-slate-600">
        Quên mật khẩu?{' '}
        <Link href="/forgot-password" className="font-semibold text-forum-primary">
          Đặt lại
        </Link>
      </p>
      <p className="text-sm text-slate-600">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-semibold text-forum-primary">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
