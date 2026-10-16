import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { setAuthToken, setUnauthorizedHandler } from '@/services/api';
import * as authService from '@/services/auth';
import type { AuthSession } from '@/types';

const SESSION_KEY = 'expense_tracker_session';

interface AuthContextValue {
  session: AuthSession | null;
  isRestoring: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const persist = useCallback(async (next: AuthSession | null) => {
    setAuthToken(next?.token ?? null);
    setSession(next);
    try {
      if (next) {
        await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(next));
      } else {
        await SecureStore.deleteItemAsync(SESSION_KEY);
      }
    } catch {
      // Secure storage is best-effort; the in-memory session still works.
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(SESSION_KEY);
        if (raw && active) {
          const parsed = JSON.parse(raw) as AuthSession;
          setAuthToken(parsed.token);
          setSession(parsed);
        }
      } catch {
        // Ignore corrupted session payloads.
      } finally {
        if (active) setIsRestoring(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void persist(null);
    });
    return () => setUnauthorizedHandler(null);
  }, [persist]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const next = await authService.login(email, password);
      await persist(next);
    },
    [persist],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const next = await authService.register(name, email, password);
      await persist(next);
    },
    [persist],
  );

  const signOut = useCallback(async () => {
    await persist(null);
  }, [persist]);

  const value = useMemo(
    () => ({ session, isRestoring, signIn, signUp, signOut }),
    [session, isRestoring, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSession(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
}
