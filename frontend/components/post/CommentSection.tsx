'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import CommentItem from '@/components/post/CommentItem';
import { useToast } from '@/components/ui/Toast';
import { createComment, getComments } from '@/lib/forumApi';
import { CommentNode, UserProfile } from '@/lib/types';

type CommentSectionProps = {
  postId: number;
  currentUser: UserProfile | null;
};

function mapCommentNode(comment: any): CommentNode {
  return {
    id: comment.id,
    postId: comment.post_id,
    parentId: comment.parent_id,
    authorId: comment.user_id,
    content: comment.content,
    createdAt: comment.created_at,
    likes: 0,
    author: {
      id: comment.author.id,
      name: comment.author.full_name || comment.author.username,
      username: comment.author.username,
      avatar: comment.author.avatar_url || '/images/uit.png',
      bio: comment.author.bio || '',
      role: comment.author.role || 'Student',
      followers: 0,
      following: 0,
      followingIds: [],
      likedPostIds: [],
      bookmarkedPostIds: [],
      likedCommentIds: [],
    },
    replies: (comment.replies || []).map(mapCommentNode),
  };
}

export default function CommentSection({ postId, currentUser }: CommentSectionProps) {
  const { pushToast } = useToast();
  const [value, setValue] = useState('');
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getComments(postId);
      setComments(data.map(mapCommentNode));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const countNodes = useCallback((nodes: CommentNode[]): number => nodes.reduce((count, node) => count + 1 + countNodes(node.replies), 0), []);
  const totalComments = useMemo(() => countNodes(comments), [comments, countNodes]);

  const handleReply = useCallback(
    async (parentId: number, content: string) => {
      await createComment(postId, { content, parent_id: parentId });
      await loadComments();
    },
    [loadComments, postId]
  );

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
            onClick={async () => {
              if (!value.trim()) return;
              await createComment(postId, { content: value.trim() });
              pushToast('Comment posted');
              setValue('');
              await loadComments();
            }}
            className="rounded-2xl bg-forum-primary px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-forum-secondary"
          >
            Post
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {loading ? (
          <p className="text-sm text-slate-500">Loading comments...</p>
        ) : comments.length ? (
          comments.map((comment) => <CommentItem key={comment.id} comment={comment} postId={postId} currentUser={currentUser} onReply={handleReply} />)
        ) : (
          <p className="text-sm text-slate-500">No comments yet. Start the discussion.</p>
        )}
      </div>
    </section>
  );
}
