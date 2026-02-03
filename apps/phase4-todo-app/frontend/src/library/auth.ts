/**
 * Authentication utilities using localStorage for JWT token storage.
 * T019: JWT-based authentication with 24h expiry.
 */

export interface AuthSession {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

/**
 * Get current authentication session from localStorage.
 */
export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('auth_user');

  if (!token || !userStr) return null;

  try {
    const user = JSON.parse(userStr);
    return { token, user };
  } catch {
    return null;
  }
}

/**
 * Clear authentication session (logout).
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

/**
 * Check if user is authenticated.
 */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/**
 * Get authentication token for API requests.
 */
export function getToken(): string | null {
  const session = getSession();
  return session?.token || null;
}

/**
 * Sign out the user and redirect to login.
 */
export function signOut(): void {
  clearSession();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
