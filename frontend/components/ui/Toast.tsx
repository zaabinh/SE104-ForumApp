'use client';

import { createContext, useContext, useMemo, useState } from 'react';

type ToastEntry = {
  id: number;
  message: string;
};

type ToastContextValue = {
  pushToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const value = useMemo(
    () => ({
      pushToast: (message: string) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message }]);
        window.setTimeout(() => {
          setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 1800);
      },
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-full max-w-sm flex-col gap-2 px-4">
        {toasts.map((toast) => (
          <div key={toast.id} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return context;
}
