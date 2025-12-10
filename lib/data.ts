import type { Transaction, User } from './types';

export const mockTransactions: Transaction[] = [
  { id: '1', type: 'Sale', date: new Date('2024-05-01'), party: 'Customer A', items: 'Service 1, Service 2', amount: 1271.19, billDate: '01/05/2024', billNumber: 'INV-001', month: 'May-2024', amountWithGST: 1500 },
  { id: '2', type: 'Purchase', date: new Date('2024-05-02'), party: 'Supplier X', items: 'Raw Material 1', amount: 677.97, billDate: '02/05/2024', billNumber: 'P-001', month: 'May-2024', amountWithGST: 800 },
  { id: '3', type: 'Sale', date: new Date('2024-05-03'), party: 'Customer B', items: 'Product A', amount: 2118.64, billDate: '03/05/2024', billNumber: 'INV-002', month: 'May-2024', amountWithGST: 2500 },
  { id: '4', type: 'Sale', date: new Date('2024-05-04'), party: 'Customer A', items: 'Service 3', amount: 423.73, billDate: '04/05/2024', billNumber: 'INV-003', month: 'May-2024', amountWithGST: 500 },
  { id: '5', type: 'Purchase', date: new Date('2024-05-05'), party: 'Supplier Y', items: 'Office Supplies', amount: 127.12, billDate: '05/05/2024', billNumber: 'P-002', month: 'May-2024', amountWithGST: 150 },
  { id: '6', type: 'Sale', date: new Date('2024-06-10'), party: 'Customer C', items: 'Product B, Product C', amount: 6355.93, billDate: '10/06/2024', billNumber: 'INV-004', month: 'Jun-2024', amountWithGST: 7500 },
  { id: '7', type: 'Purchase', date: new Date('2024-06-12'), party: 'Supplier X', items: 'Raw Material 2', amount: 1016.95, billDate: '12/06/2024', billNumber: 'P-003', month: 'Jun-2024', amountWithGST: 1200 },
  { id: '8', type: 'Sale', date: new Date('2024-06-15'), party: 'Customer B', items: 'Service 1', amount: 762.71, billDate: '15/06/2024', billNumber: 'INV-005', month: 'Jun-2024', amountWithGST: 900 },
  { id: '9', type: 'Sale', date: new Date('2024-06-20'), party: 'Customer D', items: 'Product D', amount: 2711.86, billDate: '20/06/2024', billNumber: 'INV-006', month: 'Jun-2024', amountWithGST: 3200 },
  { id: '10', type: 'Purchase', date: new Date('2024-06-25'), party: 'Supplier Z', items: 'Equipment', amount: 4237.29, billDate: '25/06/2024', billNumber: 'P-004', month: 'Jun-2024', amountWithGST: 5000 },
  { id: '11', type: 'Sale', date: new Date('2024-07-01'), party: 'Customer A', items: 'Service 4', amount: 1525.42, billDate: '01/07/2024', billNumber: 'INV-007', month: 'Jul-2024', amountWithGST: 1800 },
  { id: '12', type: 'Purchase', date: new Date('2024-07-02'), party: 'Supplier Y', items: 'Software License', amount: 254.24, billDate: '02/07/2024', billNumber: 'P-005', month: 'Jul-2024', amountWithGST: 300 },
  { id: '13', type: 'Sale', date: new Date('2024-07-05'), party: 'Customer E', items: 'Product E', amount: 3813.56, billDate: '05/07/2024', billNumber: 'INV-008', month: 'Jul-2024', amountWithGST: 4500 },
  { id: '14', type: 'Purchase', date: new Date('2024-07-10'), party: 'Supplier X', items: 'Raw Material 3', amount: 805.08, billDate: '10/07/2024', billNumber: 'P-006', month: 'Jul-2024', amountWithGST: 950 },
  { id: '15', type: 'Sale', date: new Date('2024-07-15'), party: 'Customer C', items: 'Service 2', amount: 932.20, billDate: '15/07/2024', billNumber: 'INV-009', month: 'Jul-2024', amountWithGST: 1100 },
];

export const mockUser: User = {
  name: 'Admin User',
  email: 'admin@ssengineering.com',
};
