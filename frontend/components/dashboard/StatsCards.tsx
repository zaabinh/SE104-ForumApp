'use client';

import { memo } from 'react';
import { FiActivity, FiBarChart2, FiMessageCircle, FiUsers, FiZap } from 'react-icons/fi';

const stats = [
  {
    title: 'Active users',
    value: '2.4K',
    change: '+18%',
    icon: FiUsers,
    accent: 'from-uit-600 to-ai-cyan',
  },
  {
    title: 'Posts published',
    value: '1.2K',
    change: '+24%',
    icon: FiMessageCircle,
    accent: 'from-ai-mint to-uit-500',
  },
  {
    title: 'Comments',
    value: '8.9K',
    change: '+11%',
    icon: FiActivity,
    accent: 'from-uit-500 to-ai-mint',
  },
  {
    title: 'AI usage',
    value: '78%',
    change: '+9%',
    icon: FiZap,
    accent: 'from-uit-700 to-ai-cyan',
  },
];

function StatsCards() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ title, value, change, icon: Icon, accent }) => (
        <article key={title} className="dashboard-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-400">{title}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">{value}</p>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-gradient`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <span className="rounded-full bg-uit-50 px-3 py-1 text-xs font-semibold text-uit-700">{change}</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-500">
              <FiBarChart2 className="h-4 w-4 text-uit-700" />
              vs last month
            </span>
          </div>
        </article>
      ))}
    </section>
  );
}

export default memo(StatsCards);
