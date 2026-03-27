'use client';

import Button from '@/components/ui/Button';

type FollowButtonProps = {
  isFollowing: boolean;
  onToggle: () => void;
};

export default function FollowButton({ isFollowing, onToggle }: FollowButtonProps) {
  return (
    <Button variant={isFollowing ? 'outline' : 'primary'} onClick={onToggle}>
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}
