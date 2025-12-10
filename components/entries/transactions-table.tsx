'use client';

import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Transaction } from '@/lib/types';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface TransactionsTableProps {
  data: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionsTable({ data, onEdit, onDelete }: TransactionsTableProps) {

  const calculateGST = (amountWithGST: number) => {
    const base = amountWithGST / 1.18;
    const gst = amountWithGST - base;
    return { base, gst };
  }

  return (
    <Card>
      <div className="border-b">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Bill Date</TableHead>
              <TableHead className="w-[120px]">Bill No.</TableHead>
              <TableHead>Party</TableHead>
              <TableHead className="hidden md:table-cell">Items</TableHead>
              <TableHead className="text-right">Base Amount</TableHead>
              <TableHead className="text-right">GST (18%)</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((transaction) => {
                const { base, gst } = calculateGST(transaction.amountWithGST);
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.billDate}</TableCell>
                    <TableCell><Badge variant="outline">{transaction.billNumber}</Badge></TableCell>
                    <TableCell className="font-medium">{transaction.party}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell max-w-[200px] truncate">{transaction.items}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                      }).format(base)}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                      }).format(gst)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                      }).format(transaction.amountWithGST)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onEdit(transaction)}>Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive-foreground focus:bg-destructive"
                            onClick={() => onDelete(transaction.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
