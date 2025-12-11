import { NextResponse } from 'next/server';
import { updateUserPassword } from '@/lib/services/userService';

// POST /api/auth/password - Update user password
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        { error: 'User ID, current password, and new password are required' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    if (body.newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }
    
    // Update password
    const success = await updateUserPassword({
      userId: body.userId,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword
    });
    
    if (success) {
      return NextResponse.json({ message: 'Password updated successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to update password. Please check your current password.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Failed to update password:', error);
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
}