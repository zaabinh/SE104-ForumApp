'use client';

import { useState } from 'react';
import CommentItem from '@/components/post/CommentItem';
import { useForum } from '@/lib/forumStore';
import { useToast } from '@/components/ui/Toast';

type CommentSectionProps = {
  postId: number;
};

export default function CommentSection({ postId }: CommentSectionProps) {
  const { addComment, getCommentsForPost } = useForum();
  const { pushToast } = useToast();
  const [value, setValue] = useState('');
  const comments = getCommentsForPost(postId);
  const countNodes = (nodes: typeof comments): number => nodes.reduce((count, node) => count + 1 + countNodes(node.replies), 0);
  const totalComments = countNodes(comments);

  return (
    <section className="card-surface rounded-3xl p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-slate-900">Comments</h3>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500">{totalComments} total</span>
      </div>

      <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Write a thoughtful comment..."
          className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-forum-primary"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (!value.trim()) return;
              addComment(postId, value.trim());
              pushToast('Comment posted');
              setValue('');
            }}
            className="rounded-2xl bg-forum-primary px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-forum-secondary"
          >
            Post
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {comments.length ? comments.map((comment) => <CommentItem key={comment.id} comment={comment} postId={postId} />) : <p className="text-sm text-slate-500">No comments yet. Start the discussion.</p>}
      </div>
    </section>
  );
}
