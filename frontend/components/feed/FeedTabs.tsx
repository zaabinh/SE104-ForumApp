'use client';

import Tabs from '@/components/ui/Tabs';
import { FeedMode } from '@/lib/types';

type FeedTabsProps = {
  value: FeedMode;
  onChange: (value: FeedMode) => void;
};

const items: Array<{ value: FeedMode; label: string }> = [
  { value: 'for-you', label: 'For You' },
  { value: 'following', label: 'Following' },
  { value: 'trending', label: 'Trending' },
];

export default function FeedTabs({ value, onChange }: FeedTabsProps) {
  return <Tabs items={items} value={value} onChange={onChange} />;
}
