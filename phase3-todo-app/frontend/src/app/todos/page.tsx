'use client';

/**
 * Todos dashboard page (protected route).
 * T037: Fetch todos on load, render TodoList and TodoForm components.
 */
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

  const fetchTodos = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response: TodoListResponse = await api.getTodos();
      setTodos(response.todos);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          // Will redirect to login automatically
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
    <div className="page-container">
      <Navbar />

      <main className="main-content">
        <div className="container">
          <header className="page-header">
            <h1>My Todos</h1>
            <p>Manage your tasks and stay organized</p>
          </header>

          {error && (
            <div className="error-banner">
              <strong>Error:</strong> {error}
              <button onClick={fetchTodos} className="retry-button">
                Retry
              </button>
            </div>
          )}

          <TodoForm onTodoCreated={handleTodoCreated} />

          <TodoList
            todos={todos}
            isLoading={isLoading}
            onTodoUpdated={handleTodoUpdated}
          />
        </div>
      </main>

      <style jsx>{`
        .page-container {
          min-height: 100vh;
          background-color: #f5f5f5;
        }

        .main-content {
          padding: 2rem 1rem;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
        }

        .page-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2.5rem;
          color: #333;
        }

        .page-header p {
          margin: 0;
          color: #666;
          font-size: 1.125rem;
        }

        .error-banner {
          background-color: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .retry-button {
          background-color: #c33;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
        }

        .retry-button:hover {
          background-color: #a22;
        }

        @media (max-width: 640px) {
          .page-header h1 {
            font-size: 2rem;
          }

          .error-banner {
            flex-direction: column;
            align-items: flex-start;
          }

          .retry-button {
            width: 100%;
          }
        }
      `}</style>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            'Helvetica Neue', Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
}
