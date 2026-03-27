'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { BiDownvote, BiUpvote } from 'react-icons/bi';
import { BsBookmark } from 'react-icons/bs';
import { FaRegComment } from 'react-icons/fa';
import { FiShare2 } from 'react-icons/fi';
import CommentSection from '@/components/post/CommentSection';
import Avatar from '@/components/ui/Avatar';
import { getAuthorProfile } from '@/lib/mockData';
import { Post } from '@/lib/types';

type PostDetailProps = {
  post: Post;
};

export default function PostDetail({ post }: PostDetailProps) {
  const author = getAuthorProfile(post.author);
  const [vote, setVote] = useState<-1 | 0 | 1>(0);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [commentCount, setCommentCount] = useState(post.comments);

  const articleParagraphs = useMemo(
    () => [
      post.content,
      'What matters most here is the workflow behind the result. Good developer writing does not just present the finished architecture, it explains the decisions, tradeoffs, and moments where the plan changed under pressure.',
      'The strongest forum posts mix practical implementation details with enough context that another engineer can adapt the idea to their own stack. That makes the post useful beyond the exact code shown here.'
    ],
    [post.content]
  );

  const codeSample = `export async function shipFeature() {\n  const result = await validateIdea();\n\n  if (!result.ok) {\n    throw new Error('Fix the assumptions before scaling.');\n  }\n\n  return deploy({ confidence: 'high', scope: 'incremental' });\n}`;

  const handleVote = (nextVote: -1 | 1) => {
    const updatedVote = vote === nextVote ? 0 : nextVote;
    const voteDelta = updatedVote - vote;

    setVote(updatedVote);
    setLikes((prev) => prev + voteDelta);
  };

  return (
    <div className="mx-auto max-w-[700px] space-y-6">
      <article className="rounded-[28px] border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <Avatar src={author.avatar} alt={author.name} size={52} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{author.name}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>{author.username}</span>
              <span>/</span>
              <span>{post.time}</span>
            </div>
          </div>
        </div>

        <h1 className="mt-6 text-3xl font-bold leading-tight text-white md:text-4xl">{post.title}</h1>

        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-forum-primary/30 bg-forum-primary/10 px-3 py-1 text-xs font-medium text-forum-accent">
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-6 space-y-5 text-base leading-8 text-slate-300">
          {articleParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="relative mt-6 h-72 overflow-hidden rounded-[24px] border border-slate-800">
          <Image src={post.image} alt={post.title} fill className="object-cover" />
        </div>

        <pre className="mt-6 overflow-x-auto rounded-[24px] border border-slate-800 bg-slate-950 p-5 text-sm leading-7 text-slate-200">
          <code>{codeSample}</code>
        </pre>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-800 pt-5">
          <button
            type="button"
            onClick={() => handleVote(1)}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition-all duration-200 ${
              vote === 1 ? 'border-forum-primary bg-forum-primary/10 text-forum-accent' : 'border-slate-800 text-slate-300 hover:border-forum-primary hover:text-forum-accent'
            }`}
          >
            <BiUpvote className="h-5 w-5" />
            {likes}
          </button>
          <button
            type="button"
            onClick={() => handleVote(-1)}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition-all duration-200 ${
              vote === -1 ? 'border-rose-500/50 bg-rose-500/10 text-rose-300' : 'border-slate-800 text-slate-300 hover:border-rose-500/60 hover:text-rose-300'
            }`}
          >
            <BiDownvote className="h-5 w-5" />
            Dislike
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-forum-primary hover:text-forum-accent"
          >
            <FaRegComment className="h-4 w-4" />
            {commentCount}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-forum-primary hover:text-forum-accent"
          >
            <FiShare2 className="h-4 w-4" />
            Share
          </button>
          <button
            type="button"
            onClick={() => setSaved((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition-all duration-200 ${
              saved ? 'border-forum-primary bg-forum-primary/10 text-forum-accent' : 'border-slate-800 text-slate-300 hover:border-forum-primary hover:text-forum-accent'
            }`}
          >
            <BsBookmark className="h-4 w-4" />
            Save
          </button>
        </div>
      </article>

      <CommentSection postId={post.id} onCommentCountChange={setCommentCount} />
    </div>
  );
}

