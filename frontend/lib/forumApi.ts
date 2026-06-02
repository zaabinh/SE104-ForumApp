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
  requested_new_tags?: string[];
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

export type SimilarPost = {
  post: ApiPost;
  similarity_score: number;
  similarity_reason: string;
};

export type SimilarPostsResponse = {
  items: SimilarPost[];
  meta: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
};

export type CollaborativePost = {
  post: ApiPost;
  cf_score: number;
  cf_reason: string;
  similar_user_count: number;
};

export type CollaborativePostsResponse = {
  items: CollaborativePost[];
  meta: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
};

export type ProfileBasedPost = {
  post: ApiPost;
  profile_score: number;
  recommendation_reason: string;
};

export type ProfileBasedPostsResponse = {
  items: ProfileBasedPost[];
  meta: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
};

export type UserProfileSummary = {
  interest_tags: string[];
  major: string;
  academic_year: string;
  career_goal: string;
  profile_strength: number;
  recommendations_count: number;
  profile_completeness: Record<string, boolean>;
};

export type ProfileAnalysis = {
  user_id: string;
  profile_summary: UserProfileSummary;
  recommendation_message: string;
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

export async function sharePostWithEdit(
  postId: number,
  payload: {
    caption?: string;
  }
) {
  const response = await api.post<{ message: string }>(`/api/posts/${postId}/share`, payload);
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

export async function getSimilarPosts(postId: number, params?: {
  limit?: number;
  min_similarity?: number;
}) {
  const response = await api.get<SimilarPostsResponse>(`/api/posts/${postId}/similar`, {
    params: {
      limit: params?.limit ?? 5,
      min_similarity: params?.min_similarity ?? 0.1,
    },
  });
  return response.data;
}

export async function getCollaborativeRecommendations(params?: {
  page?: number;
  pageSize?: number;
  min_similarity?: number;
  daysBack?: number;
}) {
  const response = await api.get<CollaborativePostsResponse>('/api/posts/recommendations/collaborative', {
    params: {
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 10,
      min_similarity: params?.min_similarity ?? 0.2,
      days_back: params?.daysBack ?? 30,
    },
  });
  return response.data;
}

export async function getProfileBasedRecommendations(params?: {
  page?: number;
  pageSize?: number;
  min_score?: number;
  daysBack?: number;
}) {
  const response = await api.get<ProfileBasedPostsResponse>('/api/posts/recommendations/profile', {
    params: {
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 10,
      min_score: params?.min_score ?? 0.1,
      days_back: params?.daysBack ?? 30,
    },
  });
  return response.data;
}

export async function getUserProfileSummary() {
  const response = await api.get<UserProfileSummary>('/api/posts/profile/summary');
  return response.data;
}

export async function getProfileAnalysis() {
  const response = await api.get<ProfileAnalysis>('/api/posts/profile/analysis');
  return response.data;
}
