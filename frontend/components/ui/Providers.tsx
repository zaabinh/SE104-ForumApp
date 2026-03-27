'use client';

import { ForumProvider } from '@/lib/forumStore';
import { ToastProvider } from '@/components/ui/Toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ForumProvider>
      <ToastProvider>{children}</ToastProvider>
    </ForumProvider>
  );
}
