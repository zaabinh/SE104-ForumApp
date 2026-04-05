'use client';

import Tabs from '@/components/ui/Tabs';

export type ProfileTab = 'posts' | 'about' | 'activity' | 'bookmarks';

type ProfileTabsProps = {
  value: ProfileTab;
  onChange: (value: ProfileTab) => void;
};

const items: Array<{ value: ProfileTab; label: string }> = [
  { value: 'posts', label: 'Posts' },
  { value: 'about', label: 'About' },
  { value: 'activity', label: 'Activity' },
  { value: 'bookmarks', label: 'Saved posts' },
];

export default function ProfileTabs({ value, onChange }: ProfileTabsProps) {
  return <Tabs items={items} value={value} onChange={onChange} />;
}
