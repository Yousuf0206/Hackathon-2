/**
 * Modern Professional Todo Edit Form Component
 * Features clean design and consistent styling with the rest of the app
 */
'use client';

import { useState, FormEvent } from 'react';
import { Todo } from '@/library/types';
import { api, ApiError } from '@/library/api';

interface TodoEditFormProps {
  todo: Todo;
  onSave: () => void;
  onCancel: () => void;
}

export function TodoEditForm({ todo, onSave, onCancel }: TodoEditFormProps) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Please enter a task title');
      return;
    }

    if (trimmedTitle.length > 500) {
      setError('Title must be 500 characters or less');
      return;
    }

    if (description && description.length > 5000) {
      setError('Description must be 5000 characters or less');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.updateTodo(todo.id, trimmedTitle, description || undefined);
      onSave();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError('Task not found - it may have been deleted');
        } else if (err.status === 401) {
          return;
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to update task. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle(todo.title);
    setDescription(todo.description || '');
    setError(null);
    onCancel();
  };

  return (
    <div className="edit-form-container">
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-header">
          <h3>Edit Task</h3>
          <button
            type="button"
            className="close-button"
            onClick={handleCancel}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="error-message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <div className="form-fields">
          <div className="form-group">
            <label htmlFor={`edit-title-${todo.id}`}>Title</label>
            <input
              id={`edit-title-${todo.id}`}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={500}
              disabled={isSubmitting}
              autoFocus
            />
            <div className="char-count">{title.length}/500</div>
          </div>

          <div className="form-group">
            <label htmlFor={`edit-description-${todo.id}`}>
              Description <span className="optional">(optional)</span>
            </label>
            <textarea
              id={`edit-description-${todo.id}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={5000}
              rows={3}
              disabled={isSubmitting}
            />
            <div className="char-count">{description.length}/5000</div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-save"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Saving...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        .edit-form-container {
          background: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--gray-200);
          overflow: hidden;
          animation: slideDown 0.2s ease-out;
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

        .edit-form {
          display: flex;
          flex-direction: column;
        }

        .form-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background: var(--gray-50);
          border-bottom: 1px solid var(--gray-200);
        }

        .form-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-800);
          margin: 0;
        }

        .close-button {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          color: var(--gray-500);
          transition: all var(--transition-fast);
        }

        .close-button:hover {
          background: var(--gray-200);
          color: var(--gray-700);
        }

        .close-button svg {
          width: 18px;
          height: 18px;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 1rem 1.5rem 0;
          padding: 0.75rem 1rem;
          background: var(--error-light);
          border: 1px solid var(--error);
          color: var(--error);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .error-message svg {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .form-fields {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
          position: relative;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-700);
          margin-bottom: 0.5rem;
        }

        .optional {
          color: var(--gray-400);
          font-weight: normal;
        }

        input,
        textarea {
          width: 100%;
          padding: 0.875rem 1rem;
          background: white;
          border: 1px solid var(--gray-300);
          border-radius: var(--radius-md);
          font-size: 0.9375rem;
          color: var(--gray-800);
          transition: all var(--transition-fast);
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px var(--primary-100);
        }

        input::placeholder,
        textarea::placeholder {
          color: var(--gray-400);
        }

        textarea {
          resize: vertical;
          min-height: 80px;
        }

        .char-count {
          position: absolute;
          right: 0.75rem;
          bottom: 0.5rem;
          font-size: 0.75rem;
          color: var(--gray-400);
        }

        .form-group input {
          padding-right: 4rem;
        }

        .form-group textarea {
          padding-bottom: 2rem;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: var(--gray-50);
          border-top: 1px solid var(--gray-200);
        }

        .btn-cancel {
          padding: 0.625rem 1.25rem;
          background: white;
          color: var(--gray-700);
          border: 1px solid var(--gray-300);
          border-radius: var(--radius-md);
          font-weight: 500;
          font-size: 0.9375rem;
          transition: all var(--transition-fast);
        }

        .btn-cancel:hover:not(:disabled) {
          background: var(--gray-100);
          border-color: var(--gray-400);
        }

        .btn-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-save {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 500;
          font-size: 0.9375rem;
          transition: all var(--transition-fast);
        }

        .btn-save:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--primary-700), var(--primary-800));
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }

        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-save svg {
          width: 18px;
          height: 18px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .form-actions {
            flex-direction: column-reverse;
          }

          .btn-cancel,
          .btn-save {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
