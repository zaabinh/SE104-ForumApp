'use client';

import Dropdown from '@/components/ui/Dropdown';
import { SortOption } from '@/lib/types';

type FeedSortProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
};

const options: Array<{ value: SortOption; label: string }> = [
  { value: 'latest', label: 'Latest' },
  { value: 'trending', label: 'Trending' },
  { value: 'most-liked', label: 'Most liked' },
  { value: 'most-commented', label: 'Most commented' },
];

export default function FeedSort({ value, onChange }: FeedSortProps) {
  return <Dropdown label="Sort" options={options} value={value} onChange={onChange} />;
}
