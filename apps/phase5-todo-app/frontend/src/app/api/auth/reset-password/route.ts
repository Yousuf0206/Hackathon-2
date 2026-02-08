/**
 * POST /api/auth/reset-password - Reset password using token
 */
import { NextRequest, NextResponse } from 'next/server';
import { findPasswordResetToken, markTokenUsed, updateUserPassword, initDatabase } from '@/lib/db';
import { hashPassword } from '@/lib/password';

export async function POST(request: NextRequest) {
  try {
    await initDatabase();

    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { detail: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { detail: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Find and validate token
    const resetToken = await findPasswordResetToken(token);

    if (!resetToken) {
      return NextResponse.json(
        { detail: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    if (resetToken.used) {
      return NextResponse.json(
        { detail: 'This reset token has already been used' },
        { status: 400 }
      );
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json(
        { detail: 'This reset token has expired' },
        { status: 400 }
      );
    }

    // Hash new password and update user
    const passwordHash = await hashPassword(password);
    await updateUserPassword(resetToken.user_id, passwordHash);
    await markTokenUsed(token);

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}
