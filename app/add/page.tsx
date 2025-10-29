'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from '../types';
import { addExpense, fileToDataURL } from '../utils/storage';
import { processReceipt } from '../utils/ocr';

export default function AddExpense() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<Partial<Expense>>({
    amount: undefined,
    merchant: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Miscellaneous',
  });
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Convert to data URL
      const dataURL = await fileToDataURL(file);
      setReceiptImage(dataURL);

      // Process receipt with OCR
      const extracted = await processReceipt(dataURL);
      
      setFormData({
        amount: extracted.amount || undefined,
        merchant: extracted.merchant,
        date: extracted.date,
        category: formData.category || 'Miscellaneous',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process receipt');
      console.error('Error processing receipt:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!receiptImage) {
      setError('Please upload a receipt image');
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!formData.merchant || formData.merchant.trim() === '') {
      setError('Please enter a merchant name');
      return;
    }

    if (!formData.date) {
      setError('Please enter a date');
      return;
    }

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      amount: formData.amount,
      merchant: formData.merchant.trim(),
      date: formData.date,
      category: formData.category,
      receiptImage,
      createdAt: new Date().toISOString(),
    };

    addExpense(newExpense);
    router.push('/');
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="glass sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add Expense</h1>
              <p className="text-gray-600 mt-1">Upload receipt and let AI extract the details</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="card p-8 space-y-8">
          {/* Receipt Upload */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              📸 Receipt Image *
            </label>
            {receiptImage ? (
              <div className="relative group">
                <img
                  src={receiptImage}
                  alt="Receipt preview"
                  className="w-full max-h-80 object-contain rounded-2xl border-2 border-gray-200 shadow-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setReceiptImage(null);
                    setFormData({
                      amount: undefined,
                      merchant: '',
                      date: new Date().toISOString().split('T')[0],
                      category: 'Miscellaneous',
                    });
                  }}
                  className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all duration-200 hover:scale-110 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="receipt-upload"
                  disabled={isProcessing}
                />
                <label
                  htmlFor="receipt-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-6"></div>
                      <p className="text-gray-600 text-lg font-medium">Processing receipt with AI...</p>
                      <p className="text-gray-500 text-sm mt-2">This may take a few seconds</p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                        <svg
                          className="w-10 h-10 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-700 font-semibold text-lg mb-2">Upload Receipt</p>
                      <p className="text-gray-500 mb-4">AI will automatically extract amount, merchant, and date</p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Choose File
                      </div>
                      <p className="text-gray-400 text-sm mt-2">PNG, JPG up to 10MB</p>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                💰 Amount ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all duration-200"
                required
                placeholder="0.00"
              />
            </div>

            {/* Merchant */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                🏪 Merchant / Place Name *
              </label>
              <input
                type="text"
                value={formData.merchant || ''}
                onChange={(e) =>
                  setFormData({ ...formData, merchant: e.target.value })
                }
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all duration-200"
                required
                placeholder="Enter merchant name"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                📅 Date *
              </label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all duration-200"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                🏷️ Category *
              </label>
              <select
                value={formData.category || 'Miscellaneous'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as ExpenseCategory,
                  })
                }
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all duration-200"
                required
              >
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-6 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              Save Expense
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

