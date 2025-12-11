import { query } from '../db';
import { Transaction } from '../types';

export interface CreateTransactionInput {
  type: 'Purchase' | 'Sale';
  date: Date;
  party: string;
  items: string;
  amount: number;
  billDate: string;
  // Note: billNumber will be auto-generated
}

export interface UpdateTransactionInput {
  id: string;
  type?: 'Purchase' | 'Sale';
  date?: Date;
  party?: string;
  items?: string;
  amount?: number;
  billDate?: string;
  // Note: billNumber will be auto-generated if date/type changes
}

// Function to generate bill number in format: P/S + YEAR + sequence number
async function generateBillNumber(type: 'Purchase' | 'Sale', date: Date): Promise<string> {
  const year = date.getFullYear();
  const prefix = type === 'Purchase' ? 'P' : 'S';
  
  // Get the current sequence number for this year and type
  const sequenceResult = await query(
    `INSERT INTO bill_number_sequences (year, last_purchase_number, last_sale_number)
     VALUES ($1, 0, 0)
     ON CONFLICT (year) 
     DO UPDATE SET year = $1
     RETURNING last_purchase_number, last_sale_number`,
    [year]
  );
  
  // Increment the appropriate counter
  const fieldName = type === 'Purchase' ? 'last_purchase_number' : 'last_sale_number';
  const incrementResult = await query(
    `UPDATE bill_number_sequences 
     SET ${fieldName} = ${fieldName} + 1
     WHERE year = $1
     RETURNING ${fieldName}`,
    [year]
  );
  
  const sequenceNumber = incrementResult.rows[0][fieldName];
  
  // Format: P2024001 or S2024001
  return `${prefix}${year}${sequenceNumber.toString().padStart(3, '0')}`;
}

// Get all transactions
export async function getAllTransactions(): Promise<Transaction[]> {
  const result = await query(
    `SELECT id, type, date, party, items, amount, bill_date as "billDate", 
     bill_number as "billNumber", month, amount_with_gst as "amountWithGST"
     FROM transactions 
     ORDER BY date DESC`
  );
  return result.rows;
}

// Get transaction by ID
export async function getTransactionById(id: string): Promise<Transaction | null> {
  const result = await query(
    `SELECT id, type, date, party, items, amount, bill_date as "billDate", 
     bill_number as "billNumber", month, amount_with_gst as "amountWithGST"
     FROM transactions 
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

// Create a new transaction
export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  // Generate bill number
  const billNumber = await generateBillNumber(input.type, input.date);
  
  // Calculate month for grouping (e.g., "May-2024")
  const month = input.date.toLocaleString('default', { month: 'short', year: 'numeric' });
  
  // Calculate amount with 18% GST
  const amountWithGST = input.amount * 1.18;
  
  const result = await query(
    `INSERT INTO transactions (id, type, date, party, items, amount, bill_date, bill_number, month, amount_with_gst)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, type, date, party, items, amount, bill_date as "billDate", 
     bill_number as "billNumber", month, amount_with_gst as "amountWithGST"`,
    [
      `${input.type.toLowerCase()}-${Date.now()}`, // Simple ID generation
      input.type,
      input.date,
      input.party,
      input.items,
      input.amount,
      input.billDate,
      billNumber,
      month,
      amountWithGST
    ]
  );
  
  return result.rows[0];
}

// Update a transaction
export async function updateTransaction(id: string, input: UpdateTransactionInput): Promise<Transaction | null> {
  const fields = [];
  const values = [];
  let index = 1;
  
  // Get current transaction to check if we need to regenerate bill number
  const currentTransaction = await getTransactionById(id);
  if (!currentTransaction) {
    return null;
  }
  
  let billNumber = currentTransaction.billNumber;
  let needsNewBillNumber = false;
  
  if (input.type !== undefined && input.type !== currentTransaction.type) {
    fields.push(`type = $${index++}`);
    values.push(input.type);
    needsNewBillNumber = true;
  }
  
  if (input.date !== undefined) {
    fields.push(`date = $${index++}`);
    values.push(input.date);
    
    // Update month if date changes
    const month = input.date.toLocaleString('default', { month: 'short', year: 'numeric' });
    fields.push(`month = $${index++}`);
    values.push(month);
    
    // Check if year changed
    if (input.date.getFullYear() !== new Date(currentTransaction.date).getFullYear()) {
      needsNewBillNumber = true;
    }
  }
  
  if (input.party !== undefined) {
    fields.push(`party = $${index++}`);
    values.push(input.party);
  }
  
  if (input.items !== undefined) {
    fields.push(`items = $${index++}`);
    values.push(input.items);
  }
  
  if (input.amount !== undefined) {
    fields.push(`amount = $${index++}`);
    values.push(input.amount);
    
    // Recalculate amount with GST if amount changes
    const amountWithGST = input.amount * 1.18;
    fields.push(`amount_with_gst = $${index++}`);
    values.push(amountWithGST);
  }
  
  if (input.billDate !== undefined) {
    fields.push(`bill_date = $${index++}`);
    values.push(input.billDate);
  }
  
  // Regenerate bill number if needed
  if (needsNewBillNumber) {
    const type = input.type || currentTransaction.type;
    const date = input.date || new Date(currentTransaction.date);
    billNumber = await generateBillNumber(type, date);
    fields.push(`bill_number = $${index++}`);
    values.push(billNumber);
  }
  
  // Always update the updated_at timestamp
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  
  if (fields.length === 0) {
    return await getTransactionById(id);
  }
  
  values.push(id);
  
  const result = await query(
    `UPDATE transactions 
     SET ${fields.join(', ')}
     WHERE id = $${index}
     RETURNING id, type, date, party, items, amount, bill_date as "billDate", 
     bill_number as "billNumber", month, amount_with_gst as "amountWithGST"`,
    values
  );
  
  return result.rows[0] || null;
}

// Delete a transaction
export async function deleteTransaction(id: string): Promise<boolean> {
  const result = await query('DELETE FROM transactions WHERE id = $1', [id]);
  return (result.rowCount || 0) > 0;
}

// Get dashboard statistics
export async function getDashboardStats() {
  const [totalRevenue, totalPurchases, totalSales, totalPurchaseEntries, baseRevenue, basePurchases] = await Promise.all([
    // Total revenue (sales with GST)
    query(`SELECT COALESCE(SUM(amount_with_gst), 0) as total FROM transactions WHERE type = 'Sale'`),
    
    // Total purchases (purchases with GST)
    query(`SELECT COALESCE(SUM(amount_with_gst), 0) as total FROM transactions WHERE type = 'Purchase'`),
    
    // Total sales count
    query(`SELECT COUNT(*) as count FROM transactions WHERE type = 'Sale'`),
    
    // Total purchase entries count
    query(`SELECT COUNT(*) as count FROM transactions WHERE type = 'Purchase'`),
    
    // Base revenue (sales without GST)
    query(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'Sale'`),
    
    // Base purchases (purchases without GST)
    query(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'Purchase'`)
  ]);
  
  const revenue = parseFloat(totalRevenue.rows[0].total);
  const purchases = parseFloat(totalPurchases.rows[0].total);
  const salesCount = parseInt(totalSales.rows[0].count);
  const purchaseCount = parseInt(totalPurchaseEntries.rows[0].count);
  const baseRev = parseFloat(baseRevenue.rows[0].total);
  const basePur = parseFloat(basePurchases.rows[0].total);
  
  const profit = baseRev - basePur;
  
  return {
    totalRevenue: revenue,
    totalPurchases: purchases,
    totalSales: salesCount,
    totalPurchaseEntries: purchaseCount,
    profit: profit
  };
}

// Get monthly overview data
export async function getMonthlyOverview() {
  const result = await query(
    `SELECT 
      month,
      SUM(CASE WHEN type = 'Sale' THEN amount_with_gst ELSE 0 END) as sales,
      SUM(CASE WHEN type = 'Purchase' THEN amount_with_gst ELSE 0 END) as purchases
    FROM transactions 
    GROUP BY month 
    ORDER BY MIN(date)`
  );
  
  return result.rows;
}