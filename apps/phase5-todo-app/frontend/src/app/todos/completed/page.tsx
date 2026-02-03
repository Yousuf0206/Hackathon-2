/**
 * Completed Tasks Page (Phase IV)
 * Displays only completed tasks sorted by updated_at DESC.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/library/api';
import { Todo, TaskListResponse } from '@/library/types';
import { isAuthenticated, clearSession } from '@/library/auth';
import { TodoList } from '@/components/TodoList';
import { TaskNavigation } from '@/components/TaskNavigation';
import Navbar from '@/components/Navbar';

export const dynamic = 'force-dynamic';

export default function CompletedTasksPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
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
      fetchTasks();
      setAuthChecked(true);
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response: TaskListResponse = await api.getTasks('completed');
      setTodos(response.tasks);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          clearSession();
          router.push('/login');
          return;
        }
        setError(err.message);
      } else {
        setError('Failed to load tasks. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTodoUpdated = () => {
    fetchTasks();
  };

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
                <h1 className="page-title">Completed Tasks</h1>
                <p className="page-subtitle">Tasks you have finished</p>
              </header>

              {error && (
                <div className="error-banner">
                  <span>{error}</span>
                  <button onClick={fetchTasks} className="retry-button">Try Again</button>
                </div>
              )}

              <TaskNavigation />
              <TodoList
                todos={todos}
                isLoading={isLoading}
                onTodoUpdated={handleTodoUpdated}
                source="tasks"
              />
            </div>
          </main>
        </>
      )}
      <style jsx>{`
        .page-wrapper {
          min-height: 100vh;
          background: var(--gray-50);
        }
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
