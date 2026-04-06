import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import AuthPanel from '@/components/landing/AuthPanel';

const highlights = [
  'Join focused student technology communities at UIT.',
  'Share projects, ask questions, and discover practical learning resources.',
  'Move from campus discussion to real collaboration in one workspace.',
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(72,200,255,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(55,107,180,0.16),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef5ff_48%,#eaf2ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100dvh-3rem)] max-w-[1500px] overflow-hidden rounded-[36px] border border-white/65 bg-white/82 shadow-[0_24px_80px_rgba(55,107,180,0.12)] lg:grid-cols-[minmax(0,1.2fr)_460px]">
        <section className="relative flex flex-col justify-between overflow-hidden px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-uit-200/45 blur-3xl" />
            <div className="absolute bottom-[-8rem] right-[-4rem] h-80 w-80 rounded-full bg-ai-cyan/15 blur-3xl" />
            <div className="absolute inset-y-0 right-12 w-px bg-gradient-to-b from-transparent via-white/80 to-transparent lg:block" />
          </div>

          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/80 bg-white/90 shadow-card">
                <Image src="/images/uit.png" alt="UIT logo" width={52} height={52} className="h-12 w-12 object-contain" priority />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-ink-900">UIT Nexus</p>
                <p className="text-sm text-ink-500">Student collaboration workspace</p>
              </div>
            </div>

            <div className="mt-10 inline-flex rounded-full border border-uit-200 bg-white/70 px-4 py-2 text-sm font-semibold text-uit-700 shadow-sm">
              Built for smarter discussion, cleaner collaboration, and campus momentum
            </div>

            <div className="mt-8 max-w-3xl">
              <h1 className="font-sans text-5xl font-semibold leading-[0.95] tracking-tight text-ink-900 sm:text-6xl lg:text-7xl">
                Connect your ideas,
                <span className="mt-3 block bg-gradient-to-r from-uit-700 via-uit-500 to-ai-cyan bg-clip-text text-transparent">
                  then ship them with your community.
                </span>
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-ink-600 sm:text-xl">
                A focused student forum for UIT where projects, study groups, technical notes, and community updates live in one calm workspace.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:max-w-2xl">
              {highlights.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[24px] border border-white/75 bg-white/72 px-4 py-4 shadow-sm">
                  <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-uit-700" />
                  <p className="text-sm leading-6 text-ink-700 sm:text-base">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid grid-cols-3 gap-3 sm:max-w-md">
              <div className="rounded-[24px] border border-white/75 bg-white/72 px-4 py-4">
                <p className="text-2xl font-semibold text-ink-900">10K+</p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-ink-500">Students</p>
              </div>
              <div className="rounded-[24px] border border-white/75 bg-white/72 px-4 py-4">
                <p className="text-2xl font-semibold text-ink-900">50K+</p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-ink-500">Posts</p>
              </div>
              <div className="rounded-[24px] border border-white/75 bg-white/72 px-4 py-4">
                <p className="text-2xl font-semibold text-ink-900">24/7</p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-ink-500">Access</p>
              </div>
            </div>

            <Link href="/feed" className="inline-flex items-center gap-2 text-sm font-semibold text-uit-700 transition hover:text-uit-800">
              Explore the community preview
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <aside className="flex items-center border-t border-white/70 bg-[linear-gradient(180deg,rgba(247,251,255,0.82)_0%,rgba(255,255,255,0.96)_100%)] px-5 py-6 sm:px-8 lg:border-l lg:border-t-0 lg:px-10 lg:py-10">
          <AuthPanel />
        </aside>
      </div>
    </main>
  );
}
