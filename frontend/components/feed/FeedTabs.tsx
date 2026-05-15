'use client';

import { useMemo } from 'react';
import Tabs from '@/components/ui/Tabs';
import { useI18n } from '@/lib/i18n';
import { FeedMode } from '@/lib/types';

type FeedTabsProps = {
  value: FeedMode;
  onChange: (value: FeedMode) => void;
};

export default function FeedTabs({ value, onChange }: FeedTabsProps) {
  const { t } = useI18n();
  const items: Array<{ value: FeedMode; label: string }> = useMemo(
    () => [
      { value: 'for-you', label: t('feedTabForYou') },
      { value: 'following', label: t('feedTabFollowing') },
      { value: 'trending', label: t('feedTabTrending') },
    ],
    [t]
  );
  return <Tabs items={items} value={value} onChange={onChange} />;
}
