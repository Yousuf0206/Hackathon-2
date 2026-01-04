'use client';

/**
 * TodoItem component for displaying and managing a single todo.
 * T044: Checkbox for completion, title with strikethrough, description.
 * T046: Toggle completion handler.
 * T049: Edit mode with TodoEditForm.
 * T051: Delete button with confirmation.
 */
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
          setError('Todo not found - it may have been deleted');
        } else if (err.status === 401) {
          // Will redirect to login automatically
          return;
        } else {
          setError('Failed to update todo');
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
      'Are you sure you want to delete this todo? This action cannot be undone.'
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
          setError('Todo not found - it may have been deleted');
          // Still refresh the list
          setTimeout(() => onTodoUpdated(), 1000);
        } else if (err.status === 401) {
          return;
        } else {
          setError('Failed to delete todo');
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

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="todo-content">
        <div className="todo-checkbox">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={handleToggleComplete}
            disabled={isTogglingComplete || isDeleting}
            aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
          />
        </div>

        <div className="todo-details">
          <h3 className={todo.completed ? 'strikethrough' : ''}>
            {todo.title}
          </h3>
          {todo.description && (
            <p className="todo-description">{todo.description}</p>
          )}
          <div className="todo-metadata">
            <span className="todo-date">
              Created: {new Date(todo.created_at).toLocaleDateString()}
            </span>
            {todo.updated_at !== todo.created_at && (
              <span className="todo-date">
                Updated: {new Date(todo.updated_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="todo-actions">
          <button
            onClick={() => setIsEditing(true)}
            disabled={isDeleting || isTogglingComplete}
            className="btn-edit"
            aria-label={`Edit "${todo.title}"`}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting || isTogglingComplete}
            className="btn-delete"
            aria-label={`Delete "${todo.title}"`}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .todo-item {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          transition: all 0.2s;
        }

        .todo-item:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .todo-item.completed {
          opacity: 0.8;
          background-color: #f8f9fa;
        }

        .error-message {
          background-color: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 0.5rem;
          border-radius: 4px;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
        }

        .todo-content {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .todo-checkbox {
          flex-shrink: 0;
          padding-top: 0.25rem;
        }

        .todo-checkbox input[type='checkbox'] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .todo-checkbox input[type='checkbox']:disabled {
          cursor: not-allowed;
        }

        .todo-details {
          flex-grow: 1;
          min-width: 0;
        }

        h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          color: #333;
          word-wrap: break-word;
        }

        h3.strikethrough {
          text-decoration: line-through;
          color: #999;
        }

        .todo-description {
          margin: 0 0 0.5rem 0;
          color: #666;
          font-size: 0.9375rem;
          line-height: 1.5;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .todo-metadata {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .todo-date {
          font-size: 0.8125rem;
          color: #999;
        }

        .todo-actions {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          white-space: nowrap;
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .btn-edit {
          background-color: #0070f3;
          color: white;
        }

        .btn-edit:hover:not(:disabled) {
          background-color: #0051cc;
        }

        .btn-delete {
          background-color: #fff;
          color: #c33;
          border: 1px solid #c33;
        }

        .btn-delete:hover:not(:disabled) {
          background-color: #c33;
          color: white;
        }

        @media (max-width: 640px) {
          .todo-content {
            flex-direction: column;
          }

          .todo-actions {
            flex-direction: row;
            width: 100%;
          }

          .todo-actions button {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}
