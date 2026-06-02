'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { api, fetchCurrentUser, getStoredUser, saveStoredUser } from '@/lib/axios';
import { getTags } from '@/lib/forumApi';

const MAJORS = [
  'Computer Science',
  'Software Engineering',
  'Information Systems',
  'Computer Networks',
  'Information Security',
  'Data Science',
  'Other',
];

const CAREER_GOALS_BY_MAJOR: Record<string, string[]> = {
  'Computer Science': ['Backend Engineer', 'AI Engineer', 'ML Engineer', 'Research Engineer', 'Other'],
  'Software Engineering': ['Frontend Engineer', 'Full-stack Engineer', 'Mobile Engineer', 'Backend Engineer', 'Other'],
  'Information Systems': ['Data Engineer', 'Business Analyst', 'Product Engineer', 'Other'],
  'Computer Networks': ['DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer', 'Other'],
  'Information Security': ['Security Engineer', 'SOC Analyst', 'Penetration Tester', 'Other'],
  'Data Science': ['Data Scientist', 'ML Engineer', 'Data Analyst', 'Other'],
  Other: ['Other'],
};

export default function CompleteProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-100">
          <div className="rounded-2xl bg-white px-6 py-4 text-sm text-slate-700 shadow-card">Loading profile form...</div>
        </main>
      }
    >
      <CompleteProfileContent />
    </Suspense>
  );
}

function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const promptDetails = useMemo(() => searchParams.get('prompt') === 'details', [searchParams]);

  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    avatarUrl: '',
    bio: '',
    major: '',
    academicYear: '',
    careerGoal: '',
    interestTags: [] as string[],
    customMajor: '',
    customGoal: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const majorSelection = useMemo(() => {
    if (!form.major) return '';
    return MAJORS.includes(form.major) && form.major !== 'Other' ? form.major : 'Other';
  }, [form.major]);

  const goalOptions = useMemo(() => {
    const key = majorSelection && majorSelection !== 'Other' ? majorSelection : 'Other';
    return CAREER_GOALS_BY_MAJOR[key] || ['Other'];
  }, [majorSelection]);

  const goalSelection = useMemo(() => {
    if (!form.careerGoal) return '';
    return goalOptions.includes(form.careerGoal) && form.careerGoal !== 'Other' ? form.careerGoal : 'Other';
  }, [form.careerGoal, goalOptions]);

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setForm((prev) => ({
        ...prev,
        username: user.username || prev.username,
        fullName: user.full_name || '',
        avatarUrl: user.avatar_url || '',
        bio: user.bio || '',
        major: user.major || '',
        academicYear: user.academic_year || '',
        careerGoal: user.career_goal || '',
        interestTags: user.interest_tags || [],
      }));
    }

    (async () => {
      try {
        const tags = await getTags();
        setAvailableTags((tags || []).map((t) => t.name));
      } catch {
        // non-blocking
      }
    })();
  }, []);

  const selectedTags = useMemo(() => new Set(form.interestTags), [form.interestTags]);

  const toggleTag = useCallback((tag: string) => {
    setForm((prev) => ({
      ...prev,
      interestTags: prev.interestTags.includes(tag)
        ? prev.interestTags.filter((t) => t !== tag)
        : [...prev.interestTags, tag],
    }));
  }, []);

  const onAvatarUpload = (file?: File) => {
    if (!file) return;
    const nextPreview = URL.createObjectURL(file);
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return nextPreview;
    });
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/50 to-slate-100 px-4 py-8">
      <section className="mx-auto w-full max-w-4xl rounded-3xl border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur sm:p-8">
        <div className="mb-6 border-b border-slate-100 pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {promptDetails ? 'Profile details' : 'Complete profile'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {promptDetails
              ? 'Help us personalize your feed. You can skip and update later in profile settings.'
              : 'Set up your profile before entering the forum.'}
          </p>
        </div>

        <form
          className="space-y-6"
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
                major: form.major || null,
                academic_year: form.academicYear || null,
                career_goal: form.careerGoal || null,
                interest_tags: form.interestTags,
              });
              saveStoredUser(response.data);
              const currentUser = await fetchCurrentUser();
              router.push(currentUser.is_verified ? '/feed' : `/verify-email?email=${encodeURIComponent(currentUser.email)}`);
            } catch (submitError: any) {
              setError(submitError?.response?.data?.detail || 'Unable to complete profile.');
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Avatar</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {avatarPreview || form.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview || form.avatarUrl} alt="Avatar preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No image</div>
                  )}
                </div>
                <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-300">
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onAvatarUpload(e.target.files?.[0])} />
                </label>
              </div>
              <div className="mt-3">
                <Input
                  id="complete-avatar"
                  label="Or Avatar URL"
                  value={form.avatarUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, avatarUrl: e.target.value }))}
                />
              </div>
            </aside>

            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="complete-username"
                  label="Username"
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                  required
                />
                <Input
                  id="complete-full-name"
                  label="Full name"
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Major</span>
                  <select
                    value={majorSelection}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        major: e.target.value === 'Other' ? '' : e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                  >
                    <option value="">Select major</option>
                    {MAJORS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  {majorSelection === 'Other' ? (
                    <Input
                      id="custom-major"
                      label="Custom major"
                      value={form.customMajor}
                      onChange={(e) => setForm((p) => ({ ...p, customMajor: e.target.value, major: e.target.value }))}
                    />
                  ) : null}
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Academic year</span>
                  <select
                    value={form.academicYear}
                    onChange={(e) => setForm((p) => ({ ...p, academicYear: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                  >
                    <option value="">Select year</option>
                    {[1, 2, 3, 4, 5, 6].map((y) => (
                      <option key={y} value={`Year ${y}`}>
                        Year {y}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Career goal</span>
                <select
                  value={goalSelection}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      careerGoal: e.target.value === 'Other' ? '' : e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                >
                  <option value="">Select career goal</option>
                  {goalOptions.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                {goalSelection === 'Other' ? (
                  <Input
                    id="custom-goal"
                    label="Custom career goal"
                    value={form.customGoal}
                    onChange={(e) => setForm((p) => ({ ...p, customGoal: e.target.value, careerGoal: e.target.value }))}
                  />
                ) : null}
              </label>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-sm font-semibold text-slate-800">Interest tags</p>
                <p className="mt-1 text-xs text-slate-500">Choose topics to personalize your feed.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {availableTags.map((tag) => {
                    const active = selectedTags.has(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`rounded-full border px-3 py-1 text-sm transition ${
                          active ? 'border-forum-primary bg-forum-primary/10 text-forum-primary' : 'border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Bio</span>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                  className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                  placeholder="Write a short intro..."
                />
              </label>
            </div>
          </div>

          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-5">
            {promptDetails ? (
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  const user = await fetchCurrentUser();
                  localStorage.setItem(`profile_details_skipped:${user.id || user.email}`, '1');
                  router.push('/feed');
                }}
              >
                Skip for now
              </Button>
            ) : null}
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Complete profile'}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
