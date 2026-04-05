type DropdownOption<T extends string> = {
  value: T;
  label: string;
};

type DropdownProps<T extends string> = {
  label?: string;
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export default function Dropdown<T extends string>({ label, options, value, onChange }: DropdownProps<T>) {
  return (
    <label className="inline-flex items-center gap-3 rounded-[22px] border border-white/60 bg-white/75 px-4 py-3 shadow-card backdrop-blur-xl">
      {label ? <span className="text-sm font-medium text-ink-500">{label}</span> : null}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="bg-transparent text-sm font-medium text-ink-700 outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

