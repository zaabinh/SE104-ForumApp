'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearAuthSession, fetchCurrentUser, getStoredUser } from '@/lib/axios';

function resolveProtectedDestination(currentPath: string, user: { status: string; is_verified: boolean; profile_completed: boolean; email: string }) {
  if (user.status === 'deleted') {
    return '/login';
  }
  if (user.status === 'banned') {
    return `/login?status=banned&email=${encodeURIComponent(user.email)}`;
  }
  if (!user.is_verified && !currentPath.startsWith('/verify-email')) {
    return `/verify-email?email=${encodeURIComponent(user.email)}`;
  }
  if (user.is_verified && !user.profile_completed && !currentPath.startsWith('/complete-profile')) {
    return '/complete-profile';
  }
  return null;
}

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
        setIsCheckingAuth(false);
      }

      try {
        const currentUser = await fetchCurrentUser();
        if (!isMounted) {
          return;
        }
        setUserEmail(currentUser.email);
        const redirectTo = resolveProtectedDestination(window.location.pathname, currentUser);
        if (redirectTo) {
          router.replace(redirectTo);
          return;
        }
        setIsCheckingAuth(false);
      } catch {
        clearAuthSession();
        if (isMounted) {
          setIsCheckingAuth(false);
          router.replace('/login');
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
