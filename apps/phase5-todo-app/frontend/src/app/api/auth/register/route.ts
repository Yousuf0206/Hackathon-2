/**
 * POST /api/auth/register - Register a new user
 */
import { NextRequest, NextResponse } from 'next/server';
import { findUserByLoginName, findUserByEmail, createUser, initDatabase } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { createAccessToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // Initialize database tables if needed
    await initDatabase();

    const body = await request.json();
    const { login_name, name, father_name, email, phone, biodata, password } = body;

    // Validate required fields
    if (!login_name || !name || !father_name || !password) {
      return NextResponse.json(
        { detail: 'Login name, name, father name, and password are required' },
        { status: 400 }
      );
    }

    // Validate login_name format: alphanumeric + underscore, 3-30 chars
    const loginNamePattern = /^[a-zA-Z0-9_]{3,30}$/;
    if (!loginNamePattern.test(login_name)) {
      return NextResponse.json(
        { detail: 'Login name must be 3-30 characters, alphanumeric and underscore only' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email) {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(email)) {
        return NextResponse.json(
          { detail: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { detail: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Validate biodata length
    if (biodata && biodata.length > 500) {
      return NextResponse.json(
        { detail: 'Biodata must be 500 characters or fewer' },
        { status: 400 }
      );
    }

    // Check if login_name already exists
    const existingUser = await findUserByLoginName(login_name);
    if (existingUser) {
      return NextResponse.json(
        { detail: 'Login name already taken' },
        { status: 409 }
      );
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await findUserByEmail(email);
      if (existingEmail) {
        return NextResponse.json(
          { detail: 'Email already registered' },
          { status: 409 }
        );
      }
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await createUser(login_name, passwordHash, name, father_name, email, phone, biodata);

    // Generate JWT token
    const token = await createAccessToken(user.id);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          login_name: user.login_name,
          name: user.name,
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
