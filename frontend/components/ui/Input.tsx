import { InputHTMLAttributes, forwardRef } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, id, className = '', ...props }, ref) {
  return (
    <label className="block space-y-2" htmlFor={id}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        ref={ref}
        id={id}
        className={`w-full rounded-xl border px-3 py-2 outline-none transition focus:border-forum-primary ${
          error ? 'border-red-400' : 'border-slate-300'
        } ${className}`}
        {...props}
      />
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </label>
  );
});

export default Input;
