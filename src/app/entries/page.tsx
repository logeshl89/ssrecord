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
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}


export default function EntriesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'Sale' | 'Purchase'>('Sale');
  const [activeTab, setActiveTab] = useState<'all' | 'sales' | 'purchases'>('all');
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const { toast } = useToast();

  // Fetch transactions from database
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions');
        const data = await response.json();
        
        if (response.ok) {
          setTransactions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } else {
          throw new Error(data.error || 'Failed to load transactions');
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        toast({
          title: "Error",
          description: "Failed to load transactions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [toast]);

  const handleAddOrUpdateTransaction = async (transactionData: Omit<Transaction, 'id' | 'amount'> & { id?: string; amountWithGST: number }) => {
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
        if (newTransaction.id) {
          // Update existing transaction in state
          setTransactions(prev =>
            prev.map(t =>
              t.id === newTransaction.id ? data : t
            ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          );
          
          toast({
            title: "Success",
            description: "Transaction updated successfully.",
          });
        } else {
          // Add new transaction to state
          setTransactions(prev => [
            data,
            ...prev
          ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          
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
          setTransactions(prev => prev.filter(t => t.id !== deletingTransactionId));
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

  const sales = useMemo(() => transactions.filter(t => t.type === 'Sale'), [transactions]);
  const purchases = useMemo(() => transactions.filter(t => t.type === 'Purchase'), [transactions]);

  const totals = useMemo(() => {
    const totalSales = sales.reduce((sum, t) => sum + t.amountWithGST, 0);
    const totalPurchases = purchases.reduce((sum, t) => sum + t.amountWithGST, 0);
    
    const totalBaseSales = sales.reduce((sum, t) => sum + t.amount, 0);
    const totalBasePurchases = purchases.reduce((sum, t) => sum + t.amount, 0);
    
    const totalGstSales = totalSales - totalBaseSales;
    const totalGstPurchases = totalPurchases - totalBasePurchases;

    const netProfit = totalBaseSales - totalBasePurchases;
    const netGst = totalGstSales - totalGstPurchases;

    return { totalSales, totalPurchases, netProfit, netGst, totalGstSales, totalGstPurchases };
  }, [sales, purchases]);
  
  const paginatedData = useMemo(() => {
    let data;
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
    let data;
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
    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    const docTitle = `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report`;
    const fileName = `${activeTab}_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    
    let tableData: Transaction[];
    let summaryData: { title: string; value: string }[];

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);


    switch (activeTab) {
      case 'sales':
        tableData = sales;
        summaryData = [
            { title: 'Total Sales (incl. GST)', value: formatCurrency(totals.totalSales) },
            { title: 'GST Collected', value: formatCurrency(totals.totalGstSales) }
        ];
        break;
      case 'purchases':
        tableData = purchases;
        summaryData = [
            { title: 'Total Purchases (incl. GST)', value: formatCurrency(totals.totalPurchases) },
            { title: 'GST Paid', value: formatCurrency(totals.totalGstPurchases) }
        ];
        break;
      default:
        tableData = transactions;
        summaryData = [
          { title: 'Total Sales', value: formatCurrency(totals.totalSales) },
          { title: 'Total Purchases', value: formatCurrency(totals.totalPurchases) },
          { title: 'Net GST Payable', value: formatCurrency(totals.netGst) },
          { title: 'Net Profit', value: formatCurrency(totals.netProfit) },
        ];
    }
    
    const body = tableData.map(t => {
      const baseAmount = t.amountWithGST / 1.18;
      const gstAmount = t.amountWithGST - baseAmount;
      return [
        t.billDate,
        t.billNumber,
        t.party,
        baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        t.amountWithGST.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      ];
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    // Header
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('SS Engineering', margin, 18);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(220, 220, 220);
    doc.text('123 Industrial Area, Pune, MH, 411001', pageWidth - margin, 12, { align: 'right' });
    doc.text('GSTIN: 27ABCDE1234F1Z5', pageWidth - margin, 18, { align: 'right' });

    // Report Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 49, 63);
    doc.text(docTitle, margin, 50);
    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(0.5);
    doc.line(margin, 53, pageWidth - margin, 53);
    
    // Summary Table
    const summaryBody = summaryData.map(item => [
      { content: item.title, styles: { fontStyle: 'bold', fillColor: [243, 244, 246] } },
      { content: item.value, styles: { halign: 'right' } }
    ]);
    
    doc.autoTable({
        body: summaryBody,
        startY: 65,
        theme: 'grid',
        tableWidth: 'auto',
        styles: {
          font: 'helvetica',
          fontSize: 10,
          cellPadding: 3,
        },
        columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 50 },
        },
        didDrawPage: (data) => {
          data.settings.margin.top = 20;
        },
        showHead: 'never'
    });


    // Main Table
    const tableStartY = (doc as any).lastAutoTable.finalY + 15;
    doc.autoTable({
      startY: tableStartY,
      head: [['Bill Date', 'Bill No.', 'Party', 'Base Amt', 'GST (18%)', 'Total Amt']],
      body: body,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        font: 'helvetica',
        fontSize: 9,
      },
      columnStyles: {
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
      },
      didDrawPage: (data) => {
        // Footer
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setLineWidth(0.2);
        doc.setDrawColor(200);
        doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          'This is a computer-generated report and does not require a signature.',
          margin,
          pageHeight - 10
        );
        doc.text(
          `Page ${doc.internal.pages.length - 1}`,
          pageWidth - margin,
          pageHeight - 10,
          { align: 'right' }
        );
      }
    });

    doc.save(fileName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading transactions...</div>
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
            <FileDown className="mr-2 h-4 w-4" /> Export PDF
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
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totals.totalSales)}
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
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totals.totalPurchases)}
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
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totals.netProfit)}
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
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totals.netGst)}
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