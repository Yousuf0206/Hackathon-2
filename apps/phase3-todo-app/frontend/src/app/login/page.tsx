/**
 * Modern Professional Login Page
 * Features clean design, smooth animations, and professional styling
 */
'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setError('Your session has expired. Please log in again.');
    }
  }, [searchParams]);

  const validateEmail = (email: string): boolean => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email format');
      return;
    }

    setLoading(true);

    try {
      // Use local API route (same origin)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError('Invalid email or password');
        } else if (data.detail) {
          setError(data.detail);
        } else {
          setError('Login failed. Please try again.');
        }
        return;
      }

      // Store the token in localStorage for the API client
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      }

      // Redirect to todos page on success
      router.push('/todos');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="login-container">
        <div className="login-card">
          <div className="card-header">
            <div className="brand-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <h1>Welcome back</h1>
            <p>Enter your credentials to access your tasks</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-banner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <div className="card-footer">
              <p>
                Don&apos;t have an account?{' '}
                <Link href="/register">Create one</Link>
              </p>
            </div>
          </form>
        </div>

        <div className="login-illustration">
          <div className="illustration-content">
            <h2>Stay organized, stay productive</h2>
            <p>Manage your tasks efficiently with our intuitive todo application</p>
            <div className="illustration-features">
              <div className="feature">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                <span>Create and manage tasks</span>
              </div>
              <div className="feature">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                <span>Track your progress</span>
              </div>
              <div className="feature">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                <span>Secure authentication</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-wrapper {
          min-height: 100vh;
          background: var(--gray-50);
        }

        .login-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
        }

        .login-card {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3rem;
          background: white;
        }

        .card-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .brand-logo {
          width: 56px;
          height: 56px;
          margin: 0 auto 1.25rem;
          padding: 1rem;
          background: var(--primary-50);
          border-radius: var(--radius-lg);
          color: var(--primary-600);
        }

        .brand-logo svg {
          width: 100%;
          height: 100%;
        }

        .card-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--gray-900);
          margin: 0 0 0.5rem 0;
        }

        .card-header p {
          color: var(--gray-500);
          margin: 0;
        }

        .login-form {
          max-width: 380px;
          margin: 0 auto;
          width: 100%;
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--error-light);
          border: 1px solid var(--error);
          color: var(--error);
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
          font-size: 0.9375rem;
          font-weight: 500;
        }

        .error-banner svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-700);
          margin-bottom: 0.5rem;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: var(--gray-400);
          pointer-events: none;
        }

        input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          background: white;
          border: 1px solid var(--gray-300);
          border-radius: var(--radius-md);
          font-size: 0.9375rem;
          color: var(--gray-800);
          transition: all var(--transition-fast);
        }

        input:focus {
          outline: none;
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px var(--primary-100);
        }

        input::placeholder {
          color: var(--gray-400);
        }

        input:disabled {
          background: var(--gray-100);
          cursor: not-allowed;
        }

        .toggle-password {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray-400);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .toggle-password:hover {
          color: var(--gray-600);
          background: var(--gray-100);
        }

        .toggle-password svg {
          width: 20px;
          height: 20px;
        }

        input[type="password"] {
          padding-right: 3rem;
        }

        .btn-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: 1rem;
          font-weight: 600;
          transition: all var(--transition-fast);
          margin-top: 0.5rem;
        }

        .btn-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--primary-700), var(--primary-800));
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          margin: 1.5rem 0;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--gray-300);
        }

        .divider span {
          padding: 0 1rem;
          color: var(--gray-500);
          font-size: 0.875rem;
        }

        .card-footer {
          text-align: center;
          margin-top: 2rem;
        }

        .card-footer p {
          color: var(--gray-600);
          margin: 0;
        }

        .card-footer a {
          color: var(--primary-600);
          font-weight: 500;
        }

        .card-footer a:hover {
          color: var(--primary-700);
        }

        .login-illustration {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
        }

        .illustration-content {
          max-width: 400px;
          text-align: center;
          color: white;
        }

        .illustration-content h2 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
          color: white;
        }

        .illustration-content > p {
          font-size: 1.125rem;
          opacity: 0.9;
          margin: 0 0 2rem 0;
        }

        .illustration-features {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md);
        }

        .feature svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .feature span {
          font-size: 0.9375rem;
        }

        @media (max-width: 1024px) {
          .login-container {
            grid-template-columns: 1fr;
          }

          .login-illustration {
            display: none;
          }

          .login-card {
            padding: 2rem;
          }
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 1.5rem;
          }

          .card-header {
            margin-bottom: 2rem;
          }

          .brand-logo {
            width: 48px;
            height: 48px;
          }

          .card-header h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="page-wrapper">
        <div className="login-container">
          <div className="login-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
