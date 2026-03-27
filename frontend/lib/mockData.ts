import { Comment, ForumSeed, Post, SortOption, UserProfile } from './types';

const day = 24 * 60 * 60 * 1000;
const hour = 60 * 60 * 1000;

const now = Date.now();

export const mockUsers: UserProfile[] = [
  {
    id: 'current-user',
    name: 'An Nguyen',
    username: '@annguyen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80',
    bio: 'Frontend engineer building thoughtful product surfaces, scalable design systems, and practical developer communities.',
    role: 'Community Builder',
    followers: 324,
    following: 18,
    followingIds: ['john-doe', 'mina-patel'],
    likedPostIds: [2, 4, 7],
    bookmarkedPostIds: [1, 3, 8],
    likedCommentIds: [1002, 1005],
    isCurrentUser: true,
  },
  {
    id: 'john-doe',
    name: 'John Doe',
    username: '@johndoe',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80',
    bio: 'Building SaaS products, writing about product-market fit, and sharing real startup lessons.',
    role: 'Founder Engineer',
    followers: 12400,
    following: 230,
    followingIds: [],
    likedPostIds: [],
    bookmarkedPostIds: [],
    likedCommentIds: [],
  },
  {
    id: 'lisa-carter',
    name: 'Lisa Carter',
    username: '@lisacarter',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80',
    bio: 'DevOps lead focused on calm incident response, observability, and resilient engineering teams.',
    role: 'DevOps Lead',
    followers: 9800,
    following: 118,
    followingIds: [],
    likedPostIds: [],
    bookmarkedPostIds: [],
    likedCommentIds: [],
  },
  {
    id: 'mina-patel',
    name: 'Mina Patel',
    username: '@minapatel',
    avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=120&q=80',
    bio: 'Design systems engineer exploring component architecture, accessibility, and scalable UI patterns.',
    role: 'Design Systems Engineer',
    followers: 15700,
    following: 204,
    followingIds: [],
    likedPostIds: [],
    bookmarkedPostIds: [],
    likedCommentIds: [],
  },
  {
    id: 'alex-nguyen',
    name: 'Alex Nguyen',
    username: '@alexnguyen',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&q=80',
    bio: 'Shipping platform work and documenting the tradeoffs behind every major decision.',
    role: 'Platform Engineer',
    followers: 4200,
    following: 144,
    followingIds: [],
    likedPostIds: [],
    bookmarkedPostIds: [],
    likedCommentIds: [],
  },
  {
    id: 'sara-kim',
    name: 'Sara Kim',
    username: '@sarakim',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80',
    bio: 'Product-minded engineer interested in calm interfaces, workflow quality, and developer ergonomics.',
    role: 'Product Engineer',
    followers: 6100,
    following: 162,
    followingIds: [],
    likedPostIds: [],
    bookmarkedPostIds: [],
    likedCommentIds: [],
  },
];

const postTemplates: Array<Omit<Post, 'id' | 'createdAt' | 'comments' | 'likes' | 'shares' | 'views' | 'trendingScore'>> = [
  {
    authorId: 'john-doe',
    title: 'How I built my first SaaS',
    excerpt: 'Sharing the validation, launch, and roadmap decisions that mattered more than code style debates.',
    content:
      'I treated the first version like a learning device instead of a polished startup fantasy. The faster I turned assumptions into customer feedback, the better every engineering decision became.\n\nThe real leverage came from narrowing scope aggressively, instrumenting the funnel early, and documenting the tradeoffs so I could explain each choice to teammates and future contributors.\n\nIf you are building your first SaaS, optimize for evidence, not vanity. Shipping one useful workflow beats building ten incomplete surfaces.',
    tags: ['startup', 'nextjs', 'product'],
    image: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=1200&q=80',
  },
  {
    authorId: 'lisa-carter',
    title: 'Debugging production bugs with calm workflows',
    excerpt: 'A checklist for triaging and fixing high-pressure incidents without creating more damage.',
    content:
      'When an incident starts, the first job is not heroics. It is reducing uncertainty. I anchor the team on a timeline, isolate the blast radius, and protect rollback options before anyone starts guessing at root cause.\n\nThe fastest teams are not frantic. They are predictable. They write down facts, test one hypothesis at a time, and resist the urge to patch three systems at once.\n\nPostmortems should improve the system, not punish the humans operating it.',
    tags: ['debugging', 'devops', 'incident'],
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80',
  },
  {
    authorId: 'mina-patel',
    title: 'Tailwind architecture at scale',
    excerpt: 'Patterns for creating scalable design systems with utility-first CSS and fewer one-off exceptions.',
    content:
      'Utility-first CSS works best when the design language is explicit. Teams run into trouble when spacing, color, and state rules live only in people’s heads.\n\nI treat component APIs as contracts. If a card, button, and surface use the same elevation model and spacing rhythm, the interface starts to feel deliberate instead of assembled.\n\nTailwind scales when the design system scales first.',
    tags: ['tailwind', 'design-system', 'frontend'],
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
  },
  {
    authorId: 'alex-nguyen',
    title: 'What changed after adopting server components',
    excerpt: 'The wins were real, but only after we clarified ownership between server data boundaries and client interactions.',
    content:
      'Server components did not magically simplify the app. What they did was force us to define which data belonged on the server and which interactions truly needed client state.\n\nOnce the boundaries were clearer, the codebase got easier to reason about. We deleted client-side fetching in places that never should have owned it, and our loading states became much more intentional.\n\nArchitecture clarity was the real benefit.',
    tags: ['react', 'nextjs', 'architecture'],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80',
  },
  {
    authorId: 'sara-kim',
    title: 'Writing product updates engineers actually read',
    excerpt: 'Good internal writing respects time, shows decisions, and makes follow-up work easier.',
    content:
      'Most internal updates fail because they are too vague. Teams need to know what changed, why it changed, who it affects, and what comes next.\n\nThe strongest updates are short, specific, and linked to a clear decision trail. That gives engineers enough context to move without another meeting.\n\nWriting is a product surface. Treat it that way.',
    tags: ['writing', 'productivity', 'career'],
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80',
  },
  {
    authorId: 'john-doe',
    title: 'Shipping community features without bloating the UI',
    excerpt: 'A practical way to introduce engagement mechanics while keeping the reading experience clean.',
    content:
      'Every new interaction competes with the primary job of the page. In a forum, that means reading and responding with clarity.\n\nWe prioritized the smallest set of actions that made contribution feel rewarding without turning every card into a control panel. The result was a cleaner hierarchy and stronger participation quality.\n\nFeature density is not the same thing as product depth.',
    tags: ['community', 'ux', 'frontend'],
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
  },
];

export const mockPosts: Post[] = Array.from({ length: 18 }, (_, index) => {
  const template = postTemplates[index % postTemplates.length];
  const hoursAgo = (index % 9) * 4 + 2;

  return {
    ...template,
    id: index + 1,
    createdAt: new Date(now - hoursAgo * hour - index * 18 * 60 * 1000).toISOString(),
    likes: 18 + index * 7,
    comments: 4 + (index % 6) * 3,
    shares: 2 + (index % 4),
    views: 140 + index * 38,
    trendingScore: 52 + index * 9,
  };
});

export const mockComments: Comment[] = [
  {
    id: 1001,
    postId: 1,
    parentId: null,
    authorId: 'alex-nguyen',
    content: 'The framing here is strong. Treating the first release as a learning device is a much better mental model than pretending version one is durable.',
    createdAt: new Date(now - 5 * hour).toISOString(),
    likes: 21,
  },
  {
    id: 1002,
    postId: 1,
    parentId: 1001,
    authorId: 'sara-kim',
    content: 'Agreed. The scope discipline point is the part most teams skip when they are excited.',
    createdAt: new Date(now - 4 * hour).toISOString(),
    likes: 8,
  },
  {
    id: 1003,
    postId: 2,
    parentId: null,
    authorId: 'current-user',
    content: 'The incident response section feels practical. Do you keep this checklist in the repo or in your runbook tooling?',
    createdAt: new Date(now - 3 * hour).toISOString(),
    likes: 6,
  },
  {
    id: 1004,
    postId: 2,
    parentId: 1003,
    authorId: 'lisa-carter',
    content: 'We keep the short version in the repo and the operational detail in our runbook so both engineering and support can use it.',
    createdAt: new Date(now - 2 * hour).toISOString(),
    likes: 10,
  },
  {
    id: 1005,
    postId: 3,
    parentId: null,
    authorId: 'john-doe',
    content: 'Component contracts as design system contracts is exactly the right lens.',
    createdAt: new Date(now - 7 * hour).toISOString(),
    likes: 14,
  },
  {
    id: 1006,
    postId: 4,
    parentId: null,
    authorId: 'mina-patel',
    content: 'The benefit of server components really does show up after teams get serious about boundaries.',
    createdAt: new Date(now - 8 * hour).toISOString(),
    likes: 11,
  },
];

export const mockTags = Array.from(new Set(mockPosts.flatMap((post) => post.tags))).sort();

export const mockForumSeed: ForumSeed = {
  users: mockUsers,
  posts: mockPosts,
  comments: mockComments,
  tags: mockTags,
};

export function formatRelativeTime(value: string): string {
  const timestamp = new Date(value).getTime();
  const delta = Math.max(1, now - timestamp);
  const hours = Math.floor(delta / hour);
  const days = Math.floor(delta / day);

  if (hours < 1) {
    const minutes = Math.max(1, Math.floor(delta / (60 * 1000)));
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${days}d ago`;
}

export function getSortValue(post: Post, sort: SortOption): number {
  switch (sort) {
    case 'most-liked':
      return post.likes;
    case 'most-commented':
      return post.comments;
    case 'trending':
      return post.trendingScore;
    case 'latest':
    default:
      return new Date(post.createdAt).getTime();
  }
}
