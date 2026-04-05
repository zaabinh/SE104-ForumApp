'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearAuthSession, fetchCurrentUser, getStoredUser } from '@/lib/axios';

export function useAuthGuard() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const savedUser = getStoredUser();

      if (savedUser?.email && isMounted) {
        setUserEmail(savedUser.email);
      }

      try {
        const currentUser = await fetchCurrentUser();
        if (!isMounted) {
          return;
        }
        setUserEmail(currentUser.email);
        setIsCheckingAuth(false);
      } catch {
        clearAuthSession();
        if (isMounted) {
          router.push('/login');
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return { isCheckingAuth, userEmail };
}
