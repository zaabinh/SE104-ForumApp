'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { BiUpvote } from 'react-icons/bi';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { FaRegComment } from 'react-icons/fa';
import { FiFlag, FiShare2 } from 'react-icons/fi';
import ReportDialog from '@/components/report/ReportDialog';
import { useForum } from '@/lib/forumStore';
import { reportPost } from '@/lib/forumApi';
import { Post } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';
import { useState } from 'react';

type PostActionsProps = {
  post: Post;
  compact?: boolean;
  onCommentClick?: () => void;
  liked: boolean;
  bookmarked: boolean;
  onLikeToggle: (postId: number) => boolean;
  onBookmarkToggle: (postId: number) => boolean;
};

function PostActionsBase({ post, compact = false, onCommentClick, liked, bookmarked, onLikeToggle, onBookmarkToggle }: PostActionsProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportError, setReportError] = useState('');
  const baseClass = compact ? 'rounded-2xl px-3 py-2 text-sm' : 'rounded-2xl px-4 py-2.5 text-sm';

  const handleLike = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const next = onLikeToggle(post.id);
    pushToast(next ? 'Post liked' : 'Post like removed');
  };

  const handleBookmark = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const next = onBookmarkToggle(post.id);
    pushToast(next ? 'Saved to bookmarks' : 'Removed from bookmarks');
  };

  const handleShare = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    router.push(`/post/${post.id}/share`);
    pushToast('Open share composer');
  };

  return (
    <div className="mt-4 flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={handleLike}
        className={`inline-flex items-center gap-2 border transition-all duration-200 ${baseClass} ${
          liked ? 'border-uit-300 bg-uit-50 text-uit-700' : 'border-white/70 bg-white/80 text-ink-600 hover:border-uit-300 hover:text-uit-700'
        }`}
      >
        <BiUpvote className="h-4 w-4" />
        {post.likes}
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onCommentClick?.();
        }}
        className={`inline-flex items-center gap-2 border border-white/70 bg-white/80 text-ink-600 transition-all duration-200 hover:border-uit-300 hover:text-uit-700 ${baseClass}`}
      >
        <FaRegComment className="h-4 w-4" />
        {post.comments}
      </button>
      <button
        type="button"
        onClick={handleBookmark}
        className={`inline-flex items-center gap-2 border transition-all duration-200 ${baseClass} ${
          bookmarked ? 'border-uit-300 bg-uit-50 text-uit-700' : 'border-white/70 bg-white/80 text-ink-600 hover:border-uit-300 hover:text-uit-700'
        }`}
      >
        {bookmarked ? <BsBookmarkFill className="h-4 w-4" /> : <BsBookmark className="h-4 w-4" />}
        Save
      </button>
      <button
        type="button"
        onClick={handleShare}
        className={`inline-flex items-center gap-2 border border-white/70 bg-white/80 text-ink-600 transition-all duration-200 hover:border-uit-300 hover:text-uit-700 ${baseClass}`}
      >
        <FiShare2 className="h-4 w-4" />
        Share
      </button>
      {!compact ? (
        <>
          <button
            type="button"
            onClick={() => {
              setReportError('');
              setIsReportOpen(true);
            }}
            className={`inline-flex items-center gap-2 border border-white/70 bg-white/80 text-ink-600 transition-all duration-200 hover:border-rose-300 hover:text-rose-600 ${baseClass}`}
          >
            <FiFlag className="h-4 w-4" />
            Report
          </button>
          <ReportDialog
            targetLabel="bài viết"
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
                await reportPost(post.id, payload);
                setIsReportOpen(false);
                pushToast('Đã gửi báo cáo bài viết');
              } catch (error) {
                const detail =
                  typeof error === 'object' &&
                  error !== null &&
                  'response' in error &&
                  typeof error.response === 'object' &&
                  error.response !== null &&
                  'status' in error.response &&
                  error.response.status === 409
                    ? 'Bạn đã báo cáo bài viết này trước đó.'
                    : 'Không thể gửi báo cáo. Vui lòng thử lại.';
                setReportError(detail);
              } finally {
                setIsReporting(false);
              }
            }}
          />
        </>
      ) : null}
    </div>
  );
}

const MemoPostActionsBase = memo(PostActionsBase);

type ConnectedPostActionsProps = Omit<PostActionsProps, 'liked' | 'bookmarked' | 'onLikeToggle' | 'onBookmarkToggle'>;

export function PurePostActions(props: PostActionsProps) {
  return <MemoPostActionsBase {...props} />;
}

export default function PostActions(props: ConnectedPostActionsProps) {
  const { currentUser, toggleBookmark, togglePostLike } = useForum();

  return (
    <MemoPostActionsBase
      {...props}
      liked={currentUser.likedPostIds.includes(props.post.id)}
      bookmarked={currentUser.bookmarkedPostIds.includes(props.post.id)}
      onLikeToggle={togglePostLike}
      onBookmarkToggle={toggleBookmark}
    />
  );
}

