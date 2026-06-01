'use client';

import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

function LoginPageContent() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-card backdrop-blur">
        <LoginForm />
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-100">
          <div className="rounded-2xl bg-white px-6 py-4 text-sm text-slate-700 shadow-card">Loading...</div>
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
