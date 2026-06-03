import type { Metadata } from 'next';
import PostStorageCleanup from '@/components/app/PostStorageCleanup';
import './globals.css';
import Providers from '@/components/ui/Providers';

export const metadata: Metadata = {
  title: 'UITConnect',
  description: 'Modern AI-powered technology community platform',
  icons: {
    icon: '/images/uit.png',
    shortcut: '/images/uit.png',
    apple: '/images/uit.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className="bg-forum-bg text-ink-900">
        <Providers>
          <PostStorageCleanup />
          {children}
        </Providers>
      </body>
    </html>
  );
}
