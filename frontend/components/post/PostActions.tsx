'use client';

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
};

export default function PostActions({ post, compact = false, onCommentClick }: PostActionsProps) {
  const { currentUser, toggleBookmark, togglePostLike } = useForum();
  const { pushToast } = useToast();
  const liked = currentUser.likedPostIds.includes(post.id);
  const bookmarked = currentUser.bookmarkedPostIds.includes(post.id);
  const baseClass = compact ? 'rounded-xl px-3 py-2 text-sm' : 'rounded-2xl px-4 py-2 text-sm';

  const handleLike = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const next = togglePostLike(post.id);
    pushToast(next ? 'Post liked' : 'Post like removed');
  };

  const handleBookmark = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const next = toggleBookmark(post.id);
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
          liked ? 'border-forum-primary bg-forum-primary/10 text-forum-primary' : 'border-slate-200 text-slate-600 hover:border-forum-primary hover:text-forum-primary'
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
        className={`inline-flex items-center gap-2 border border-slate-200 text-slate-600 transition-all duration-200 hover:border-forum-primary hover:text-forum-primary ${baseClass}`}
      >
        <FaRegComment className="h-4 w-4" />
        {post.comments}
      </button>
      <button
        type="button"
        onClick={handleBookmark}
        className={`inline-flex items-center gap-2 border transition-all duration-200 ${baseClass} ${
          bookmarked ? 'border-forum-primary bg-forum-primary/10 text-forum-primary' : 'border-slate-200 text-slate-600 hover:border-forum-primary hover:text-forum-primary'
        }`}
      >
        {bookmarked ? <BsBookmarkFill className="h-4 w-4" /> : <BsBookmark className="h-4 w-4" />}
        Save
      </button>
      <button
        type="button"
        onClick={handleShare}
        className={`inline-flex items-center gap-2 border border-slate-200 text-slate-600 transition-all duration-200 hover:border-forum-primary hover:text-forum-primary ${baseClass}`}
      >
        <FiShare2 className="h-4 w-4" />
        Share
      </button>
    </div>
  );
}
