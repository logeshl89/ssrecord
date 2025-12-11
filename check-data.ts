import { query } from './src/lib/db';

async function checkTransactions() {
  try {
    console.log('Checking transactions table...');
    
    // Get all transactions
    const result = await query(`
      SELECT id, type, date, party, items, amount, bill_date, bill_number, month, amount_with_gst 
      FROM transactions 
      ORDER BY date DESC
    `);
    
    console.log(`Found ${result.rows.length} transactions:`);
    console.log(JSON.stringify(result.rows, null, 2));
    
    // Get sales summary
    const salesResult = await query(`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as base_amount,
        COALESCE(SUM(amount_with_gst), 0) as total_amount
      FROM transactions 
      WHERE type = 'Sale'
    `);
    
    console.log('Sales summary:', salesResult.rows[0]);
    
    // Get purchases summary
    const purchasesResult = await query(`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as base_amount,
        COALESCE(SUM(amount_with_gst), 0) as total_amount
      FROM transactions 
      WHERE type = 'Purchase'
    `);
    
    console.log('Purchases summary:', purchasesResult.rows[0]);
    
  } catch (error) {
    console.error('Error checking transactions:', error);
  }
}

checkTransactions();