'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from '../types';
import { getExpenses, deleteExpense } from '../utils/storage';
import { format } from 'date-fns';

export default function ExpensesList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    // Load expenses from storage
    setExpenses(getExpenses());
    
    // Listen for storage changes (for cross-tab sync)
    const handleStorageChange = () => {
      setExpenses(getExpenses());
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically (for same-tab updates)
    const interval = setInterval(() => {
      setExpenses(getExpenses());
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id);
      setExpenses(getExpenses());
    }
  };

  // Sort expenses by date (most recent first)
  const sortedExpenses = [...expenses].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {sortedExpenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No expenses yet</p>
            <Link
              href="/"
              className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Add Your First Expense
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedExpenses.map((expense) => (
              <div
                key={expense.id}
                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition"
              >
                <div className="flex gap-4">
                  {/* Receipt Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={expense.receiptImage}
                      alt="Receipt"
                      className="w-20 h-20 object-cover rounded border border-gray-200"
                    />
                  </div>

                  {/* Expense Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {expense.merchant}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {format(new Date(expense.date), 'MMM dd, yyyy')}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                            {expense.category}
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            ${expense.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition"
                        aria-label="Delete expense"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

