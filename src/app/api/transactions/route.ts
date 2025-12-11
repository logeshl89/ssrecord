import { NextResponse } from 'next/server';
import { getAllTransactions, createTransaction, updateTransaction, deleteTransaction, getTransactionById } from '@/lib/services/transactionService';
import { CreateTransactionInput } from '@/lib/services/transactionService';

// GET /api/transactions - Get all transactions
export async function GET() {
  try {
    const transactions = await getAllTransactions();
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.type || !body.date || !body.party || !body.items || !body.amount || !body.billDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const transactionData: CreateTransactionInput = {
      type: body.type,
      date: new Date(body.date),
      party: body.party,
      items: body.items,
      amount: parseFloat(body.amount),
      billDate: body.billDate
    };
    
    const transaction = await createTransaction(transactionData);
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Failed to create transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}