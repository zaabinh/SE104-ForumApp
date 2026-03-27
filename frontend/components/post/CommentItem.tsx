'use client';

import { useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import { formatRelativeTime } from '@/lib/mockData';
import { useForum } from '@/lib/forumStore';
import { CommentNode } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';

type CommentItemProps = {
  comment: CommentNode;
  depth?: number;
  postId: number;
};

export default function CommentItem({ comment, depth = 0, postId }: CommentItemProps) {
  const { currentUser, addComment, toggleCommentLike } = useForum();
  const { pushToast } = useToast();
  const [replyValue, setReplyValue] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const liked = currentUser.likedCommentIds.includes(comment.id);

  return (
    <div className={`${depth > 0 ? 'ml-5 border-l border-slate-200 pl-5' : ''}`}>
      <div className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white p-4">
        <Avatar src={comment.author.avatar} alt={comment.author.name} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">{comment.author.name}</p>
            <p className="text-xs text-slate-500">{comment.author.username}</p>
            <span className="text-xs text-slate-400">/</span>
            <p className="text-xs text-slate-500">{formatRelativeTime(comment.createdAt)}</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{comment.content}</p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const next = toggleCommentLike(comment.id);
                pushToast(next ? 'Comment liked' : 'Comment like removed');
              }}
              className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                liked ? 'border-forum-primary bg-forum-primary/10 text-forum-primary' : 'border-slate-200 text-slate-600 hover:border-forum-primary hover:text-forum-primary'
              }`}
            >
              Like {comment.likes}
            </button>
            <button
              type="button"
              onClick={() => setIsReplying((prev) => !prev)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all duration-200 hover:border-forum-primary hover:text-forum-primary"
            >
              Reply
            </button>
          </div>
          {isReplying ? (
            <div className="mt-3 space-y-2">
              <textarea
                value={replyValue}
                onChange={(event) => setReplyValue(event.target.value)}
                placeholder="Write a reply..."
                className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-forum-primary"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!replyValue.trim()) return;
                    addComment(postId, replyValue.trim(), comment.id);
                    pushToast('Reply posted');
                    setReplyValue('');
                    setIsReplying(false);
                  }}
                  className="rounded-2xl bg-forum-primary px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-forum-secondary"
                >
                  Reply
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyValue('');
                    setIsReplying(false);
                  }}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:text-slate-900"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {comment.replies.length ? (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} postId={postId} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
