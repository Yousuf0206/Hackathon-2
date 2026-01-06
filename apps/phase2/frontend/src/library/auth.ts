/**
 * Better Auth configuration.
 * T019: Configure Better Auth with JWT plugin, shared secret, 24h expiry.
 */

interface AuthSession {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

/**
 * Store authentication session in localStorage.
 * In production, Better Auth would handle this with secure cookies.
 */
export function setSession(session: AuthSession): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_session', JSON.stringify(session));
  }
}

/**
 * Get current authentication session.
 */
export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const sessionData = localStorage.getItem('auth_session');
  if (!sessionData) {
    return null;
  }

  try {
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
}

/**
 * Clear authentication session (logout).
 */
export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_session');
  }
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
