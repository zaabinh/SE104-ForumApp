type TabsProps<T extends string> = {
  items: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
};

export default function Tabs<T extends string>({ items, value, onChange }: TabsProps<T>) {
  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
            item.value === value ? 'bg-forum-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
