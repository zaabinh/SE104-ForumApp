'use client';

import LoginForm from '@/components/auth/LoginForm';
import { useI18n } from '@/lib/i18n';

export default function LoginPage() {
  const { t } = useI18n();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card">
        <h1 className="mb-2 text-2xl font-bold">{t('loginTitle')}</h1>
        <p className="mb-6 text-sm text-slate-600">{t('loginSubtitle')}</p>
        <LoginForm />
      </section>
    </main>
  );
}
