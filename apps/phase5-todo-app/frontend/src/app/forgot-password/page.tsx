/**
 * Forgot Password Page
 * Enter login name to receive password reset email
 */
'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  const [loginName, setLoginName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!loginName) {
      setError('Please enter your login name');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_name: loginName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Something went wrong. Please try again.');
        return;
      }

      setSuccess(data.message || 'If a matching account was found, a password reset link has been sent.');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="forgot-container">
        <div className="forgot-card">
          <div className="card-header">
            <div className="brand-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1>Forgot Password?</h1>
            <p>Enter your login name and we&apos;ll send a reset link to your email</p>
          </div>

          <form onSubmit={handleSubmit} className="forgot-form">
            {success && (
              <div className="success-banner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                {success}
              </div>
            )}

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
              <label htmlFor="loginName">Login Name</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="loginName"
                  type="text"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  placeholder="Your login name"
                  disabled={loading}
                  autoComplete="username"
                />
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
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className="card-footer">
            <p>
              <Link href="/login">Back to Login</Link>
            </p>
          </div>
        </div>

        <div className="forgot-illustration">
          <div className="illustration-content">
            <h2>Don&apos;t worry, it happens!</h2>
            <p>We&apos;ll help you get back into your account</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-wrapper {
          min-height: 100vh;
          background: var(--gray-50);
        }

        .forgot-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
        }

        .forgot-card {
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

        .forgot-form {
          max-width: 380px;
          margin: 0 auto;
          width: 100%;
        }

        .success-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #ecfdf5;
          border: 1px solid var(--success);
          color: #065f46;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
          font-size: 0.9375rem;
          font-weight: 500;
        }

        .success-banner svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          color: var(--success);
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

        .forgot-illustration {
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
          margin: 0;
        }

        @media (max-width: 1024px) {
          .forgot-container {
            grid-template-columns: 1fr;
          }

          .forgot-illustration {
            display: none;
          }

          .forgot-card {
            padding: 2rem;
          }
        }

        @media (max-width: 480px) {
          .forgot-card {
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
