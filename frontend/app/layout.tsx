import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import Providers from '@/components/ui/Providers';

const inter = Inter({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

const robotoMono = Roboto_Mono({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  variable: '--font-mono',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'UIT Nexus',
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
    <html lang="en" className={`light ${inter.variable} ${robotoMono.variable}`} suppressHydrationWarning>
      <body className="bg-forum-bg text-ink-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
