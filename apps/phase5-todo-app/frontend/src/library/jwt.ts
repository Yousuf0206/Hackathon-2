/**
 * JWT utilities for token creation and verification
 * Using jose library for Edge-compatible JWT operations
 */

import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || 'supersecretkeyfordevelopment'
);

const ALGORITHM = 'HS256';
const ACCESS_TOKEN_EXPIRE_HOURS = 24;

export async function createAccessToken(userId: string): Promise<string> {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_EXPIRE_HOURS}h`)
    .sign(SECRET);

  return token;
}

export async function verifyToken(token: string): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      algorithms: [ALGORITHM],
    });
    return payload as { sub: string };
  } catch {
    return null;
  }
}

export async function extractUserId(token: string): Promise<string | null> {
  const payload = await verifyToken(token);
  return payload?.sub || null;
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}
