import { NextResponse } from 'next/server';
import { getTransactionById, updateTransaction, deleteTransaction } from '@/lib/services/transactionService';

// GET /api/transactions/[id] - Get a specific transaction
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await getTransactionById(params.id);
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Failed to fetch transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

// PUT /api/transactions/[id] - Update a transaction
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const transaction = await updateTransaction(params.id, body);
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Failed to update transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id] - Delete a transaction
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteTransaction(params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}