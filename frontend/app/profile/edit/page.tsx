'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { getMyProfile, updateMyProfile } from '@/lib/profileApi';
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

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    avatar_url: '',
    major: '',
    academic_year: '',
    career_goal: '',
    interest_tags: [] as string[],
    custom_major: '',
    custom_goal: '',
  });

  const majorSelection = useMemo(() => {
    if (!form.major) return '';
    return MAJORS.includes(form.major) && form.major !== 'Other' ? form.major : 'Other';
  }, [form.major]);

  const goalOptions = useMemo(() => {
    const key = majorSelection && majorSelection !== 'Other' ? majorSelection : 'Other';
    return CAREER_GOALS_BY_MAJOR[key] || ['Other'];
  }, [majorSelection]);

  const goalSelection = useMemo(() => {
    if (!form.career_goal) return '';
    return goalOptions.includes(form.career_goal) && form.career_goal !== 'Other' ? form.career_goal : 'Other';
  }, [form.career_goal, goalOptions]);

  useEffect(() => {
    (async () => {
      try {
        const [profile, tags] = await Promise.all([getMyProfile(), getTags()]);
        setAvailableTags((tags || []).map((t) => t.name));
        setForm({
          full_name: profile.full_name || '',
          bio: profile.bio || '',
          avatar_url: profile.avatar_url || '',
          major: profile.major || '',
          academic_year: profile.academic_year || '',
          career_goal: profile.career_goal || '',
          interest_tags: profile.interest_tags || [],
          custom_major: '',
          custom_goal: '',
        });
      } catch {
        setError('Unable to load profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedTags = useMemo(() => new Set(form.interest_tags), [form.interest_tags]);

  const toggleTag = useCallback((tag: string) => {
    setForm((prev) => ({
      ...prev,
      interest_tags: prev.interest_tags.includes(tag)
        ? prev.interest_tags.filter((t) => t !== tag)
        : [...prev.interest_tags, tag],
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

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-100">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/50 to-slate-100 px-4 py-8">
      <section className="mx-auto w-full max-w-4xl rounded-3xl border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur sm:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Edit Profile</h1>
            <p className="mt-1 text-sm text-slate-500">Update your personal info and recommendation preferences.</p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:border-slate-300"
          >
            Back
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Avatar</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {avatarPreview || form.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview || form.avatar_url} alt="Avatar preview" className="h-full w-full object-cover" />
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
                id="avatar-url"
                label="Or Avatar URL"
                value={form.avatar_url}
                onChange={(e) => setForm((p) => ({ ...p, avatar_url: e.target.value }))}
              />
            </div>
          </aside>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input id="full-name" label="Full name" value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} />
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Academic year</span>
                <select
                  value={form.academic_year}
                  onChange={(e) => setForm((p) => ({ ...p, academic_year: e.target.value }))}
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
                    value={form.custom_major}
                    onChange={(e) => setForm((p) => ({ ...p, custom_major: e.target.value, major: e.target.value }))}
                  />
                ) : null}
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Career goal</span>
                <select
                  value={goalSelection}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      career_goal: e.target.value === 'Other' ? '' : e.target.value,
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
                    value={form.custom_goal}
                    onChange={(e) => setForm((p) => ({ ...p, custom_goal: e.target.value, career_goal: e.target.value }))}
                  />
                ) : null}
              </label>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-sm font-semibold text-slate-800">Interest tags</p>
              <p className="mt-1 text-xs text-slate-500">Choose topics to improve feed recommendations.</p>
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
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                placeholder="Write a short intro..."
              />
            </label>
          </div>
        </div>

        {error ? <p className="mt-5 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}

        <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-5">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              setError('');
              try {
                const updatedProfile = await updateMyProfile({
                  full_name: form.full_name,
                  bio: form.bio,
                  avatar_url: form.avatar_url,
                  major: form.major,
                  academic_year: form.academic_year,
                  career_goal: form.career_goal,
                  interest_tags: form.interest_tags,
                });
                const username = updatedProfile?.username?.trim();
                router.push(username ? `/profile/${username}` : '/profile/current-user');
              } catch {
                setError('Unable to save profile.');
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </section>
    </main>
  );
}
