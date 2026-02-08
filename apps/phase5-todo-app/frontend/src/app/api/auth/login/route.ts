/**
 * POST /api/auth/login - Login user by login_name
 */
import { NextRequest, NextResponse } from 'next/server';
import { findUserByLoginName, initDatabase } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { createAccessToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // Initialize database tables if needed
    await initDatabase();

    const body = await request.json();
    const { login_name, password } = body;

    // Validate input
    if (!login_name || !password) {
      return NextResponse.json(
        { detail: 'Login name and password are required' },
        { status: 400 }
      );
    }

    // Find user by login_name
    const user = await findUserByLoginName(login_name);

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
        login_name: user.login_name,
        name: user.name,
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
