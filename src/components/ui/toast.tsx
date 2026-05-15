'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'error' | 'success';
type Toast = { id: number; message: string; variant: Variant };

const ToastCtx = React.createContext<{
  toast: (message: string, variant?: Variant) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback(
    (message: string, variant: Variant = 'default') => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, variant }]);
      setTimeout(
        () => setToasts((t) => t.filter((x) => x.id !== id)),
        4500
      );
    },
    []
  );

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[95] flex max-w-sm flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto border bg-bg-soft px-5 py-4 font-sans text-[13px] leading-relaxed text-fg shadow-2xl',
              t.variant === 'error' && 'border-accent/50',
              t.variant === 'success' && 'border-fg/30',
              t.variant === 'default' && 'border-rule'
            )}
          >
            <span
              className={cn(
                'mr-2 font-mono text-[10px] uppercase tracking-meta',
                t.variant === 'error' ? 'text-accent' : 'text-fg-dim'
              )}
            >
              {t.variant === 'error'
                ? '✕'
                : t.variant === 'success'
                  ? '✓'
                  : '·'}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) {
    // No provider mounted — degrade gracefully instead of crashing.
    return { toast: (m: string) => console.warn('[toast]', m) };
  }
  return ctx;
}
