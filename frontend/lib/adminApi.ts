'use client';

import { api } from '@/lib/axios';

export type PaginatedResponse<T> = {
  items: T[];
  meta: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
};

export type AdminUser = {
  id: string;
  username: string | null;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
};

export type AdminReport = {
  id: number;
  reporter_id: string | null;
  post_id: number | null;
  comment_id: number | null;
  reason: string;
  details: string | null;
  status: 'pending' | 'reviewed' | 'dismissed' | 'resolved';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type PendingPost = {
  id: number;
  user_id: string;
  title: string;
  status: string;
  created_at: string;
};

export type AdminOverview = {
  users_today: number;
  users_week: number;
  posts_today: number;
  posts_week: number;
  comments_today: number;
  comments_week: number;
  reports_today: number;
  reports_week: number;
  pending_reports: number;
  pending_posts: number;
};

export async function getAdminOverview() {
  const response = await api.get<AdminOverview>('/api/admin/analytics/overview');
  return response.data;
}

export async function getAdminUsers(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  statusFilter?: 'active' | 'banned' | 'deleted' | '';
  sortBy?: 'created_at' | 'username' | 'email';
  sortOrder?: 'asc' | 'desc';
}) {
  const response = await api.get<PaginatedResponse<AdminUser>>('/api/admin/users', {
    params: {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 10,
      search: params.search || undefined,
      status_filter: params.statusFilter || undefined,
      sort_by: params.sortBy ?? 'created_at',
      sort_order: params.sortOrder ?? 'desc',
    },
  });
  return response.data;
}

export async function banUser(userId: string, reason?: string) {
  const response = await api.post<AdminUser>(`/api/admin/users/${userId}/ban`, undefined, {
    params: { reason: reason || undefined },
  });
  return response.data;
}

export async function unbanUser(userId: string, reason?: string) {
  const response = await api.post<AdminUser>(`/api/admin/users/${userId}/unban`, undefined, {
    params: { reason: reason || undefined },
  });
  return response.data;
}

export async function getAdminReports(params: {
  page?: number;
  pageSize?: number;
  statusFilter?: 'pending' | 'reviewed' | 'dismissed' | 'resolved' | '';
  reason?: string;
}) {
  const response = await api.get<PaginatedResponse<AdminReport>>('/api/admin/reports', {
    params: {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 10,
      status_filter: params.statusFilter || undefined,
      reason: params.reason || undefined,
    },
  });
  return response.data;
}

export async function moderateReport(reportId: number, status: 'pending' | 'reviewed' | 'dismissed' | 'resolved') {
  const response = await api.post<AdminReport>(`/api/admin/reports/${reportId}/moderate`, { status });
  return response.data;
}

export async function getPendingPosts(params: { page?: number; pageSize?: number }) {
  const response = await api.get<PaginatedResponse<PendingPost>>('/api/admin/posts/pending', {
    params: {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 10,
    },
  });
  return response.data;
}

export async function approvePost(postId: number) {
  await api.post(`/api/admin/posts/${postId}/approve`);
}

export async function rejectPost(postId: number) {
  await api.post(`/api/admin/posts/${postId}/reject`);
}
