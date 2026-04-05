'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';

const LoginForm = dynamic(() => import('@/components/auth/LoginForm'), {
  loading: () => <div className="min-h-[420px] animate-pulse rounded-[24px] bg-slate-100/80" />,
});

const RegisterForm = dynamic(() => import('@/components/auth/RegisterForm'), {
  loading: () => <div className="min-h-[420px] animate-pulse rounded-[24px] bg-slate-100/80" />,
});

export default function AuthPanel() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <div className="w-full rounded-[32px] border border-white/85 bg-white/96 p-6 shadow-[0_24px_80px_rgba(30,64,175,0.12)] sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-uit-700">Welcome</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">
            {mode === 'login' ? 'Sign in to UIT Nexus' : 'Create your account'}
          </h2>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-uit-100 bg-uit-50">
          <Image src="/images/uit.png" alt="UIT logo" width={36} height={36} className="h-9 w-9 object-contain" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 rounded-[20px] border border-uit-100 bg-uit-50/70 p-1">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`rounded-[16px] px-4 py-2.5 text-sm font-semibold transition ${mode === 'login' ? 'bg-white text-uit-700 shadow-sm' : 'text-ink-500 hover:text-uit-700'}`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`rounded-[16px] px-4 py-2.5 text-sm font-semibold transition ${mode === 'register' ? 'bg-white text-uit-700 shadow-sm' : 'text-ink-500 hover:text-uit-700'}`}
        >
          Register
        </button>
      </div>

      <div className="mt-6 min-h-[420px]">
        {mode === 'login' ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}
