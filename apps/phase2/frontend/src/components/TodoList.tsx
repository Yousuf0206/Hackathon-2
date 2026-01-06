/**
 * Modern Professional Todo List Component
 * Features clean design, smooth animations, and polished states
 */
'use client';

import { Todo } from '@/library/types';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  onTodoUpdated: () => void;
}

export function TodoList({ todos, isLoading, onTodoUpdated }: TodoListProps) {
  if (isLoading) {
    return (
      <div className="todo-list">
        <div className="loading-state">
          <div className="loading-spinner">
            <svg viewBox="0 0 50 50">
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth="4"
                strokeDasharray="90, 150"
              />
            </svg>
          </div>
          <h3>Loading your tasks</h3>
          <p>Please wait a moment...</p>
        </div>

        <style jsx>{`
          .todo-list {
            margin-top: 1.5rem;
          }

          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            background: white;
            border-radius: var(--radius-lg);
            border: 1px solid var(--gray-200);
            box-shadow: var(--shadow-sm);
          }

          .loading-spinner {
            width: 48px;
            height: 48px;
            margin-bottom: 1.5rem;
          }

          .loading-spinner svg {
            width: 100%;
            height: 100%;
            animation: rotate 2s linear infinite;
          }

          .loading-spinner circle {
            stroke: var(--primary-500);
            stroke-linecap: round;
            animation: dash 1.5s ease-in-out infinite;
          }

          @keyframes rotate {
            100% { transform: rotate(360deg); }
          }

          @keyframes dash {
            0% {
              stroke-dasharray: 1, 150;
              stroke-dashoffset: 0;
            }
            50% {
              stroke-dasharray: 90, 150;
              stroke-dashoffset: -35;
            }
            100% {
              stroke-dasharray: 90, 150;
              stroke-dashoffset: -124;
            }
          }

          .loading-state h3 {
            font-size: 1.125rem;
            color: var(--gray-800);
            margin: 0 0 0.5rem 0;
          }

          .loading-state p {
            color: var(--gray-500);
            font-size: 0.9375rem;
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="todo-list">
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <div className="empty-content">
            <h3>No tasks yet</h3>
            <p>Create your first task to start being productive</p>
          </div>
          <div className="empty-hint">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Click the button above to add a task
          </div>
        </div>

        <style jsx>{`
          .todo-list {
            margin-top: 1.5rem;
          }

          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            background: white;
            border-radius: var(--radius-lg);
            border: 1px solid var(--gray-200);
            box-shadow: var(--shadow-sm);
            text-align: center;
          }

          .empty-icon {
            width: 80px;
            height: 80px;
            margin-bottom: 1.5rem;
            padding: 1.5rem;
            background: var(--primary-50);
            border-radius: var(--radius-full);
            color: var(--primary-500);
          }

          .empty-icon svg {
            width: 100%;
            height: 100%;
          }

          .empty-content h3 {
            font-size: 1.25rem;
            color: var(--gray-800);
            margin: 0 0 0.5rem 0;
          }

          .empty-content p {
            color: var(--gray-500);
            font-size: 1rem;
            margin: 0;
          }

          .empty-hint {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 1.5rem;
            padding: 0.75rem 1.25rem;
            background: var(--gray-100);
            border-radius: var(--radius-full);
            color: var(--gray-600);
            font-size: 0.875rem;
          }

          .empty-hint svg {
            width: 16px;
            height: 16px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="todo-list">
      <div className="list-header">
        <h2>Your Tasks</h2>
        <span className="task-count">{todos.length} {todos.length === 1 ? 'task' : 'tasks'}</span>
      </div>

      <div className="todos-container">
        {todos.map((todo) => (
          <div key={todo.id} className="todo-item-wrapper">
            <TodoItem
              todo={todo}
              onTodoUpdated={onTodoUpdated}
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        .todo-list {
          margin-top: 1.5rem;
        }

        .list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .list-header h2 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--gray-800);
          margin: 0;
        }

        .task-count {
          padding: 0.375rem 0.75rem;
          background: var(--gray-100);
          border-radius: var(--radius-full);
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--gray-600);
        }

        .todos-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .todo-item-wrapper {
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
