'use client';

import Link from 'next/link';
import { FiArrowUpRight, FiGrid, FiPlus, FiUsers, FiZap } from 'react-icons/fi';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const chartData = [42, 56, 48, 72, 68, 88, 84];
const bars = [62, 84, 58, 91, 73, 67];

export default function Dashboard() {
  return (
    <DashboardLayout>
      <section className="dashboard-card overflow-hidden p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="eyebrow">Dashboard wireframe</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">Modern operations dashboard for an AI-powered technology community.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-600">The layout follows a clean Vercel or Linear-inspired structure: top summary, action center, charts, and recent operational signals.</p>
          </div>
          <div className="rounded-[28px] border border-uit-100 bg-gradient-to-br from-uit-50 via-white to-ai-cyan/10 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-ink-400">Admin panel</p>
            <div className="mt-4 space-y-3 text-sm text-ink-700">
              <div className="flex items-center justify-between rounded-[20px] bg-white/80 px-4 py-3"><span>Moderation queue</span><span className="font-semibold text-uit-700">12</span></div>
              <div className="flex items-center justify-between rounded-[20px] bg-white/80 px-4 py-3"><span>Flagged posts</span><span className="font-semibold text-uit-700">4</span></div>
              <div className="flex items-center justify-between rounded-[20px] bg-white/80 px-4 py-3"><span>AI usage budget</span><span className="font-semibold text-uit-700">78%</span></div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="dashboard-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Quick actions</p>
              <h2 className="section-title mt-2">High-visibility admin controls</h2>
            </div>
            <Link href="/create" className="inline-flex items-center gap-2 rounded-2xl border border-uit-100 bg-white/80 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:border-uit-300 hover:text-uit-700">
              <FiArrowUpRight className="h-4 w-4" />
              Open workspace
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <button type="button" className="rounded-[24px] border border-uit-100 bg-white/80 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-uit-300">
              <FiPlus className="h-5 w-5 text-uit-700" />
              <h3 className="mt-4 font-semibold text-ink-900">Create announcement</h3>
              <p className="mt-2 text-sm text-ink-600">Broadcast product updates or campus events.</p>
            </button>
            <button type="button" className="rounded-[24px] border border-uit-100 bg-white/80 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-uit-300">
              <FiUsers className="h-5 w-5 text-uit-700" />
              <h3 className="mt-4 font-semibold text-ink-900">Review community health</h3>
              <p className="mt-2 text-sm text-ink-600">Inspect follower growth and participation quality.</p>
            </button>
            <button type="button" className="rounded-[24px] border border-uit-100 bg-white/80 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-uit-300">
              <FiZap className="h-5 w-5 text-uit-700" />
              <h3 className="mt-4 font-semibold text-ink-900">Tune AI suggestions</h3>
              <p className="mt-2 text-sm text-ink-600">Adjust recommendation thresholds and prompt focus.</p>
            </button>
            <button type="button" className="rounded-[24px] border border-uit-100 bg-white/80 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-uit-300">
              <FiGrid className="h-5 w-5 text-uit-700" />
              <h3 className="mt-4 font-semibold text-ink-900">Manage layout experiments</h3>
              <p className="mt-2 text-sm text-ink-600">Track feed and profile experiments by cohort.</p>
            </button>
          </div>
        </section>

        <section className="dashboard-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Charts</p>
              <h2 className="section-title mt-2">Engagement trend</h2>
            </div>
            <span className="rounded-full bg-uit-50 px-3 py-1 text-xs font-semibold text-uit-700">Last 7 days</span>
          </div>
          <div className="mt-6 flex h-56 items-end gap-3 rounded-[24px] bg-gradient-to-b from-uit-50/80 to-white p-4">
            {chartData.map((value, index) => (
              <div key={index} className="flex h-full flex-1 flex-col justify-end gap-3">
                <div className="rounded-t-[18px] bg-gradient-to-t from-uit-600 to-ai-cyan" style={{ height: `${value}%` }} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="dashboard-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Charts</p>
              <h2 className="section-title mt-2">Topic performance by vertical</h2>
            </div>
            <span className="text-sm text-ink-500">12-column content grid</span>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-6">
            {bars.map((value, index) => (
              <div key={index} className="rounded-[24px] border border-uit-100 bg-white/80 p-4 text-center">
                <div className="mx-auto flex h-40 w-10 items-end rounded-full bg-uit-50 p-1">
                  <div className="w-full rounded-full bg-gradient-to-t from-uit-600 to-ai-mint" style={{ height: `${value}%` }} />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">T{index + 1}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-card p-6">
          <p className="eyebrow">Notifications</p>
          <h2 className="section-title mt-2">Actionable alerts</h2>
          <div className="mt-5 space-y-3">
            <div className="rounded-[22px] border border-uit-100 bg-white/80 p-4">
              <p className="font-semibold text-ink-900">AI recommendation CTR improved 8%</p>
              <p className="mt-1 text-sm text-ink-600">After switching to technology-focused summaries.</p>
            </div>
            <div className="rounded-[22px] border border-uit-100 bg-white/80 p-4">
              <p className="font-semibold text-ink-900">New moderator approval pending</p>
              <p className="mt-1 text-sm text-ink-600">Two requests from the frontend engineering community.</p>
            </div>
            <div className="rounded-[22px] border border-uit-100 bg-white/80 p-4">
              <p className="font-semibold text-ink-900">Profile completion dipped this week</p>
              <p className="mt-1 text-sm text-ink-600">Consider surfacing profile prompts in onboarding.</p>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

