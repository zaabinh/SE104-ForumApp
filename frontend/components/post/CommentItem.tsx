'use client';

import { useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import ReportDialog from '@/components/report/ReportDialog';
import { formatRelativeTime } from '@/lib/mockData';
import { reportComment } from '@/lib/forumApi';
import { CommentNode, UserProfile } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';

type CommentItemProps = {
  comment: CommentNode;
  depth?: number;
  postId: number;
  currentUser: UserProfile | null;
  onReply: (parentId: number, content: string) => Promise<void>;
};

export default function CommentItem({ comment, depth = 0, postId, currentUser, onReply }: CommentItemProps) {
  const { pushToast } = useToast();
  const [replyValue, setReplyValue] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportError, setReportError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(comment.likes);
  void currentUser;

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
                setLiked((prev) => !prev);
                setLikes((prev) => (liked ? Math.max(0, prev - 1) : prev + 1));
                pushToast(!liked ? 'Comment liked' : 'Comment like removed');
              }}
              className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                liked ? 'border-forum-primary bg-forum-primary/10 text-forum-primary' : 'border-slate-200 text-slate-600 hover:border-forum-primary hover:text-forum-primary'
              }`}
            >
              Like {likes}
            </button>
            <button
              type="button"
              onClick={() => setIsReplying((prev) => !prev)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all duration-200 hover:border-forum-primary hover:text-forum-primary"
            >
              Reply
            </button>
            <button
              type="button"
              onClick={() => {
                setReportError('');
                setIsReportOpen(true);
              }}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all duration-200 hover:border-rose-300 hover:text-rose-600"
            >
              Report
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
                  onClick={async () => {
                    if (!replyValue.trim()) return;
                    await onReply(comment.id, replyValue.trim());
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
      <ReportDialog
        targetLabel="bình luận"
        open={isReportOpen}
        loading={isReporting}
        error={reportError}
        onClose={() => {
          if (isReporting) return;
          setIsReportOpen(false);
          setReportError('');
        }}
        onSubmit={async (payload) => {
          setIsReporting(true);
          setReportError('');
          try {
            await reportComment(postId, comment.id, payload);
            setIsReportOpen(false);
            pushToast('Đã gửi báo cáo bình luận');
          } catch (error) {
            const detail =
              typeof error === 'object' &&
              error !== null &&
              'response' in error &&
              typeof error.response === 'object' &&
              error.response !== null &&
              'status' in error.response &&
              error.response.status === 409
                ? 'Bạn đã báo cáo bình luận này trước đó.'
                : 'Không thể gửi báo cáo. Vui lòng thử lại.';
            setReportError(detail);
          } finally {
            setIsReporting(false);
          }
        }}
      />
      {comment.replies.length ? (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} postId={postId} currentUser={currentUser} onReply={onReply} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
