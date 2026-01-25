'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSession, AuthSession } from '@/library/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { id: string; email: string } | null;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  refreshAuth: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  const refreshAuth = () => {
    const session = getSession();
    if (session?.user) {
      setIsAuthenticated(true);
      setUser({
        id: session.user.id,
        email: session.user.email,
      });
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
