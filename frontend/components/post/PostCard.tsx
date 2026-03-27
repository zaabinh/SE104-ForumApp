'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import PostActions from '@/components/post/PostActions';
import Tag from '@/components/ui/Tag';
import { formatRelativeTime } from '@/lib/mockData';
import { useForum } from '@/lib/forumStore';
import { Post } from '@/lib/types';

type PostCardProps = {
  post: Post;
  activeTag?: string | null;
  onSelectTag?: (tag: string) => void;
};

export default function PostCard({ post, activeTag, onSelectTag }: PostCardProps) {
  const router = useRouter();
  const { getUserById } = useForum();
  const author = getUserById(post.authorId);

  if (!author) {
    return null;
  }

  return (
    <article
      className="card-surface cursor-pointer select-none p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
      onClick={() => router.push(`/post/${post.id}`)}
    >
      <header className="mb-3 flex items-center gap-3">
        <Image src={author.avatar} alt={author.name} width={40} height={40} className="rounded-full object-cover" />
        <div>
          <p className="text-sm font-semibold text-slate-900">{author.name}</p>
          <p className="text-xs text-slate-500">
            {author.username} / {formatRelativeTime(post.createdAt)}
          </p>
        </div>
      </header>

      <h2 className="text-xl font-bold text-slate-900 transition-all duration-200 hover:text-forum-primary">{post.title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{post.excerpt}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <Tag key={`${post.id}-${tag}`} label={tag} active={activeTag === tag} onClick={onSelectTag ? () => onSelectTag(tag) : undefined} />
        ))}
      </div>

      <div className="relative mt-4 h-56 overflow-hidden rounded-2xl">
        <Image src={post.image} alt={post.title} fill className="object-cover" />
      </div>

      <PostActions post={post} compact onCommentClick={() => router.push(`/post/${post.id}`)} />
    </article>
  );
}
