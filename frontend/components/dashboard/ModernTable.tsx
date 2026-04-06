'use client';

import { memo } from 'react';

type RecentActivity = {
  id: string;
  user: string;
  action: string;
  time: string;
  status: 'success' | 'pending' | 'review';
};

const recentActivities: RecentActivity[] = [
  { id: '#1234', user: 'nguyenvana', action: 'Published Machine Learning Basics', time: '2 mins ago', status: 'success' },
  { id: '#1233', user: 'tranthib', action: 'Requested AI-assisted summary for webdev hub', time: '5 mins ago', status: 'review' },
  { id: '#1232', user: 'levanc', action: 'Commented on React Hooks architecture thread', time: '12 mins ago', status: 'success' },
  { id: '#1231', user: 'phamthid', action: 'Saved three recommended posts', time: '25 mins ago', status: 'success' },
  { id: '#1230', user: 'hoangminh', action: 'Created frontend systems group', time: '1 hr ago', status: 'pending' },
];

const statusStyles = {
  success: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  review: 'bg-uit-100 text-uit-700',
};

function ModernTable() {
  return (
    <section className="dashboard-card overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-white/60 px-6 py-5">
        <div>
          <p className="eyebrow">Recent activity</p>
          <h3 className="section-title mt-2">Operational timeline</h3>
        </div>
        <span className="rounded-full bg-uit-50 px-3 py-1 text-xs font-semibold text-uit-700">Updated live</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px]">
          <thead>
            <tr className="border-b border-white/60 bg-white/35 text-left">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">Activity</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">User</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">Time</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentActivities.map((activity) => (
              <tr key={activity.id} className="border-b border-white/40 text-sm text-ink-600 transition-colors hover:bg-white/35">
                <td className="px-6 py-4">
                  <div className="font-medium text-ink-900">{activity.action}</div>
                  <div className="mt-1 text-xs text-ink-500">ID {activity.id}</div>
                </td>
                <td className="px-6 py-4 font-medium text-ink-800">{activity.user}</td>
                <td className="px-6 py-4">{activity.time}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[activity.status]}`}>
                    {activity.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default memo(ModernTable);
