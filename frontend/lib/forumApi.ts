'use client';

import { api } from '@/lib/axios';

export type ApiAuthor = {
  id: string;
  username: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: string;
  status: string;
  provider: string;
};

export type ApiPost = {
  id: number;
  user_id: string;
  title: string;
  content: string;
  cover_image: string | null;
  status: string | null;
  tags: string[];
  created_at: string;
  updated_at?: string | null;
  author: ApiAuthor;
  likes_count: number;
  comments_count: number;
  views_count: number;
  shares_count: number;
  trending_score: number;
  is_liked: boolean;
  is_bookmarked: boolean;
};

export type ApiComment = {
  id: number;
  post_id: number;
  user_id: string;
  parent_id: number | null;
  content: string;
  created_at: string;
  author: ApiAuthor;
  replies: ApiComment[];
};

export type FeedResponse = {
  items: ApiPost[];
  meta: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
};

export async function getFeed(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  tag?: string | null;
  mode?: 'for-you' | 'following' | 'trending';
  sort?: 'latest' | 'trending' | 'most-liked' | 'most-commented';
}) {
  const response = await api.get<FeedResponse>('/api/posts/feed', {
    params: {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 10,
      search: params.search || undefined,
      tag: params.tag || undefined,
      mode: params.mode ?? 'for-you',
      sort: params.sort ?? 'latest',
    },
  });
  return response.data;
}

export async function getPost(postId: number) {
  const response = await api.get<ApiPost>(`/api/posts/${postId}`);
  return response.data;
}

export async function createPost(payload: {
  title: string;
  content: string;
  cover_image?: string;
  tags: string[];
}) {
  const response = await api.post<ApiPost>('/api/posts/', payload);
  return response.data;
}

export async function updatePost(
  postId: number,
  payload: Partial<{
    title: string;
    content: string;
    cover_image: string;
    tags: string[];
  }>
) {
  const response = await api.put<ApiPost>(`/api/posts/${postId}`, payload);
  return response.data;
}

export async function deletePost(postId: number) {
  const response = await api.delete<{ message: string }>(`/api/posts/${postId}`);
  return response.data;
}

export async function togglePostLike(postId: number) {
  const response = await api.post<{ message: string }>(`/api/posts/${postId}/like`);
  return response.data;
}

export async function toggleBookmark(postId: number) {
  const response = await api.post<{ message: string }>(`/api/posts/${postId}/bookmark`);
  return response.data;
}

export async function sharePost(postId: number) {
  const response = await api.post<{ message: string }>(`/api/posts/${postId}/share`);
  return response.data;
}

export async function getComments(postId: number) {
  const response = await api.get<ApiComment[]>(`/api/posts/${postId}/comments/`);
  return response.data;
}

export async function createComment(postId: number, payload: { content: string; parent_id?: number | null }) {
  const response = await api.post<ApiComment>(`/api/posts/${postId}/comments/`, payload);
  return response.data;
}

export async function getTags() {
  const response = await api.get<Array<{ id: number; name: string; slug: string }>>('/api/posts/tags');
  return response.data;
}
