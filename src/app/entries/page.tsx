'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, FileDown, Package, IndianRupee, ArrowLeftRight, Percent } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { TransactionsTable } from '@/components/entries/transactions-table';
import { AddTransactionForm } from '@/components/entries/add-transaction-form';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAppData } from '@/contexts/app-data-context';

export default function EntriesPage() {
  const { transactions, loading, error, refreshTransactions } = useAppData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'Sale' | 'Purchase'>('Sale');
  const [activeTab, setActiveTab] = useState<'all' | 'sales' | 'purchases'>('all');
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const { toast } = useToast();

  const handleAddOrUpdateTransaction = async (transactionData: Omit<Transaction, 'id' | 'amount' | 'billNumber' | 'month'> & { id?: string; amountWithGST: number }) => {
    try {
      const baseAmount = transactionData.amountWithGST / 1.18;
      const newTransaction = { ...transactionData, amount: baseAmount };

      let response;
      if (newTransaction.id) {
        // Update existing transaction
        response = await fetch(`/api/transactions/${newTransaction.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: newTransaction.type,
            date: newTransaction.date,
            party: newTransaction.party,
            items: newTransaction.items,
            amount: baseAmount,
            billDate: newTransaction.billDate
          }),
        });
      } else {
        // Add new transaction
        response = await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: newTransaction.type,
            date: newTransaction.date,
            party: newTransaction.party,
            items: newTransaction.items,
            amount: baseAmount,
            billDate: newTransaction.billDate
          }),
        });
      }

      const data = await response.json();
      
      if (response.ok) {
        // Refresh the data after successful operation
        refreshTransactions();
        
        if (newTransaction.id) {
          toast({
            title: "Success",
            description: "Transaction updated successfully.",
          });
        } else {
          toast({
            title: "Success",
            description: "Transaction added successfully.",
          });
        }
      } else {
        throw new Error(data.error || 'Failed to save transaction');
      }
      
      setEditingTransaction(null);
      setCurrentPage(1); // Reset to first page after adding/updating
    } catch (error) {
      console.error('Failed to save transaction:', error);
      toast({
        title: "Error",
        description: "Failed to save transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setFormType(transaction.type);
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (deletingTransactionId) {
      try {
        const response = await fetch(`/api/transactions/${deletingTransactionId}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Refresh the data after successful deletion
          refreshTransactions();
          
          toast({
            title: "Success",
            description: "Transaction deleted successfully.",
          });
        } else {
          throw new Error(data.error || 'Failed to delete transaction');
        }
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        toast({
          title: "Error",
          description: "Failed to delete transaction. Please try again.",
          variant: "destructive",
        });
      } finally {
        setDeletingTransactionId(null);
      }
    }
  };

  const openForm = (type: 'Sale' | 'Purchase') => {
    setFormType(type);
    setEditingTransaction(null);
    setIsFormOpen(true);
  }

  const sales = useMemo(() => {
    return transactions.filter(t => t.type === 'Sale');
  }, [transactions]);
  
  const purchases = useMemo(() => {
    return transactions.filter(t => t.type === 'Purchase');
  }, [transactions]);

  const totals = useMemo(() => {
    const salesTransactions = sales;
    const purchaseTransactions = purchases;
    
    // Safely calculate totals with proper parsing and NaN checks
    const totalSales = salesTransactions.reduce((sum, t) => {
      const amount = typeof t.amountWithGST === 'string' 
        ? parseFloat(t.amountWithGST) 
        : typeof t.amountWithGST === 'number' 
        ? t.amountWithGST 
        : 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const totalPurchases = purchaseTransactions.reduce((sum, t) => {
      const amount = typeof t.amountWithGST === 'string' 
        ? parseFloat(t.amountWithGST) 
        : typeof t.amountWithGST === 'number' 
        ? t.amountWithGST 
        : 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const totalBaseSales = salesTransactions.reduce((sum, t) => {
      const amount = typeof t.amount === 'string' 
        ? parseFloat(t.amount) 
        : typeof t.amount === 'number' 
        ? t.amount 
        : 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const totalBasePurchases = purchaseTransactions.reduce((sum, t) => {
      const amount = typeof t.amount === 'string' 
        ? parseFloat(t.amount) 
        : typeof t.amount === 'number' 
        ? t.amount 
        : 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const totalGstSales = totalSales - totalBaseSales;
    const totalGstPurchases = totalPurchases - totalBasePurchases;

    const netProfit = !isNaN(totalBaseSales) && !isNaN(totalBasePurchases) 
      ? totalBaseSales - totalBasePurchases 
      : 0;
      
    const netGst = !isNaN(totalGstSales) && !isNaN(totalGstPurchases)
      ? totalGstSales - totalGstPurchases
      : 0;

    return { 
      totalSales: isNaN(totalSales) ? 0 : totalSales,
      totalPurchases: isNaN(totalPurchases) ? 0 : totalPurchases,
      netProfit: isNaN(netProfit) ? 0 : netProfit,
      netGst: isNaN(netGst) ? 0 : netGst,
      totalGstSales: isNaN(totalGstSales) ? 0 : totalGstSales,
      totalGstPurchases: isNaN(totalGstPurchases) ? 0 : totalGstPurchases
    };
  }, [sales, purchases]);
  
  const paginatedData = useMemo(() => {
    let data: Transaction[] = [];
    if (activeTab === 'sales') {
      data = sales;
    } else if (activeTab === 'purchases') {
      data = purchases;
    } else {
      data = transactions;
    }
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return data.slice(startIndex, endIndex);
  }, [transactions, sales, purchases, activeTab, currentPage]);
  
  const totalPages = useMemo(() => {
    let data: Transaction[] = [];
    if (activeTab === 'sales') {
      data = sales;
    } else if (activeTab === 'purchases') {
      data = purchases;
    } else {
      data = transactions;
    }
    return Math.ceil(data.length / recordsPerPage);
  }, [transactions, sales, purchases, activeTab]);

  const exportPDF = async () => {
    try {
      // Create a simple text-based PDF export without external dependencies
      const docTitle = `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report`;
      const fileName = `${activeTab}_report_${format(new Date(), 'yyyy-MM-dd')}.txt`;
      
      let content = `SS Engineering - ${docTitle}\n`;
      content += `Generated on: ${new Date().toLocaleDateString('en-IN')}\n\n`;
      
      // Add summary
      content += `SUMMARY\n`;
      content += `========\n`;
      content += `Total Sales: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totals.totalSales)}\n`;
      content += `Total Purchases: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totals.totalPurchases)}\n`;
      content += `Net Profit: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totals.netProfit)}\n`;
      content += `Net GST Payable: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totals.netGst)}\n\n`;
      
      // Add transaction details
      content += `TRANSACTIONS\n`;
      content += `============\n\n`;
      
      let tableData: Transaction[] = [];
      switch (activeTab) {
        case 'sales':
          tableData = sales;
          break;
        case 'purchases':
          tableData = purchases;
          break;
        default:
          tableData = transactions;
      }
      
      // Create table-like format
      content += `Bill Date    | Bill No.    | Party       | Base Amount | GST (18%)   | Total Amount\n`;
      content += `-------------|-------------|-------------|-------------|-------------|-------------\n`;
      
      tableData.forEach(t => {
        const baseAmount = (typeof t.amountWithGST === 'number' && !isNaN(t.amountWithGST) ? t.amountWithGST : 0) / 1.18;
        const gstAmount = (typeof t.amountWithGST === 'number' && !isNaN(t.amountWithGST) ? t.amountWithGST : 0) - baseAmount;
        
        content += `${t.billDate.padEnd(12)} | ${t.billNumber.padEnd(11)} | ${t.party.padEnd(11)} | ${baseAmount.toFixed(2).padEnd(11)} | ${gstAmount.toFixed(2).padEnd(11)} | ${t.amountWithGST.toFixed(2)}\n`;
      });
      
      // Create and download file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Report exported successfully.",
      });
    } catch (error) {
      console.error('Failed to export report:', error);
      toast({
        title: "Error",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Entries</h2>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex">
            <Button onClick={() => openForm('Sale')} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Sale
            </Button>
            <Button variant="secondary" onClick={() => openForm('Purchase')} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Purchase
            </Button>
          </div>
          <Button variant="outline" onClick={exportPDF} className="w-full sm:w-auto">
            <FileDown className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(typeof totals.totalSales === 'number' && !isNaN(totals.totalSales) ? totals.totalSales : 0)}
            </div>
             <p className="text-xs text-muted-foreground">
              Across {sales.length} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(typeof totals.totalPurchases === 'number' && !isNaN(totals.totalPurchases) ? totals.totalPurchases : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {purchases.length} transactions
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(typeof totals.netProfit === 'number' && !isNaN(totals.netProfit) ? totals.netProfit : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Base Sales - Base Purchases
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net GST Payable</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className={`text-2xl font-bold ${totals.netGst >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(typeof totals.netGst === 'number' && !isNaN(totals.netGst) ? totals.netGst : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Sales GST - Purchase GST
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
              {transactions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Sales & Purchases
            </p>
          </CardContent>
        </Card>
      </div>

      <AddTransactionForm 
        isOpen={isFormOpen} 
        setIsOpen={setIsFormOpen} 
        type={formType}
        onSubmit={handleAddOrUpdateTransaction}
        transaction={editingTransaction}
      />

      <AlertDialog open={!!deletingTransactionId} onOpenChange={() => setDeletingTransactionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingTransactionId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={(value) => { setActiveTab(value as 'all' |'sales' | 'purchases'); setCurrentPage(1); }}>
        <TabsList>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <TransactionsTable data={paginatedData} onEdit={handleEdit} onDelete={setDeletingTransactionId} />
        </TabsContent>
        <TabsContent value="sales">
          <TransactionsTable data={paginatedData} onEdit={handleEdit} onDelete={setDeletingTransactionId} />
        </TabsContent>
        <TabsContent value="purchases">
          <TransactionsTable data={paginatedData} onEdit={handleEdit} onDelete={setDeletingTransactionId} />
        </TabsContent>
      </Tabs>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}