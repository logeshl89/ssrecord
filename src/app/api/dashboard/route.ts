import { NextResponse } from 'next/server';
import { getDashboardStats, getMonthlyOverview } from '@/lib/services/transactionService';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET() {
  try {
    const [stats, monthlyData] = await Promise.all([
      getDashboardStats(),
      getMonthlyOverview()
    ]);
    
    return NextResponse.json({
      stats,
      monthlyData
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}