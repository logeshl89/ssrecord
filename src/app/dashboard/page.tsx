'use client';

import { BarChart, CreditCard, DollarSign, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { useEffect, useState } from "react";
import { useAppData } from "@/contexts/app-data-context";

export default function DashboardPage() {
  const { transactions, loading, calculateDashboardStats, calculateMonthlyOverview } = useAppData();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPurchases: 0,
    totalSales: 0,
    totalPurchaseEntries: 0,
    profit: 0,
    totalTransactions: 0
  });
  
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  // Calculate stats and monthly data when transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      setStats(calculateDashboardStats());
      setMonthlyData(calculateMonthlyOverview());
    }
  }, [transactions, calculateDashboardStats, calculateMonthlyOverview]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (incl. GST)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.totalRevenue.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">
              from {stats.totalSales} sales
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases (incl. GST)</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.totalPurchases.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">
              from {stats.totalPurchaseEntries} purchases
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit (Sales - Purchase)</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.profit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on base amounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalTransactions}
            </div>
            <p className="text-xs text-muted-foreground">
              All sales and purchases
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <OverviewChart data={monthlyData} />
        </CardContent>
      </Card>
    </div>
  );
}