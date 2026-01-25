/**
 * POST /api/auth/login - Login user
 */
import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { createAccessToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { detail: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { detail: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user
    const user = findUserByEmail(email);

    // Generic error to prevent user enumeration
    const invalidCredentials = NextResponse.json(
      { detail: 'Invalid credentials' },
      { status: 401 }
    );

    if (!user) {
      return invalidCredentials;
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return invalidCredentials;
    }

    // Generate JWT token
    const token = await createAccessToken(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}
