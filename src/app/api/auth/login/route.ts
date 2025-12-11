import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/services/userService';
import { cookies } from 'next/headers';

// POST /api/auth/login - Authenticate user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Authenticate user
    const user = await authenticateUser({
      email: body.email,
      password: body.password
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Create a simple token (in a real app, you'd use JWT or sessions)
    const token = Buffer.from(JSON.stringify({ 
      id: user.id, 
      email: user.email,
      name: user.name
    })).toString('base64');
    
    // Set cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      message: 'Login successful'
    });
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Failed to authenticate user:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate user' },
      { status: 500 }
    );
  }
}