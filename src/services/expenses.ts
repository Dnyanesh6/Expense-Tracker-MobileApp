import { apiRequest } from '@/services/api';
import type { Expense, ExpenseFilters, ExpenseInput } from '@/types';

export async function listExpenses(filters: ExpenseFilters = {}, signal?: AbortSignal): Promise<Expense[]> {
  const result = await apiRequest<{ expenses: Expense[] }>('/api/expenses', {
    query: {
      category: filters.category,
      from: filters.from,
      to: filters.to,
      search: filters.search,
    },
    signal,
  });
  return result.expenses;
}

export async function getExpense(id: string): Promise<Expense> {
  const result = await apiRequest<{ expense: Expense }>(`/api/expenses/${id}`);
  return result.expense;
}

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  const result = await apiRequest<{ expense: Expense }>('/api/expenses', {
    method: 'POST',
    body: input,
  });
  return result.expense;
}

export async function updateExpense(id: string, input: ExpenseInput): Promise<Expense> {
  const result = await apiRequest<{ expense: Expense }>(`/api/expenses/${id}`, {
    method: 'PUT',
    body: input,
  });
  return result.expense;
}

export function deleteExpense(id: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/api/expenses/${id}`, { method: 'DELETE' });
}
