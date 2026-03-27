'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuthGuard() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');

    if (!savedUser) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser) as { email?: string };
      setUserEmail(parsedUser.email ?? '');
      setIsCheckingAuth(false);
    } catch {
      localStorage.removeItem('user');
      router.push('/login');
    }
  }, [router]);

  return { isCheckingAuth, userEmail };
}
