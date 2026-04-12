'use client';

import { useEffect } from 'react';

export default function PostStorageCleanup() {
  useEffect(() => {
    localStorage.removeItem('currentPost');
    localStorage.removeItem('post');
  }, []);

  return null;
}
