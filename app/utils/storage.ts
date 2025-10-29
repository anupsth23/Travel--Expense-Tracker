import { Expense, STORAGE_KEY } from '../types';

/**
 * Get all expenses from local storage
 */
export function getExpenses(): Expense[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored) as Expense[];
  } catch {
    return [];
  }
}

/**
 * Save expenses to local storage
 */
export function saveExpenses(expenses: Expense[]): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

/**
 * Add a new expense
 */
export function addExpense(expense: Expense): void {
  const expenses = getExpenses();
  expenses.push(expense);
  saveExpenses(expenses);
}

/**
 * Delete an expense by ID
 */
export function deleteExpense(id: string): void {
  const expenses = getExpenses();
  const filtered = expenses.filter(exp => exp.id !== id);
  saveExpenses(filtered);
}

/**
 * Update an existing expense
 */
export function updateExpense(id: string, updatedExpense: Partial<Expense>): void {
  const expenses = getExpenses();
  const updated = expenses.map(exp => 
    exp.id === id ? { ...exp, ...updatedExpense } : exp
  );
  saveExpenses(updated);
}

/**
 * Get a single expense by ID
 */
export function getExpenseById(id: string): Expense | null {
  const expenses = getExpenses();
  return expenses.find(exp => exp.id === id) || null;
}

/**
 * Convert file to base64 data URL
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

