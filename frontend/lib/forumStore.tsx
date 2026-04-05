'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { mockForumSeed } from '@/lib/mockData';
import { Comment, CommentNode, EditorPostDraft, ForumSeed, Post, UserProfile } from '@/lib/types';

const STORAGE_KEY = 'forum-app-state-v1';

type ForumContextValue = {
  users: UserProfile[];
  posts: Post[];
  comments: Comment[];
  tags: string[];
  currentUser: UserProfile;
  getUserById: (id: string) => UserProfile | undefined;
  getPostById: (id: number) => Post | undefined;
  getCommentsForPost: (postId: number) => CommentNode[];
  createPost: (draft: EditorPostDraft) => Post;
  updatePost: (postId: number, draft: EditorPostDraft) => void;
  deletePost: (postId: number) => void;
  togglePostLike: (postId: number) => boolean;
  toggleBookmark: (postId: number) => boolean;
  toggleFollowUser: (userId: string) => boolean;
  addComment: (postId: number, content: string, parentId?: number | null) => void;
  toggleCommentLike: (commentId: number) => boolean;
};

const ForumContext = createContext<ForumContextValue | null>(null);

function cloneSeed(seed: ForumSeed): ForumSeed {
  return {
    users: seed.users.map((user) => ({ ...user, followingIds: [...user.followingIds], likedPostIds: [...user.likedPostIds], bookmarkedPostIds: [...user.bookmarkedPostIds], likedCommentIds: [...user.likedCommentIds] })),
    posts: seed.posts.map((post) => ({ ...post, tags: [...post.tags] })),
    comments: seed.comments.map((comment) => ({ ...comment })),
    tags: [...seed.tags],
  };
}

function buildCommentTree(comments: Comment[], users: UserProfile[]): CommentNode[] {
  const commentsByParent = new Map<number | null, Comment[]>();
  const userMap = new Map(users.map((user) => [user.id, user]));

  comments.forEach((comment) => {
    const siblings = commentsByParent.get(comment.parentId) ?? [];
    siblings.push(comment);
    commentsByParent.set(comment.parentId, siblings);
  });

  const makeNode = (comment: Comment): CommentNode => ({
    ...comment,
    author: userMap.get(comment.authorId) ?? users[0],
    replies: (commentsByParent.get(comment.id) ?? [])
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map(makeNode),
  });

  return (commentsByParent.get(null) ?? [])
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(makeNode);
}

export function ForumProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ForumSeed>(() => cloneSeed(mockForumSeed));
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      hasHydratedRef.current = true;
      return;
    }

    try {
      const parsed = JSON.parse(raw) as ForumSeed;
      setState(cloneSeed(parsed));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    hasHydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      return;
    }

    const persistState = () => window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    const idleWindow = window as typeof window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    let idleId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      if (idleWindow.requestIdleCallback) {
        idleId = idleWindow.requestIdleCallback(persistState, { timeout: 800 });
        return;
      }

      persistState();
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
      if (idleId !== undefined) {
        idleWindow.cancelIdleCallback?.(idleId);
      }
    };
  }, [state]);

  const currentUser = useMemo(
    () => state.users.find((user) => user.isCurrentUser) ?? state.users[0],
    [state.users]
  );

  const value = useMemo<ForumContextValue>(() => {
    const getUserById = (id: string) => state.users.find((user) => user.id === id);
    const getPostById = (id: number) => state.posts.find((post) => post.id === id);

    return {
      ...state,
      currentUser,
      getUserById,
      getPostById,
      getCommentsForPost: (postId: number) => buildCommentTree(state.comments.filter((comment) => comment.postId === postId), state.users),
      createPost: (draft: EditorPostDraft) => {
        const nextPost: Post = {
          id: state.posts.length ? Math.max(...state.posts.map((post) => post.id)) + 1 : 1,
          authorId: currentUser.id,
          title: draft.title,
          content: draft.content,
          excerpt: `${draft.content.slice(0, 120)}${draft.content.length > 120 ? '...' : ''}`,
          tags: draft.tags,
          image: draft.image,
          createdAt: new Date().toISOString(),
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0,
          trendingScore: 50,
        };

        setState((prev) => ({
          ...prev,
          posts: [nextPost, ...prev.posts],
          tags: Array.from(new Set([...prev.tags, ...draft.tags])).sort(),
        }));

        return nextPost;
      },
      updatePost: (postId: number, draft: EditorPostDraft) => {
        setState((prev) => ({
          ...prev,
          posts: prev.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  title: draft.title,
                  content: draft.content,
                  excerpt: `${draft.content.slice(0, 120)}${draft.content.length > 120 ? '...' : ''}`,
                  tags: draft.tags,
                  image: draft.image,
                }
              : post
          ),
          tags: Array.from(new Set([...prev.tags, ...draft.tags])).sort(),
        }));
      },
      deletePost: (postId: number) => {
        setState((prev) => ({
          ...prev,
          posts: prev.posts.filter((post) => post.id !== postId),
          comments: prev.comments.filter((comment) => comment.postId !== postId),
          users: prev.users.map((user) => ({
            ...user,
            likedPostIds: user.likedPostIds.filter((id) => id !== postId),
            bookmarkedPostIds: user.bookmarkedPostIds.filter((id) => id !== postId),
          })),
        }));
      },
      togglePostLike: (postId: number) => {
        const liked = currentUser.likedPostIds.includes(postId);

        setState((prev) => ({
          ...prev,
          posts: prev.posts.map((post) =>
            post.id === postId
              ? { ...post, likes: liked ? Math.max(0, post.likes - 1) : post.likes + 1, trendingScore: liked ? post.trendingScore - 2 : post.trendingScore + 4 }
              : post
          ),
          users: prev.users.map((user) =>
            user.id === currentUser.id
              ? {
                  ...user,
                  likedPostIds: liked ? user.likedPostIds.filter((id) => id !== postId) : [...user.likedPostIds, postId],
                }
              : user
          ),
        }));

        return !liked;
      },
      toggleBookmark: (postId: number) => {
        const bookmarked = currentUser.bookmarkedPostIds.includes(postId);

        setState((prev) => ({
          ...prev,
          users: prev.users.map((user) =>
            user.id === currentUser.id
              ? {
                  ...user,
                  bookmarkedPostIds: bookmarked ? user.bookmarkedPostIds.filter((id) => id !== postId) : [...user.bookmarkedPostIds, postId],
                }
              : user
          ),
        }));

        return !bookmarked;
      },
      toggleFollowUser: (userId: string) => {
        const following = currentUser.followingIds.includes(userId);

        setState((prev) => ({
          ...prev,
          users: prev.users.map((user) => {
            if (user.id === currentUser.id) {
              return {
                ...user,
                following: following ? Math.max(0, user.following - 1) : user.following + 1,
                followingIds: following ? user.followingIds.filter((id) => id !== userId) : [...user.followingIds, userId],
              };
            }

            if (user.id === userId) {
              return {
                ...user,
                followers: following ? Math.max(0, user.followers - 1) : user.followers + 1,
              };
            }

            return user;
          }),
        }));

        return !following;
      },
      addComment: (postId: number, content: string, parentId = null) => {
        const nextComment: Comment = {
          id: state.comments.length ? Math.max(...state.comments.map((comment) => comment.id)) + 1 : 1,
          postId,
          parentId,
          authorId: currentUser.id,
          content,
          createdAt: new Date().toISOString(),
          likes: 0,
        };

        setState((prev) => ({
          ...prev,
          comments: [...prev.comments, nextComment],
          posts: prev.posts.map((post) =>
            post.id === postId ? { ...post, comments: post.comments + 1, trendingScore: post.trendingScore + 3 } : post
          ),
        }));
      },
      toggleCommentLike: (commentId: number) => {
        const liked = currentUser.likedCommentIds.includes(commentId);

        setState((prev) => ({
          ...prev,
          comments: prev.comments.map((comment) =>
            comment.id === commentId ? { ...comment, likes: liked ? Math.max(0, comment.likes - 1) : comment.likes + 1 } : comment
          ),
          users: prev.users.map((user) =>
            user.id === currentUser.id
              ? {
                  ...user,
                  likedCommentIds: liked ? user.likedCommentIds.filter((id) => id !== commentId) : [...user.likedCommentIds, commentId],
                }
              : user
          ),
        }));

        return !liked;
      },
    };
  }, [currentUser, state]);

  return <ForumContext.Provider value={value}>{children}</ForumContext.Provider>;
}

export function useForum() {
  const context = useContext(ForumContext);

  if (!context) {
    throw new Error('useForum must be used inside ForumProvider');
  }

  return context;
}
