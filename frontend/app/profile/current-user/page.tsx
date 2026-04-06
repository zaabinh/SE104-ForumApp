'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/axios';
import { getMyProfile } from '@/lib/profileApi';

export default function CurrentUserProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const redirectToProfile = async () => {
      const storedUser = getStoredUser();
      if (storedUser?.username) {
        router.replace(`/profile/${storedUser.username}`);
        return;
      }

      try {
        const profile = await getMyProfile();
        router.replace(`/profile/${profile.username}`);
      } catch {
        router.replace('/login');
      }
    };

    redirectToProfile();
  }, [router]);

  return null;
}
