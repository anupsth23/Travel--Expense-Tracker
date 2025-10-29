// Expense categories
export const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Shopping',
  'Accommodation',
  'Sightseeing Tickets',
  'Miscellaneous',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

// Expense data structure
export interface Expense {
  id: string;
  date: string; // ISO date string
  amount: number;
  merchant: string;
  category: ExpenseCategory;
  receiptImage: string; // base64 data URL
  createdAt: string; // ISO timestamp
}

// Storage key for local storage
export const STORAGE_KEY = 'travel_expenses';

