'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type CartLine = {
  /** `${type}:${id}` */
  key: string;
  type: 'beat_license' | 'service';
  id: number;
  title: string;
  subtitle?: string;
  price: string;
  href: string;
  coverUrl?: string | null;
  /** For beat licenses: the beat slug, so one license per beat is enforced. */
  beatSlug?: string;
  unavailable?: boolean;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  hydrated: boolean;
  add: (line: Omit<CartLine, 'key'>) => void;
  remove: (key: string) => void;
  markUnavailable: (type: string, id: number) => void;
  clear: () => void;
  has: (type: CartLine['type'], id: number) => boolean;
};

const STORAGE_KEY = 'pars.cart.v1';
const CartContext = createContext<CartContextValue | null>(null);

function load(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

/** Client-side cart persisted in localStorage; the server re-validates everything at checkout. */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(load());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setLines(load());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage may be unavailable; the cart then lives in memory only */
    }
  }, [lines, hydrated]);

  const add = useCallback((line: Omit<CartLine, 'key'>) => {
    const key = `${line.type}:${line.id}`;
    setLines((current) => {
      const kept = current.filter(
        (l) =>
          l.key !== key &&
          // Only one license per beat: a new tier replaces the previous one.
          !(line.type === 'beat_license' && l.type === 'beat_license' && l.beatSlug === line.beatSlug)
      );
      return [...kept, { ...line, key, unavailable: false }];
    });
  }, []);

  const remove = useCallback((key: string) => {
    setLines((current) => current.filter((l) => l.key !== key));
  }, []);

  const markUnavailable = useCallback((type: string, id: number) => {
    setLines((current) =>
      current.map((l) => (l.type === type && l.id === id ? { ...l, unavailable: true } : l))
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const has = useCallback(
    (type: CartLine['type'], id: number) => lines.some((l) => l.type === type && l.id === id),
    [lines]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.length,
      total: lines.reduce((sum, l) => sum + Number(l.price), 0),
      hydrated,
      add,
      remove,
      markUnavailable,
      clear,
      has,
    }),
    [lines, hydrated, add, remove, markUnavailable, clear, has]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>.');
  return ctx;
}
