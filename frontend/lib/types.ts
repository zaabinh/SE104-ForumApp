export type FeedMode = 'for-you' | 'following' | 'trending';

export type SortOption = 'latest' | 'trending' | 'most-liked' | 'most-commented';

export type UserProfile = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  role: string;
  followers: number;
  following: number;
  followingIds: string[];
  likedPostIds: number[];
  bookmarkedPostIds: number[];
  likedCommentIds: number[];
  isCurrentUser?: boolean;
};

export type Post = {
  id: number;
  authorId: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  image: string;
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  trendingScore: number;
};

export type Comment = {
  id: number;
  postId: number;
  parentId: number | null;
  authorId: string;
  content: string;
  createdAt: string;
  likes: number;
};

export type CommentNode = Comment & {
  author: UserProfile;
  replies: CommentNode[];
};

export type EditorPostDraft = {
  title: string;
  content: string;
  tags: string[];
  image: string;
};

export type ForumSeed = {
  users: UserProfile[];
  posts: Post[];
  comments: Comment[];
  tags: string[];
};
