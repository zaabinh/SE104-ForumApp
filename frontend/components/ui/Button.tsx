import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
};

export default function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition duration-200';
  const variants = {
    primary: 'bg-forum-primary text-white hover:bg-forum-secondary',
    outline: 'border border-slate-300 bg-white text-forum-text hover:border-forum-primary hover:text-forum-primary',
    ghost: 'bg-slate-100 text-forum-text hover:bg-slate-200'
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
