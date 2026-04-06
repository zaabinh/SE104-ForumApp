'use client';

import { memo } from 'react';
import { BiUpvote } from 'react-icons/bi';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { FaRegComment } from 'react-icons/fa';
import { FiShare2 } from 'react-icons/fi';
import { useForum } from '@/lib/forumStore';
import { Post } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';

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
  const { pushToast } = useToast();
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
    const sharePath = `/post/${post.id}`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${window.location.origin}${sharePath}`);
      }
      pushToast('Share link copied');
    } catch {
      pushToast('Share link ready');
    }
  };

  return (
    <div className="mt-4 flex flex-wrap gap-2">
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

