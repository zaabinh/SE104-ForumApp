'use client';

import Tabs from '@/components/ui/Tabs';

export type ProfileTab = 'posts' | 'comments' | 'bookmarks' | 'likes';

type ProfileTabsProps = {
  value: ProfileTab;
  onChange: (value: ProfileTab) => void;
};

const items: Array<{ value: ProfileTab; label: string }> = [
  { value: 'posts', label: 'Posts' },
  { value: 'comments', label: 'Comments' },
  { value: 'bookmarks', label: 'Bookmarks' },
  { value: 'likes', label: 'Likes' },
];

export default function ProfileTabs({ value, onChange }: ProfileTabsProps) {
  return <Tabs items={items} value={value} onChange={onChange} />;
}
