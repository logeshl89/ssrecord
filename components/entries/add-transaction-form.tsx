'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import type { Transaction } from '@/lib/types';
import { useEffect } from 'react';

const formSchema = z.object({
  party: z.string().min(2, { message: 'Must be at least 2 characters.' }),
  items: z.string().min(2, { message: 'Please describe the items.' }),
  amountWithGST: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  date: z.date({
    required_error: "A date for the transaction is required.",
  }),
  billDate: z.string().min(1, { message: "Bill date is required." }),
  billNumber: z.string(),
  month: z.string(),
});

interface AddTransactionFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  type: 'Sale' | 'Purchase';
  onSubmit: (data: Omit<Transaction, 'id' | 'amount'> & { id?: string }) => void;
  transaction: Transaction | null;
}

export function AddTransactionForm({ isOpen, setIsOpen, type, onSubmit, transaction }: AddTransactionFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      party: '',
      items: '',
      date: new Date(),
      billDate: format(new Date(), "dd/MM/yyyy"),
      billNumber: '',
      month: format(new Date(), "MMM-yyyy"),
    },
  });
  
  const generateBillNumber = (transactionType: 'Sale' | 'Purchase') => {
    const prefix = transactionType === 'Sale' ? 'INV' : 'P';
    const timestamp = Date.now();
    return `${prefix}-${String(timestamp).slice(-6)}`;
  };

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        form.reset({
          ...transaction,
          date: new Date(transaction.date),
          month: format(new Date(transaction.date), "MMM-yyyy"),
        });
      } else {
        const today = new Date();
        form.reset({
          party: '',
          items: '',
          amountWithGST: 0,
          date: today,
          billDate: format(today, "dd/MM/yyyy"),
          billNumber: generateBillNumber(type),
          month: format(today, "MMM-yyyy"),
        });
      }
    }
  }, [transaction, form, isOpen, type]);
  
  const selectedDate = form.watch('date');
  useEffect(() => {
      if (selectedDate) {
          form.setValue('month', format(selectedDate, 'MMM-yyyy'));
          form.setValue('billDate', format(selectedDate, 'dd/MM/yyyy'));
      }
  }, [selectedDate, form]);

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    const amount = values.amountWithGST / 1.18;
    onSubmit({ ...values, type, id: transaction?.id, amount });
    setIsOpen(false);
  }

  const dialogTitle = `${transaction ? 'Edit' : 'Add New'} ${type}`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            Record a new {type.toLowerCase()} transaction. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of transaction</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date('2000-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="billDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Date</FormLabel>
                    <FormControl>
                      <Input placeholder="Example: 10/12/2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="billNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Number</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-muted"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="party"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{type === 'Sale' ? 'Customer' : 'Supplier'}</FormLabel>
                  <FormControl>
                    <Input placeholder={type === 'Sale' ? 'e.g. John Doe' : 'e.g. Parts Inc.'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="items"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Items / Services</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the items or services..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amountWithGST"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (incl. 18% GST)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} step="0.01"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save Transaction</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
