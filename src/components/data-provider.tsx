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
      const rawData = await response.json();
      
      if (!response.ok) {
        throw new Error(rawData.error || 'Failed to load transactions');
      }
      
      // Parse the data properly to ensure correct types
      const parsedData: Transaction[] = rawData.map((item: any) => ({
        ...item,
        date: new Date(item.date),
        amount: typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount,
        amountWithGST: typeof item.amountWithGST === 'string' ? parseFloat(item.amountWithGST) : item.amountWithGST
      }));
      
      // Sort transactions by date (newest first)
      const sortedTransactions = parsedData.sort((a, b) => 
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
    
    // Safely calculate totals with proper parsing and NaN checks
    const totalRevenue = sales.reduce((sum, t) => {
      const amount = typeof t.amountWithGST === 'string' 
        ? parseFloat(t.amountWithGST) 
        : typeof t.amountWithGST === 'number' 
        ? t.amountWithGST 
        : 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const totalPurchases = purchases.reduce((sum, t) => {
      const amount = typeof t.amountWithGST === 'string' 
        ? parseFloat(t.amountWithGST) 
        : typeof t.amountWithGST === 'number' 
        ? t.amountWithGST 
        : 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const totalSalesCount = sales.length;
    const totalPurchaseCount = purchases.length;
    
    // Calculate base amounts (without GST)
    const totalBaseSales = sales.reduce((sum, t) => {
      const amount = typeof t.amount === 'string' 
        ? parseFloat(t.amount) 
        : typeof t.amount === 'number' 
        ? t.amount 
        : 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const totalBasePurchases = purchases.reduce((sum, t) => {
      const amount = typeof t.amount === 'string' 
        ? parseFloat(t.amount) 
        : typeof t.amount === 'number' 
        ? t.amount 
        : 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    // Calculate profit with safety checks
    const profit = !isNaN(totalBaseSales) && !isNaN(totalBasePurchases) 
      ? totalBaseSales - totalBasePurchases 
      : 0;
    
    return {
      totalRevenue: isNaN(totalRevenue) ? 0 : totalRevenue,
      totalPurchases: isNaN(totalPurchases) ? 0 : totalPurchases,
      totalSales: totalSalesCount,
      totalPurchaseEntries: totalPurchaseCount,
      profit: isNaN(profit) ? 0 : profit,
      totalTransactions: totalSalesCount + totalPurchaseCount
    };
  }, [transactions]);

  // Calculate monthly overview data from transactions
  const calculateMonthlyOverview = useCallback(() => {
    const monthlyData: { [key: string]: { sales: number; purchases: number } } = {};
    
    transactions.forEach(transaction => {
      // Use a fallback for month if not present
      const month = transaction.month || new Date(transaction.date).toLocaleString('default', { month: 'short', year: 'numeric' }) || 'Unknown';
      
      if (!monthlyData[month]) {
        monthlyData[month] = { sales: 0, purchases: 0 };
      }
      
      // Safely add amounts with proper parsing and NaN checks
      const amount = typeof transaction.amountWithGST === 'string' 
        ? parseFloat(transaction.amountWithGST) 
        : typeof transaction.amountWithGST === 'number' 
        ? transaction.amountWithGST 
        : 0;
      
      if (transaction.type === 'Sale') {
        monthlyData[month].sales += isNaN(amount) ? 0 : amount;
      } else {
        monthlyData[month].purchases += isNaN(amount) ? 0 : amount;
      }
    });
    
    // Convert to array format
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      sales: isNaN(data.sales) ? 0 : data.sales,
      purchases: isNaN(data.purchases) ? 0 : data.purchases
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