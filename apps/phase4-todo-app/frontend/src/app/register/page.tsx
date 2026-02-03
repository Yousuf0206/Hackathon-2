/**
 * Modern Professional Registration Page
 * Features clean design, smooth animations, and professional styling
 */
'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email: string): boolean => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
  };

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['var(--error)', 'var(--warning)', 'var(--info)', 'var(--success)'];

    return {
      strength,
      label: password ? labels[Math.min(strength - 1, 3)] : '',
      color: colors[Math.min(strength - 1, 3)]
    };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Use local API route (same origin)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError('This email is already registered. Please log in instead.');
        } else if (data.detail) {
          setError(data.detail);
        } else {
          setError('Registration failed. Please try again.');
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
      console.error('Registration error:', err);
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="register-container">
        <div className="register-card">
          <div className="card-header">
            <div className="brand-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <h1>Create an account</h1>
            <p>Start organizing your tasks today</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
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
                  placeholder="Create a strong password"
                  disabled={loading}
                  autoComplete="new-password"
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
              {password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${(passwordStrength.strength / 4) * 100}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    />
                  </div>
                  <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  disabled={loading}
                  autoComplete="new-password"
                  style={{
                    borderColor: confirmPassword && password === confirmPassword ? 'var(--success)' : undefined
                  }}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
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
              {confirmPassword && (
                <div className="password-match">
                  {password === confirmPassword ? (
                    <span className="match-success">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                      Passwords match
                    </span>
                  ) : (
                    <span className="match-error">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="card-footer">
            <p>
              Already have an account?{' '}
              <Link href="/login">Sign in</Link>
            </p>
          </div>
        </div>

        <div className="register-illustration">
          <div className="illustration-content">
            <h2>Join thousands of productive people</h2>
            <p>Start managing your tasks efficiently with TaskFlow</p>
            <div className="illustration-features">
              <div className="feature">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Secure & private</span>
              </div>
              <div className="feature">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
                <span>Available anywhere</span>
              </div>
              <div className="feature">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                <span>Lightning fast</span>
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

        .register-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
        }

        .register-card {
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

        .register-form {
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

        .password-strength {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .strength-bar {
          flex: 1;
          height: 4px;
          background: var(--gray-200);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .strength-fill {
          height: 100%;
          transition: all var(--transition-fast);
        }

        .password-strength span {
          font-size: 0.75rem;
          font-weight: 500;
          min-width: 50px;
        }

        .password-match {
          margin-top: 0.5rem;
        }

        .match-success {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--success);
        }

        .match-success svg {
          width: 16px;
          height: 16px;
        }

        .match-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--error);
        }

        .match-error svg {
          width: 16px;
          height: 16px;
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

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
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

        .register-illustration {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          background: linear-gradient(135deg, var(--success), #059669);
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
          .register-container {
            grid-template-columns: 1fr;
          }

          .register-illustration {
            display: none;
          }

          .register-card {
            padding: 2rem;
          }
        }

        @media (max-width: 480px) {
          .register-card {
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
