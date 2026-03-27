'use client';

type FeedFilterProps = {
  tags: string[];
  activeTag: string | null;
  onSelectTag: (tag: string) => void;
  onClear: () => void;
};

export default function FeedFilter({ tags, activeTag, onSelectTag, onClear }: FeedFilterProps) {
  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Filter by tag</h3>
          <p className="text-xs text-slate-500">Pick a topic to narrow the feed.</p>
        </div>
        {activeTag ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-forum-primary hover:text-forum-primary"
          >
            Clear filter
          </button>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => {
          const active = tag === activeTag;

          return (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectTag(tag)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                active ? 'bg-forum-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-forum-primary/10 hover:text-forum-primary'
              }`}
            >
              #{tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
