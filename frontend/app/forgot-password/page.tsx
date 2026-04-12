'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { api } from '@/lib/axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card">
        <h1 className="mb-2 text-2xl font-bold">Forgot password</h1>
        <p className="mb-6 text-sm text-slate-600">Enter your email and we will send a reset link.</p>
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            try {
              const response = await api.post('/auth/forgot-password', { email });
              setMessage(response.data.message ?? 'If the email exists, a reset link has been sent.');
            } finally {
              setLoading(false);
            }
          }}
        >
          <Input id="forgot-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {message ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>
      </section>
    </main>
  );
}
