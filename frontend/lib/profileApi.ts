'use client';

import { api, fetchCurrentUser, saveStoredUser } from '@/lib/axios';

export type ProfileSummary = {
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_following: boolean;
  is_current_user: boolean;
};

export type CurrentProfile = ProfileSummary & {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
};

export type ProfilePost = {
  id: number;
  title: string;
  content: string;
  cover_image: string | null;
  created_at: string;
};

export type ProfileComment = {
  id: number;
  post_id: number;
  post_title: string | null;
  content: string;
  created_at: string;
};

export type UpdateProfilePayload = {
  full_name: string;
  bio: string;
  avatar_url: string;
};

export async function getMyProfile() {
  const response = await api.get<CurrentProfile>('/users/me');
  return response.data;
}

export async function getUserProfile(username: string) {
  const response = await api.get<ProfileSummary>(`/users/${username}`);
  return response.data;
}

export async function getUserPosts(username: string) {
  const response = await api.get<ProfilePost[]>(`/users/${username}/posts`);
  return response.data;
}

export async function getUserComments(username: string) {
  const response = await api.get<ProfileComment[]>(`/users/${username}/comments`);
  return response.data;
}

export async function getUserBookmarks(username: string) {
  const response = await api.get<ProfilePost[]>(`/users/${username}/bookmarks`);
  return response.data;
}

export async function updateMyProfile(payload: UpdateProfilePayload) {
  const response = await api.put<CurrentProfile>('/users/me', payload);
  const currentUser = await fetchCurrentUser();
  saveStoredUser(currentUser);
  return response.data;
}

export async function followUser(userId: string) {
  const response = await api.post<{ message: string; following: boolean }>(`/follow/${userId}`);
  return response.data;
}

export async function unfollowUser(userId: string) {
  const response = await api.delete<{ message: string; following: boolean }>(`/follow/${userId}`);
  return response.data;
}
