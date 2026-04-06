import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Hero() {
  return (
    <section className="grid items-center gap-10 rounded-3xl bg-slate-50 p-8 md:grid-cols-2 md:p-12">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[28px] border border-slate-200 bg-white p-3 shadow-md">
            <Image src="/images/uit.png" alt="UIT logo" width={56} height={56} className="h-14 w-14 object-contain" />
          </div>
          <div>
            <p className="text-base font-semibold uppercase tracking-[0.3em] text-forum-primary">Forum.dev</p>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">UIT Community</p>
          </div>
        </div>
        <h1 className="text-4xl font-extrabold leading-tight md:text-5xl bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text">
          AI-Powered Student Forum for Modern Universities
        </h1>
        <p className="text-slate-600">Connect with peers, discover intelligent insights, and accelerate your learning with our cutting-edge AI platform designed specifically for university students.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
        </div>
      </div>
      <div className="card-surface bg-gradient-to-br from-forum-primary/15 to-forum-accent/20 p-6">
        <div className="space-y-4">
          <div className="h-6 w-2/3 rounded bg-forum-primary/30" />
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-5/6 rounded bg-slate-200" />
          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="h-16 rounded-xl bg-white/80" />
            <div className="h-16 rounded-xl bg-white/80" />
            <div className="h-16 rounded-xl bg-white/80" />
          </div>
        </div>
      </div>
    </section>
  );
}
