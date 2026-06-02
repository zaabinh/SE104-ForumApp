'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  AdminOverview,
  AdminReport,
  AdminUser,
  PendingPost,
  approvePost,
  banUser,
  getAdminOverview,
  getAdminReports,
  getAdminUsers,
  getPendingPosts,
  moderateReport,
  rejectPost,
  unbanUser,
} from '@/lib/adminApi';

export default function DashboardPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [reportsPage, setReportsPage] = useState(1);
  const [postsPage, setPostsPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersStatus, setUsersStatus] = useState('');
  const [reportsStatus, setReportsStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewData, usersData, reportsData, postsData] = await Promise.all([
        getAdminOverview(),
        getAdminUsers({ page: usersPage, pageSize: 10, search: usersSearch, statusFilter: usersStatus as '' | 'active' | 'banned' | 'deleted' }),
        getAdminReports({ page: reportsPage, pageSize: 10, statusFilter: reportsStatus as '' | 'pending' | 'reviewed' | 'dismissed' | 'resolved' }),
        getPendingPosts({ page: postsPage, pageSize: 10 }),
      ]);
      setOverview(overviewData);
      setUsers(usersData.items);
      setReports(reportsData.items);
      setPendingPosts(postsData.items);
    } catch {
      setError('Cannot load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [usersPage, reportsPage, postsPage]);

  return (
    <DashboardLayout>
      <section className="dashboard-card p-6">
        <h1 className="text-2xl font-semibold text-ink-900">Admin Operations</h1>
        {error ? <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Stat title="Users (7d)" value={overview?.users_week ?? 0} />
          <Stat title="Posts (7d)" value={overview?.posts_week ?? 0} />
          <Stat title="Comments (7d)" value={overview?.comments_week ?? 0} />
          <Stat title="Reports pending" value={overview?.pending_reports ?? 0} />
          <Stat title="Posts pending" value={overview?.pending_posts ?? 0} />
        </div>
      </section>

      <section className="dashboard-card p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold text-ink-900">Users</h2>
          <input
            value={usersSearch}
            onChange={(e) => setUsersSearch(e.target.value)}
            placeholder="Search username/email"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <select value={usersStatus} onChange={(e) => setUsersStatus(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="deleted">Deleted</option>
          </select>
          <button onClick={() => void loadData()} className="rounded-xl bg-uit-600 px-3 py-2 text-sm font-semibold text-white">Apply</button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="py-2">Username</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="py-2">{user.username || '-'}</td>
                  <td>{user.email}</td>
                  <td>{user.status}</td>
                  <td>
                    {user.status.toLowerCase() === 'banned' ? (
                      <button
                        onClick={async () => {
                          await unbanUser(user.id);
                          await loadData();
                        }}
                        className="rounded-lg bg-emerald-600 px-2 py-1 text-xs text-white"
                      >
                        Unban
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          await banUser(user.id);
                          await loadData();
                        }}
                        className="rounded-lg bg-rose-600 px-2 py-1 text-xs text-white"
                      >
                        Ban
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager page={usersPage} onPrev={() => setUsersPage((p) => Math.max(1, p - 1))} onNext={() => setUsersPage((p) => p + 1)} />
      </section>

      <section className="dashboard-card p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold text-ink-900">Reports</h2>
          <select value={reportsStatus} onChange={(e) => setReportsStatus(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="dismissed">Dismissed</option>
            <option value="resolved">Resolved</option>
          </select>
          <button onClick={() => void loadData()} className="rounded-xl bg-uit-600 px-3 py-2 text-sm font-semibold text-white">Apply</button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="py-2">ID</th>
                <th>Target</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-t border-slate-100">
                  <td className="py-2">#{report.id}</td>
                  <td>{report.post_id ? `Post ${report.post_id}` : `Comment ${report.comment_id}`}</td>
                  <td>{report.reason}</td>
                  <td>{report.status}</td>
                  <td className="space-x-2">
                    <button onClick={async () => { await moderateReport(report.id, 'resolved'); await loadData(); }} className="rounded-lg bg-emerald-600 px-2 py-1 text-xs text-white">Resolve</button>
                    <button onClick={async () => { await moderateReport(report.id, 'dismissed'); await loadData(); }} className="rounded-lg bg-slate-500 px-2 py-1 text-xs text-white">Dismiss</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager page={reportsPage} onPrev={() => setReportsPage((p) => Math.max(1, p - 1))} onNext={() => setReportsPage((p) => p + 1)} />
      </section>

      <section className="dashboard-card p-6">
        <h2 className="text-lg font-semibold text-ink-900">Pending Post Moderation</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="py-2">Post ID</th>
                <th>Title</th>
                <th>New tags</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingPosts.map((post) => (
                <tr key={post.id} className="border-t border-slate-100">
                  <td className="py-2">#{post.id}</td>
                  <td>{post.title}</td>
                  <td>
                    {post.requested_new_tags?.length ? (
                      <span className="rounded-lg bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                        {post.requested_new_tags.join(', ')}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td>{post.status}</td>
                  <td className="space-x-2">
                    <button onClick={async () => { await approvePost(post.id); await loadData(); }} className="rounded-lg bg-emerald-600 px-2 py-1 text-xs text-white">Approve</button>
                    <button onClick={async () => { await rejectPost(post.id); await loadData(); }} className="rounded-lg bg-rose-600 px-2 py-1 text-xs text-white">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager page={postsPage} onPrev={() => setPostsPage((p) => Math.max(1, p - 1))} onNext={() => setPostsPage((p) => p + 1)} />
      </section>

      {loading ? <p className="text-sm text-ink-500">Loading...</p> : null}
    </DashboardLayout>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white/80 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-ink-900">{value}</p>
    </article>
  );
}

function Pager({ page, onPrev, onNext }: { page: number; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="mt-4 flex items-center gap-2">
      <button onClick={onPrev} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">Prev</button>
      <span className="text-xs text-ink-600">Page {page}</span>
      <button onClick={onNext} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">Next</button>
    </div>
  );
}
