'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AvatarPicker from '@/components/ui/AvatarPicker';
import { useToast } from '@/components/ui/Toast';
import { getMyProfile, updateMyProfile } from '@/lib/profileApi';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useResponsiveSidebar } from '@/lib/useResponsiveSidebar';

export default function EditProfile() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { isCheckingAuth, userEmail } = useAuthGuard();
  const { isSidebarCollapsed, isMobileSidebarOpen, setIsSidebarCollapsed, setIsMobileSidebarOpen } = useResponsiveSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', bio: '', avatar_url: '' });

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const profile = await getMyProfile();
        if (!isMounted) {
          return;
        }

        setForm({
          full_name: profile.full_name,
          bio: profile.bio || '',
          avatar_url: profile.avatar_url || '',
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const canSubmit = useMemo(() => form.full_name.trim().length >= 2, [form.full_name]);

  if (isCheckingAuth || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-card">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-forum-primary" />
          Loading profile editor...
        </div>
      </main>
    );
  }

  const sidebarOffsetClass = isSidebarCollapsed ? 'md:ml-16' : 'md:ml-60';

  return (
    <main className="min-h-screen bg-slate-100">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />
      <Topbar
        isSidebarCollapsed={isSidebarCollapsed}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        userEmail={userEmail}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className={`px-4 py-6 transition-all duration-200 ${sidebarOffsetClass}`}>
        <div className="mx-auto max-w-3xl">
          <section className="card-surface p-6">
            <h1 className="text-3xl font-bold text-slate-900">Edit profile</h1>
            <p className="mt-2 text-sm text-slate-600">Update your public profile details.</p>

            <form
              className="mt-6 space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!canSubmit || saving) {
                  return;
                }

                setSaving(true);
                try {
                  const updated = await updateMyProfile(form);
                  pushToast('Profile updated');
                  router.push(`/profile/${updated.username}`);
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
                      : 'Unable to update profile.';
                  pushToast(message);
                } finally {
                  setSaving(false);
                }
              }}
            >
              <Input
                id="edit-profile-full-name"
                label="Full name"
                value={form.full_name}
                onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
                required
              />
              <AvatarPicker
                value={form.avatar_url}
                onChange={(url) => setForm((prev) => ({ ...prev, avatar_url: url }))}
              />
              <label className="block space-y-2" htmlFor="edit-profile-bio">
                <span className="text-sm font-medium text-slate-700">Bio</span>
                <textarea
                  id="edit-profile-bio"
                  value={form.bio}
                  onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                  rows={5}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-forum-primary"
                  placeholder="Tell other students what you are working on."
                />
              </label>

              <div className="flex gap-3">
                <Button type="submit" disabled={!canSubmit || saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}



