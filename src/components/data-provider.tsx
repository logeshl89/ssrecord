'use client';

import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/lib/types';
import { AppDataProvider } from '@/contexts/app-data-context';

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/transactions');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load transactions');
      }
      
      // Sort transactions by date (newest first)
      const sortedTransactions = data.sort((a: Transaction, b: Transaction) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setTransactions(sortedTransactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Calculate dashboard statistics from transactions
  const calculateDashboardStats = useCallback(() => {
    const sales = transactions.filter(t => t.type === 'Sale');
    const purchases = transactions.filter(t => t.type === 'Purchase');
    
    const totalRevenue = sales.reduce((sum, t) => sum + (t.amountWithGST || 0), 0);
    const totalPurchases = purchases.reduce((sum, t) => sum + (t.amountWithGST || 0), 0);
    const totalSalesCount = sales.length;
    const totalPurchaseCount = purchases.length;
    
    const totalBaseSales = sales.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalBasePurchases = purchases.reduce((sum, t) => sum + (t.amount || 0), 0);
    const profit = totalBaseSales - totalBasePurchases;
    
    return {
      totalRevenue,
      totalPurchases,
      totalSales: totalSalesCount,
      totalPurchaseEntries: totalPurchaseCount,
      profit,
      totalTransactions: totalSalesCount + totalPurchaseCount
    };
  }, [transactions]);

  // Calculate monthly overview data from transactions
  const calculateMonthlyOverview = useCallback(() => {
    const monthlyData: { [key: string]: { sales: number; purchases: number } } = {};
    
    transactions.forEach(transaction => {
      const month = transaction.month || 'Unknown';
      if (!monthlyData[month]) {
        monthlyData[month] = { sales: 0, purchases: 0 };
      }
      
      if (transaction.type === 'Sale') {
        monthlyData[month].sales += transaction.amountWithGST || 0;
      } else {
        monthlyData[month].purchases += transaction.amountWithGST || 0;
      }
    });
    
    // Convert to array format
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      sales: data.sales,
      purchases: data.purchases
    }));
  }, [transactions]);

  const contextValue = {
    transactions,
    loading,
    error,
    refreshTransactions: fetchTransactions,
    calculateDashboardStats,
    calculateMonthlyOverview
  };

  return (
    <AppDataProvider value={contextValue}>
      {children}
    </AppDataProvider>
  );
}