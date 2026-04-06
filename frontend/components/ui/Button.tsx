import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
};

export default function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60';
  const variants = {
    primary:
      'border border-uit-500/80 bg-gradient-to-r from-uit-600 via-uit-500 to-ai-cyan text-white shadow-gradient hover:brightness-105',
    outline: 'border border-uit-200 bg-white/80 text-ink-800 hover:border-uit-400 hover:bg-uit-50',
    ghost: 'bg-ink-100/80 text-ink-700 hover:bg-uit-50 hover:text-uit-700'
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
