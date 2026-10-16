export const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Other'] as const;

export type Category = (typeof CATEGORIES)[number];

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export interface ExpenseInput {
  title: string;
  amount: number;
  category: Category;
  date: string;
  note?: string;
}

export function validateExpense(body: unknown): { value?: ExpenseInput; error?: string } {
  const input = (body ?? {}) as Record<string, unknown>;
  const { title, amount, category, date, note } = input;

  if (typeof title !== 'string' || title.trim().length === 0) {
    return { error: 'Title is required' };
  }

  const numericAmount = typeof amount === 'number' ? amount : Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return { error: 'Amount must be greater than 0' };
  }

  if (typeof category !== 'string' || !CATEGORIES.includes(category as Category)) {
    return { error: 'Invalid category' };
  }

  if (typeof date !== 'string' || Number.isNaN(Date.parse(date))) {
    return { error: 'A valid date is required' };
  }

  return {
    value: {
      title: title.trim(),
      amount: Math.round(numericAmount * 100) / 100,
      category: category as Category,
      date,
      note: typeof note === 'string' && note.trim().length > 0 ? note.trim() : undefined,
    },
  };
}
