/**
 * Modern Professional Todo Item Component
 * Features clean design, smooth animations, and polished interactions
 */
'use client';

import { useState } from 'react';
import { Todo } from '@/lib/types';
import { api, ApiError } from '@/lib/api';
import { TodoEditForm } from './TodoEditForm';

interface TodoItemProps {
  todo: Todo;
  onTodoUpdated: () => void;
}

export function TodoItem({ todo, onTodoUpdated }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isTogglingComplete, setIsTogglingComplete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleComplete = async () => {
    setError(null);
    setIsTogglingComplete(true);

    try {
      await api.toggleComplete(todo.id, !todo.completed);
      onTodoUpdated();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError('Task not found - it may have been deleted');
        } else if (err.status === 401) {
          return;
        } else {
          setError('Failed to update task');
        }
      } else {
        setError('Network error');
      }
    } finally {
      setIsTogglingComplete(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      await api.deleteTodo(todo.id);
      onTodoUpdated();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError('Task not found - it may have been deleted');
          setTimeout(() => onTodoUpdated(), 1000);
        } else if (err.status === 401) {
          return;
        } else {
          setError('Failed to delete task');
        }
      } else {
        setError('Network error');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditComplete = () => {
    setIsEditing(false);
    onTodoUpdated();
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <TodoEditForm
        todo={todo}
        onSave={handleEditComplete}
        onCancel={handleEditCancel}
      />
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      {error && (
        <div className="error-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="item-content">
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={handleToggleComplete}
            disabled={isTogglingComplete || isDeleting}
          />
          <span className="checkmark">
            {todo.completed && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            )}
          </span>
        </label>

        <div className="task-details">
          <h3 className={todo.completed ? 'completed-title' : ''}>
            {todo.title}
          </h3>
          {todo.description && (
            <p className="task-description">{todo.description}</p>
          )}
          <div className="task-meta">
            <span className="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Created {formatDate(todo.created_at)}
            </span>
            {todo.updated_at !== todo.created_at && (
              <span className="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Updated {formatDate(todo.updated_at)}
              </span>
            )}
          </div>
        </div>

        <div className="task-actions">
          <button
            onClick={() => setIsEditing(true)}
            disabled={isDeleting || isTogglingComplete}
            className="btn-action btn-edit"
            title="Edit task"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting || isTogglingComplete}
            className="btn-action btn-delete"
            title="Delete task"
          >
            {isDeleting ? (
              <span className="delete-spinner"></span>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .todo-item {
          background: white;
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          transition: all var(--transition-fast);
          box-shadow: var(--shadow-sm);
        }

        .todo-item:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--gray-300);
        }

        .todo-item.completed {
          background: var(--gray-50);
          opacity: 0.9;
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: var(--error-light);
          border: 1px solid var(--error);
          color: var(--error);
          border-radius: var(--radius-md);
          margin-bottom: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .error-banner svg {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .item-content {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .checkbox-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .checkbox-wrapper input {
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
          z-index: 1;
        }

        .checkmark {
          width: 24px;
          height: 24px;
          border: 2px solid var(--gray-300);
          border-radius: var(--radius-md);
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .checkbox-wrapper input:checked + .checkmark {
          background: var(--success);
          border-color: var(--success);
        }

        .checkmark svg {
          width: 14px;
          height: 14px;
          color: white;
          opacity: 0;
          transform: scale(0.5);
          transition: all var(--transition-fast);
        }

        .checkbox-wrapper input:checked + .checkmark svg {
          opacity: 1;
          transform: scale(1);
        }

        .checkbox-wrapper:hover .checkmark {
          border-color: var(--success);
        }

        .task-details {
          flex: 1;
          min-width: 0;
        }

        h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.0625rem;
          font-weight: 600;
          color: var(--gray-900);
          line-height: 1.4;
          word-wrap: break-word;
        }

        .completed-title {
          text-decoration: line-through;
          color: var(--gray-500);
        }

        .task-description {
          margin: 0 0 0.75rem 0;
          color: var(--gray-600);
          font-size: 0.9375rem;
          line-height: 1.5;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .task-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          color: var(--gray-400);
        }

        .meta-item svg {
          width: 14px;
          height: 14px;
        }

        .task-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .btn-action {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          color: var(--gray-500);
          background: var(--gray-100);
          transition: all var(--transition-fast);
        }

        .btn-action svg {
          width: 18px;
          height: 18px;
        }

        .btn-action:hover:not(:disabled) {
          background: var(--gray-200);
          color: var(--gray-700);
        }

        .btn-edit:hover:not(:disabled) {
          background: var(--info-light);
          color: var(--info);
        }

        .btn-delete:hover:not(:disabled) {
          background: var(--error-light);
          color: var(--error);
        }

        .btn-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .delete-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid var(--gray-300);
          border-top-color: var(--error);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .todo-item {
            padding: 1rem;
          }

          .item-content {
            flex-wrap: wrap;
          }

          .task-details {
            order: 1;
            width: calc(100% - 32px);
          }

          .checkbox-wrapper {
            order: 0;
          }

          .task-actions {
            order: 2;
            width: 100%;
            justify-content: flex-end;
            margin-top: 0.75rem;
            padding-top: 0.75rem;
            border-top: 1px solid var(--gray-100);
          }
        }
      `}</style>
    </div>
  );
}
