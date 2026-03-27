'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import PostActions from '@/components/post/PostActions';
import CommentSection from '@/components/post/CommentSection';
import Avatar from '@/components/ui/Avatar';
import { formatRelativeTime } from '@/lib/mockData';
import { useForum } from '@/lib/forumStore';
import { Post } from '@/lib/types';

type PostDetailProps = {
  post: Post;
};

export default function PostDetail({ post }: PostDetailProps) {
  const router = useRouter();
  const { currentUser, getUserById } = useForum();
  const author = getUserById(post.authorId);

  if (!author) {
    return null;
  }

  return (
    <div className="mx-auto max-w-[760px] space-y-6">
      <article className="card-surface rounded-[28px] p-6">
        <div className="flex items-center gap-3">
          <Avatar src={author.avatar} alt={author.name} size={52} />
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => router.push(`/profile/${author.id}`)}
              className="truncate text-left text-sm font-semibold text-slate-900 transition-all duration-200 hover:text-forum-primary"
            >
              {author.name}
            </button>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{author.username}</span>
              <span>/</span>
              <span>{formatRelativeTime(post.createdAt)}</span>
              <span>/</span>
              <span>{post.views} views</span>
            </div>
          </div>
        </div>

        <h1 className="mt-6 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">{post.title}</h1>

        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-forum-primary/20 bg-forum-primary/10 px-3 py-1 text-xs font-medium text-forum-primary">
              #{tag}
            </span>
          ))}
        </div>

        <div className="relative mt-6 h-80 overflow-hidden rounded-[24px] border border-slate-200">
          <Image src={post.image} alt={post.title} fill className="object-cover" />
        </div>

        <div className="mt-6 space-y-5 text-base leading-8 text-slate-700">
          {post.content.split('\n\n').map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
          {post.authorId === currentUser.id ? (
            <button
              type="button"
              onClick={() => router.push(`/edit/${post.id}`)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-forum-primary hover:text-forum-primary"
            >
              Edit post
            </button>
          ) : (
            <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Community discussion</span>
          )}
          <PostActions post={post} onCommentClick={() => document.getElementById(`comments-${post.id}`)?.scrollIntoView({ behavior: 'smooth' })} />
        </div>
      </article>

      <div id={`comments-${post.id}`}>
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}
