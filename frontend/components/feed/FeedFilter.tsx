'use client';

import Tag from '@/components/ui/Tag';
import { useI18n } from '@/lib/i18n';

type FeedFilterProps = {
  tags: string[];
  activeTag: string | null;
  onSelectTag: (tag: string) => void;
  onClear: () => void;
};

export default function FeedFilter({ tags, activeTag, onSelectTag, onClear }: FeedFilterProps) {
  const { t } = useI18n();
  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">{t('feedFilterTitle')}</h3>
          <p className="text-xs text-ink-500">{t('feedFilterDesc')}</p>
        </div>
        {activeTag ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-uit-100 bg-white/70 px-3 py-1 text-xs font-semibold text-ink-600 transition-all duration-200 hover:border-uit-300 hover:text-uit-700"
          >
            {t('feedFilterClear')}
          </button>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Tag key={tag} label={tag} active={tag === activeTag} onClick={() => onSelectTag(tag)} />
        ))}
      </div>
    </div>
  );
}
