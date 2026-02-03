/**
 * Total Tasks Summary Page (Phase IV)
 * Displays summary counts (N total, N pending, N completed) with navigation.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/library/api';
import { TaskCounts, TaskListResponse } from '@/library/types';
import { isAuthenticated, clearSession } from '@/library/auth';
import { TaskNavigation } from '@/components/TaskNavigation';
import Navbar from '@/components/Navbar';

export const dynamic = 'force-dynamic';

export default function SummaryPage() {
  const router = useRouter();
  const [counts, setCounts] = useState<TaskCounts>({ total: 0, pending: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = isAuthenticated();
      if (!authenticated) {
        router.push('/login');
        setAuthChecked(true);
        return;
      }
      fetchSummary();
      setAuthChecked(true);
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response: TaskListResponse = await api.getTasks('all');
      setCounts(response.counts);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          clearSession();
          router.push('/login');
          return;
        }
        setError(err.message);
      } else {
        setError('Failed to load summary. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const completionRate = counts.total > 0
    ? Math.round((counts.completed / counts.total) * 100)
    : 0;

  return (
    <div className="page-wrapper">
      {!authChecked ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      ) : (
        <>
          <Navbar />
          <main className="main-content">
            <div className="container">
              <header className="page-header">
                <h1 className="page-title">Task Summary</h1>
                <p className="page-subtitle">Overview of your task progress</p>
              </header>

              {error && (
                <div className="error-banner">
                  <span>{error}</span>
                  <button onClick={fetchSummary} className="retry-button">Try Again</button>
                </div>
              )}

              <TaskNavigation />

              {isLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading summary...</p>
                </div>
              ) : (
                <div className="summary-grid">
                  <div className="summary-card total">
                    <div className="card-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                    </div>
                    <div className="card-value">{counts.total}</div>
                    <div className="card-label">Total Tasks</div>
                  </div>

                  <div className="summary-card pending">
                    <div className="card-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                    </div>
                    <div className="card-value">{counts.pending}</div>
                    <div className="card-label">Pending</div>
                  </div>

                  <div className="summary-card completed">
                    <div className="card-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22,4 12,14.01 9,11.01" />
                      </svg>
                    </div>
                    <div className="card-value">{counts.completed}</div>
                    <div className="card-label">Completed</div>
                  </div>

                  <div className="summary-card rate">
                    <div className="card-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                      </svg>
                    </div>
                    <div className="card-value">{completionRate}%</div>
                    <div className="card-label">Completion Rate</div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </>
      )}
      <style jsx>{`
        .page-wrapper {
          min-height: 100vh;
          background: var(--gray-50);
        }
        .loading-container, .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
        }
        .loading-container {
          min-height: 100vh;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--gray-200);
          border-top-color: var(--primary-600);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        .main-content {
          padding: 2rem 1rem;
        }
        .container {
          max-width: 1000px;
          margin: 0 auto;
        }
        .page-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 0.5rem;
        }
        .page-subtitle {
          color: var(--gray-500);
          font-size: 1rem;
        }
        .error-banner {
          background: var(--error-light);
          border: 1px solid var(--error);
          color: var(--error);
          padding: 1rem 1.25rem;
          border-radius: var(--radius-lg);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .error-banner span {
          flex: 1;
          font-weight: 500;
        }
        .retry-button {
          padding: 0.5rem 1rem;
          background: var(--error);
          color: white;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 500;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }
        .summary-card {
          background: white;
          border-radius: var(--radius-lg);
          padding: 2rem;
          text-align: center;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--gray-200);
          transition: all 0.2s ease;
        }
        .summary-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        .card-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }
        .card-icon svg {
          width: 28px;
          height: 28px;
        }
        .total .card-icon {
          background: var(--primary-100);
          color: var(--primary-600);
        }
        .pending .card-icon {
          background: var(--warning-light);
          color: var(--warning);
        }
        .completed .card-icon {
          background: var(--success-light);
          color: var(--success);
        }
        .rate .card-icon {
          background: #ede9fe;
          color: #7c3aed;
        }
        .card-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--gray-900);
          line-height: 1;
          margin-bottom: 0.5rem;
        }
        .card-label {
          font-size: 0.9375rem;
          color: var(--gray-500);
          font-weight: 500;
        }
        .progress-bar {
          margin-top: 1rem;
          height: 8px;
          background: var(--gray-100);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #7c3aed, #a78bfa);
          border-radius: var(--radius-full);
          transition: width 0.5s ease;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 640px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }
          .card-value {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
