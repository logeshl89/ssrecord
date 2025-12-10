export type Transaction = {
  id: string;
  type: 'Purchase' | 'Sale';
  date: Date;
  party: string; 
  items: string; 
  amount: number;
  billDate: string;
  billNumber: string;
  month: string;
  amountWithGST: number;
};

export type User = {
  name: string;
  email: string;
};
