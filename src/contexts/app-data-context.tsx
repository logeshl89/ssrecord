'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { Transaction } from '@/lib/types';

interface AppDataContextType {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refreshTransactions: () => void;
  calculateDashboardStats: () => {
    totalRevenue: number;
    totalPurchases: number;
    totalSales: number;
    totalPurchaseEntries: number;
    profit: number;
    totalTransactions: number;
  };
  calculateMonthlyOverview: () => Array<{ month: string; sales: number; purchases: number }>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({
  children,
  value
}: {
  children: ReactNode;
  value: AppDataContextType;
}) {
  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}