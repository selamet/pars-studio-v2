'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { fetchMe, logout as apiLogout, type User } from '@/lib/api/auth';

type Status = 'loading' | 'anonymous' | 'authenticated';

type AuthContextValue = {
  status: Status;
  user: User | null;
  /** Re-reads /api/v1/me (call after login, verification, profile edits). */
  refresh: () => Promise<User | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<User | null>(null);

  const refresh = useCallback(async () => {
    try {
      const me = await fetchMe();
      setUser(me);
      setStatus(me ? 'authenticated' : 'anonymous');
      return me;
    } catch {
      setUser(null);
      setStatus('anonymous');
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ status, user, refresh, logout }),
    [status, user, refresh, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
}
