'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Add Expense</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Receipt Image *
            </label>
            {receiptImage ? (
              <div className="relative">
                <img
                  src={receiptImage}
                  alt="Receipt preview"
                  className="w-full max-h-64 object-contain rounded-lg border border-gray-200"
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
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
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
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                      <p className="text-gray-600">Processing receipt...</p>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-12 h-12 text-gray-400 mb-4"
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
                      <p className="text-gray-600 font-medium">Click to upload receipt</p>
                      <p className="text-gray-500 text-sm mt-1">PNG, JPG up to 10MB</p>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount ($) *
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
              placeholder="0.00"
            />
          </div>

          {/* Merchant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Merchant / Place Name *
            </label>
            <input
              type="text"
              value={formData.merchant || ''}
              onChange={(e) =>
                setFormData({ ...formData, merchant: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
              placeholder="Enter merchant name"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date || ''}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category || 'Miscellaneous'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as ExpenseCategory,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Save Expense
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

