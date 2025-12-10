import { BarChart, CreditCard, DollarSign, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { mockTransactions } from "@/lib/data";

export default function DashboardPage() {
  const totalRevenue = mockTransactions
    .filter((t) => t.type === "Sale")
    .reduce((sum, t) => sum + t.amountWithGST, 0);

  const totalPurchases = mockTransactions
    .filter((t) => t.type === "Purchase")
    .reduce((sum, t) => sum + t.amountWithGST, 0);
  
  const totalSales = mockTransactions.filter((t) => t.type === "Sale").length;
  
  const totalPurchaseEntries = mockTransactions.filter((t) => t.type === "Purchase").length;

  const baseRevenue = mockTransactions
    .filter((t) => t.type === "Sale")
    .reduce((sum, t) => sum + t.amount, 0);

  const basePurchases = mockTransactions
    .filter((t) => t.type === "Purchase")
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = baseRevenue - basePurchases;

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
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">
              from {totalSales} sales
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
              ₹{totalPurchases.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">
              from {totalPurchaseEntries} purchases
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
              ₹{profit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              {mockTransactions.length}
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
          <OverviewChart data={mockTransactions} />
        </CardContent>
      </Card>
    </div>
  );
}
