'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from './types';
import { getExpenses } from './utils/storage';
import { format, parseISO } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);

  useEffect(() => {
    setExpenses(getExpenses());
    
    const handleStorageChange = () => {
      setExpenses(getExpenses());
    };
    window.addEventListener('storage', handleStorageChange);
    
    const interval = setInterval(() => {
      setExpenses(getExpenses());
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Calculate totals by category
  const categoryTotals = EXPENSE_CATEGORIES.reduce((acc, category) => {
    acc[category] = expenses
      .filter(exp => exp.category === category)
      .reduce((sum, exp) => sum + exp.amount, 0);
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  const totalSpend = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Group expenses by date
  const expensesByDate = expenses.reduce((acc, exp) => {
    const date = exp.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(exp);
    return acc;
  }, {} as Record<string, Expense[]>);

  const dailySummaries = Object.entries(expensesByDate)
    .map(([date, exps]) => ({
      date,
      total: exps.reduce((sum, exp) => sum + exp.amount, 0),
      count: exps.length,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7); // Show last 7 days

  // Prepare data for pie chart
  const pieData = EXPENSE_CATEGORIES.map((category) => ({
    name: category,
    value: categoryTotals[category],
    color: getCategoryColor(category),
  })).filter(item => item.value > 0);

  // Colors for each category
  function getCategoryColor(category: ExpenseCategory): string {
    const colors = {
      'Food': '#FF6B6B',
      'Transportation': '#4ECDC4',
      'Shopping': '#45B7D1',
      'Accommodation': '#96CEB4',
      'Sightseeing Tickets': '#FFEAA7',
      'Miscellaneous': '#DDA0DD',
    };
    return colors[category];
  }

  const handlePieClick = (data: any) => {
    setSelectedCategory(data.name);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Travel Expenses</h1>
            <Link
              href="/expenses"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Total Spend Card */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg p-6 mb-6 text-white">
          <p className="text-primary-100 text-sm mb-1">Total Spent</p>
          <p className="text-4xl font-bold">${totalSpend.toFixed(2)}</p>
        </div>

        {/* Category Pie Chart */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Expenses by Category</h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            {pieData.length > 0 ? (
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="w-full lg:w-1/2 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        onClick={handlePieClick}
                        className="cursor-pointer"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full lg:w-1/2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
                  <div className="space-y-3">
                    {pieData.map((item) => {
                      const percentage = totalSpend > 0 ? (item.value / totalSpend) * 100 : 0;
                      return (
                        <div
                          key={item.name}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                            selectedCategory === item.name 
                              ? 'bg-gray-100 ring-2 ring-primary-500' 
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => setSelectedCategory(selectedCategory === item.name ? null : item.name)}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-medium text-gray-900">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              ${item.value.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No expenses to display</p>
                <p className="text-gray-400 text-sm mt-2">Add your first expense to see the breakdown</p>
              </div>
            )}
          </div>
        </section>

        {/* Daily Summary */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Days</h2>
          {dailySummaries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">No expenses recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dailySummaries.map((summary) => (
                <div
                  key={summary.date}
                  className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between hover:shadow-md transition"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {format(parseISO(summary.date), 'EEEE, MMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {summary.count} {summary.count === 1 ? 'expense' : 'expenses'}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    ${summary.total.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Add Button */}
      <Link
        href="/add"
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition hover:scale-110"
        aria-label="Add expense"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
      </Link>
    </div>
  );
}

