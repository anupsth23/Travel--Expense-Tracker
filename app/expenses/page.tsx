'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from '../types';
import { getExpenses, deleteExpense } from '../utils/storage';
import { format } from 'date-fns';

// Receipt Image Modal Component
function ReceiptModal({ isOpen, onClose, imageSrc, merchant }: { 
  isOpen: boolean; 
  onClose: () => void; 
  imageSrc: string; 
  merchant: string; 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{merchant} - Receipt</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <img
            src={imageSrc}
            alt="Receipt"
            className="max-w-full max-h-96 object-contain mx-auto"
          />
        </div>
      </div>
    </div>
  );
}

export default function ExpensesList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<{ image: string; merchant: string } | null>(null);

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

  const handleReceiptClick = (image: string, merchant: string) => {
    setSelectedReceipt({ image, merchant });
  };

  // Sort expenses by date (most recent first)
  const sortedExpenses = [...expenses].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="min-h-screen pb-20">
      <header className="glass sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">All Expenses</h1>
              <p className="text-gray-600 mt-1">Your complete expense history</p>
            </div>
            <Link
              href="/"
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {sortedExpenses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No expenses yet</h3>
            <p className="text-gray-300 mb-6">Start tracking your travel expenses to see them here</p>
            <Link href="/add" className="btn-primary inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add First Expense
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {sortedExpenses.map((expense) => (
              <div
                key={expense.id}
                className="card p-6 card-hover"
              >
                <div className="flex gap-6">
                  {/* Receipt Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={expense.receiptImage}
                      alt="Receipt"
                      className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200 cursor-pointer hover:opacity-80 transition-all duration-300 hover:scale-105"
                      onClick={() => handleReceiptClick(expense.receiptImage, expense.merchant)}
                    />
                  </div>

                  {/* Expense Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 truncate mb-2">
                          {expense.merchant}
                        </h3>
                        <p className="text-gray-500 mb-3">
                          {format(new Date(expense.date), 'EEEE, MMM dd, yyyy')}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-semibold rounded-full">
                            {expense.category}
                          </span>
                          <span className="text-2xl font-bold text-gray-900">
                            ${expense.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-500 hover:text-red-700 p-3 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                        aria-label="Delete expense"
                      >
                        <svg
                          className="w-6 h-6"
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

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        imageSrc={selectedReceipt?.image || ''}
        merchant={selectedReceipt?.merchant || ''}
      />
    </div>
  );
}

