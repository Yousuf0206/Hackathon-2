/**
 * Password hashing utilities using Web Crypto API (Edge-compatible)
 */

// Simple bcrypt-like hashing using PBKDF2 (works in Edge runtime)
const ITERATIONS = 100000;
const KEY_LENGTH = 64;

async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    KEY_LENGTH * 8
  );
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToUint8Array(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g) || [];
  return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derivedKey = await deriveKey(password, salt);

  const saltHex = arrayBufferToHex(salt.buffer as ArrayBuffer);
  const hashHex = arrayBufferToHex(derivedKey);

  // Format: salt$hash
  return `${saltHex}$${hashHex}`;
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  const [saltHex, storedHashHex] = hashedPassword.split('$');
  if (!saltHex || !storedHashHex) {
    return false;
  }

  const salt = hexToUint8Array(saltHex);
  const derivedKey = await deriveKey(plainPassword, salt);
  const derivedHashHex = arrayBufferToHex(derivedKey);

  return derivedHashHex === storedHashHex;
}
