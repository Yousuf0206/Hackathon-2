/**
 * POST /api/auth/register - Register a new user
 */
import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, createUser } from '@/lib/db';
import { hashPassword } from '@/lib/password';
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

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { detail: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { detail: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = createUser(email, passwordHash);

    // Generate JWT token
    const token = await createAccessToken(user.id);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}
