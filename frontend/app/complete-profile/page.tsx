'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { api, fetchCurrentUser, getStoredUser, saveStoredUser } from '@/lib/axios';

export default function CompleteProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', fullName: '', avatarUrl: '', bio: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user.full_name || '',
        avatarUrl: user.avatar_url || '',
        bio: user.bio || '',
      }));
    }
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card">
        <h1 className="mb-2 text-2xl font-bold">Complete profile</h1>
        <p className="mb-6 text-sm text-slate-600">Choose a unique username before accessing the forum.</p>
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            setError('');
            try {
              const response = await api.post('/auth/complete-profile', {
                username: form.username,
                full_name: form.fullName,
                avatar_url: form.avatarUrl || null,
                bio: form.bio || null,
              });
              saveStoredUser(response.data);
              const currentUser = await fetchCurrentUser();
              router.push(currentUser.is_verified ? '/feed' : `/verify-email?email=${encodeURIComponent(currentUser.email)}`);
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
                  : 'Unable to complete profile.';
              setError(message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <Input id="complete-username" label="Username" value={form.username} onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))} required />
          <Input id="complete-full-name" label="Full name" value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} required />
          <Input id="complete-avatar" label="Avatar URL" value={form.avatarUrl} onChange={(e) => setForm((prev) => ({ ...prev, avatarUrl: e.target.value }))} />
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Bio</span>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
              className="min-h-28 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-forum-primary"
            />
          </label>
          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Complete profile'}
          </Button>
        </form>
      </section>
    </main>
  );
}
