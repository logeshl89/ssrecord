import { NextResponse } from 'next/server';

// POST /api/auth/logout - Logout user
export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Logout successful' });
    
    // Clear the auth token cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0, // Expire immediately
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Failed to logout user:', error);
    return NextResponse.json(
      { error: 'Failed to logout user' },
      { status: 500 }
    );
  }
}