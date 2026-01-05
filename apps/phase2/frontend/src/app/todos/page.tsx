/**
 * Modern Professional Todo Dashboard
 * Features clean design, smooth animations, and professional layout
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { Todo, TodoListResponse } from '@/lib/types';
import { isAuthenticated } from '@/lib/auth';
import { TodoForm } from '@/components/TodoForm';
import { TodoList } from '@/components/TodoList';
import { Navbar } from '@/components/Navbar';

export default function TodosPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  // Update stats when todos change
  useEffect(() => {
    const completed = todos.filter(t => t.completed).length;
    setStats({
      total: todos.length,
      completed,
      pending: todos.length - completed
    });
  }, [todos]);

  const fetchTodos = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response: TodoListResponse = await api.getTodos();
      setTodos(response.todos);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          return;
        }
        setError(err.message);
      } else {
        setError('Failed to load todos. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTodoCreated = () => {
    fetchTodos();
  };

  const handleTodoUpdated = () => {
    fetchTodos();
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="main-content">
        <div className="container">
          {/* Header Section */}
          <header className="dashboard-header">
            <div className="header-content">
              <h1 className="page-title">My Tasks</h1>
              <p className="page-subtitle">Organize and track your daily goals</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon stat-total">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.total}</span>
                  <span className="stat-label">Total Tasks</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-pending">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.pending}</span>
                  <span className="stat-label">Pending</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-completed">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22,4 12,14.01 9,11.01" />
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.completed}</span>
                  <span className="stat-label">Completed</span>
                </div>
              </div>
            </div>
          </header>

          {/* Error Banner */}
          {error && (
            <div className="error-banner">
              <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
              <button onClick={fetchTodos} className="retry-button">
                Try Again
              </button>
            </div>
          )}

          {/* Todo Form and List */}
          <div className="dashboard-content">
            <TodoForm onTodoCreated={handleTodoCreated} />
            <TodoList
              todos={todos}
              isLoading={isLoading}
              onTodoUpdated={handleTodoUpdated}
            />
          </div>
        </div>
      </main>

      <style jsx>{`
        .page-wrapper {
          min-height: 100vh;
          background: var(--gray-50);
        }

        .main-content {
          padding: 2rem 1rem;
        }

        .container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: 2rem;
        }

        .header-content {
          text-align: center;
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 0.5rem;
          letter-spacing: -0.025em;
        }

        .page-subtitle {
          color: var(--gray-500);
          font-size: 1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .stat-card {
          background: white;
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--gray-200);
          transition: all var(--transition-fast);
        }

        .stat-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon svg {
          width: 24px;
          height: 24px;
        }

        .stat-total {
          background: var(--primary-100);
          color: var(--primary-600);
        }

        .stat-pending {
          background: var(--warning-light);
          color: var(--warning);
        }

        .stat-completed {
          background: var(--success-light);
          color: var(--success);
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--gray-900);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--gray-500);
          margin-top: 0.25rem;
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
          animation: slideDown 0.3s ease-out;
        }

        .error-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
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
          transition: all var(--transition-fast);
        }

        .retry-button:hover {
          background: #dc2626;
        }

        .dashboard-content {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .page-title {
            font-size: 1.75rem;
          }

          .stat-card {
            padding: 1rem;
          }

          .stat-icon {
            width: 44px;
            height: 44px;
          }

          .stat-value {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
