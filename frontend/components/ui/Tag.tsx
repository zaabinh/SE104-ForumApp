'use client';

import { memo } from 'react';

type TagProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

function Tag({ label, active = false, onClick }: TagProps) {
  const className = `rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
    active
      ? 'bg-gradient-to-r from-uit-600 to-uit-500 text-white shadow-sm'
      : 'border border-uit-100 bg-uit-50/80 text-ink-600 hover:border-uit-300 hover:bg-uit-100 hover:text-uit-700'
  }`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        #{label}
      </button>
    );
  }

  return <span className={className}>#{label}</span>;
}

export default memo(Tag);
