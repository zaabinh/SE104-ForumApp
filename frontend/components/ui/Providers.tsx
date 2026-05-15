'use client';

import { ForumProvider } from '@/lib/forumStore';
import { LanguageProvider } from '@/lib/i18n';
import { ToastProvider } from '@/components/ui/Toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ForumProvider>
        <ToastProvider>{children}</ToastProvider>
      </ForumProvider>
    </LanguageProvider>
  );
}
