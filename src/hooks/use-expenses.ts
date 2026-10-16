import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { ApiError } from '@/services/api';
import type { Expense } from '@/types';

type Loader = (signal: AbortSignal) => Promise<Expense[]>;

export interface UseExpensesResult {
  expenses: Expense[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
}

export function useExpenses(loader: Loader, deps: unknown[] = []): UseExpensesResult {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const loadedOnce = useRef(false);

  const fetchInto = useCallback(async (signal: AbortSignal, mode: 'load' | 'refresh') => {
    if (!loadedOnce.current) setIsLoading(true);
    if (mode === 'refresh') setIsRefreshing(true);
    try {
      const data = await loaderRef.current(signal);
      setExpenses(data);
      setError(null);
      loadedOnce.current = true;
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      setError(
        err instanceof ApiError ? err.message : 'Something went wrong loading your expenses.',
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      void fetchInto(controller.signal, 'load');
      return () => controller.abort();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchInto, ...deps]),
  );

  const refresh = useCallback(async () => {
    const controller = new AbortController();
    await fetchInto(controller.signal, 'refresh');
  }, [fetchInto]);

  const retry = useCallback(async () => {
    const controller = new AbortController();
    await fetchInto(controller.signal, 'load');
  }, [fetchInto]);

  return { expenses, isLoading, isRefreshing, error, refresh, retry };
}
