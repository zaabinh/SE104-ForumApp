'use client';

import { useMemo } from 'react';
import Dropdown from '@/components/ui/Dropdown';
import { useI18n } from '@/lib/i18n';
import { SortOption } from '@/lib/types';

type FeedSortProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
};

export default function FeedSort({ value, onChange }: FeedSortProps) {
  const { t } = useI18n();
  const options: Array<{ value: SortOption; label: string }> = useMemo(
    () => [
      { value: 'latest', label: t('feedSortLatest') },
      { value: 'trending', label: t('feedSortTrending') },
      { value: 'most-liked', label: t('feedSortMostLiked') },
      { value: 'most-commented', label: t('feedSortMostCommented') },
    ],
    [t]
  );
  return <Dropdown label={t('feedSort')} options={options} value={value} onChange={onChange} />;
}
