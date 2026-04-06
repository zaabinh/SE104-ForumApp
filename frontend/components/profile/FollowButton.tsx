'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { followUser, unfollowUser } from '@/lib/profileApi';

type FollowButtonProps = {
  userId?: string;
  isFollowing: boolean;
  onToggle: (nextFollowing: boolean) => void;
};

export default function FollowButton({ userId, isFollowing, onToggle }: FollowButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) {
      return;
    }

    if (!userId) {
      onToggle(!isFollowing);
      return;
    }

    setLoading(true);
    try {
      const response = isFollowing ? await unfollowUser(userId) : await followUser(userId);
      onToggle(response.following);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant={isFollowing ? 'outline' : 'primary'} onClick={handleToggle} disabled={loading}>
      {loading ? 'Saving...' : isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}
