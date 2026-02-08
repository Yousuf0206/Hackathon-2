/**
 * POST /api/auth/forgot-password - Request password reset
 */
import { NextRequest, NextResponse } from 'next/server';
import { findUserByLoginName, createPasswordResetToken, initDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await initDatabase();

    const body = await request.json();
    const { login_name } = body;

    if (!login_name) {
      return NextResponse.json(
        { detail: 'Login name is required' },
        { status: 400 }
      );
    }

    // Always return generic success to prevent user enumeration
    const genericSuccess = NextResponse.json({
      message: 'If a matching account was found, a password reset link has been sent.',
    });

    const user = await findUserByLoginName(login_name);
    if (!user || !user.email) {
      return genericSuccess;
    }

    // Generate secure random token (32 bytes hex = 64 chars)
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    // 1-hour TTL
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await createPasswordResetToken(user.id, token, expiresAt);

    // Send email via Resend
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: 'TaskFlow <onboarding@resend.dev>',
        to: user.email,
        subject: 'Reset your TaskFlow password',
        html: `
          <h2>Password Reset</h2>
          <p>Hi ${user.name},</p>
          <p>You requested a password reset for your TaskFlow account.</p>
          <p><a href="${resetLink}">Click here to reset your password</a></p>
          <p>This link expires in 1 hour.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        `,
      });
    } catch (emailError) {
      // Log the reset link for development/testing
      console.log(`Password reset link for ${user.login_name}: ${resetLink}`);
      console.error('Email send error (non-fatal):', emailError);
    }

    return genericSuccess;
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}
