type TagProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export default function Tag({ label, active = false, onClick }: TagProps) {
  const className = `rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
    active ? 'bg-forum-primary text-white' : 'bg-forum-accent/20 text-slate-700 hover:bg-forum-primary/10 hover:text-forum-primary'
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
