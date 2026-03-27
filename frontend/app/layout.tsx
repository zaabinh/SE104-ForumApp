import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/ui/Providers';

export const metadata: Metadata = {
  title: 'Forum.dev',
  description: 'Modern developer forum frontend'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className="bg-slate-100 text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
