export type Category = 'Food' | 'Travel' | 'Shopping' | 'Bills' | 'Health' | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface Expense {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: Category;
  date: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInput {
  title: string;
  amount: number;
  category: Category;
  date: string;
  note?: string;
}

export interface ExpenseFilters {
  category?: Category | 'All';
  from?: string;
  to?: string;
  search?: string;
}
