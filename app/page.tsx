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
    <div className="min-h-screen bg-gray-50">
      <header className="glass sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Travel Expenses</h1>
              <p className="text-gray-600 mt-1">Track your spending with smart insights</p>
            </div>
            <Link
              href="/expenses"
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View All
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Total Spend Card */}
        <div className="card mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-8 text-white relative">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-lg mb-2">Total Spent</p>
                  <p className="text-5xl font-bold mb-2">${totalSpend.toFixed(2)}</p>
                  <p className="text-blue-100 text-sm">
                    {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'} recorded
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Pie Chart */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Expenses by Category</h2>
            <div className="text-gray-600 text-sm">
              Click categories to highlight
            </div>
          </div>
          <div className="card p-8">
            {pieData.length > 0 ? (
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="w-full lg:w-1/2 h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        onClick={handlePieClick}
                        className="cursor-pointer"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full lg:w-1/2">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Category Breakdown</h3>
                  <div className="space-y-4">
                    {pieData.map((item) => {
                      const percentage = totalSpend > 0 ? (item.value / totalSpend) * 100 : 0;
                      return (
                        <div
                          key={item.name}
                          className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                            selectedCategory === item.name 
                              ? 'bg-gradient-to-r from-blue-50 to-purple-50 ring-2 ring-blue-500 shadow-lg' 
                              : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md'
                          }`}
                          onClick={() => setSelectedCategory(selectedCategory === item.name ? null : item.name)}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-5 h-5 rounded-full shadow-sm"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-semibold text-gray-900 text-lg">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900">
                              ${item.value.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600 font-medium">
                              {percentage.toFixed(1)}% of total
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No expenses yet</h3>
                <p className="text-gray-500 mb-6">Start tracking your travel expenses to see beautiful insights</p>
                <Link href="/add" className="btn-primary inline-flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add First Expense
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Daily Summary */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          {dailySummaries.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No recent activity</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {dailySummaries.map((summary) => (
                <div
                  key={summary.date}
                  className="card p-6 card-hover"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">
                          {format(parseISO(summary.date), 'EEEE, MMM dd, yyyy')}
                        </p>
                        <p className="text-gray-500">
                          {summary.count} {summary.count === 1 ? 'expense' : 'expenses'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${summary.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Add Button */}
      <Link
        href="/add"
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 hover:shadow-xl transition-all duration-200 hover:scale-105"
        aria-label="Add expense"
      >
        <svg
          className="w-7 h-7"
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

