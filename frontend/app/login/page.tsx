'use client';

import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

function LoginPageContent() {
  return <LoginForm />;
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
