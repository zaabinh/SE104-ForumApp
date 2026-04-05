type TabsProps<T extends string> = {
  items: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
};

export default function Tabs<T extends string>({ items, value, onChange }: TabsProps<T>) {
  return (
    <div className="inline-flex rounded-[22px] border border-white/60 bg-white/70 p-1.5 shadow-card backdrop-blur-xl">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
            item.value === value
              ? 'bg-gradient-to-r from-uit-600 to-uit-500 text-white shadow-gradient'
              : 'text-ink-600 hover:bg-uit-50 hover:text-uit-700'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
