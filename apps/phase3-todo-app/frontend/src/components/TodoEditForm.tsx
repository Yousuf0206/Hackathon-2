'use client';

/**
 * TodoEditForm component for editing todo title and description.
 * T048: Form with pre-filled values, Save and Cancel buttons.
 */
import { useState, FormEvent } from 'react';
import { Todo } from '@/lib/types';
import { api, ApiError } from '@/lib/api';

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

    // Client-side validation
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Title is required');
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
          setError('Todo not found - it may have been deleted');
        } else if (err.status === 401) {
          // Will redirect to login automatically
          return;
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to update todo. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setTitle(todo.title);
    setDescription(todo.description || '');
    setError(null);
    onCancel();
  };

  return (
    <div className="todo-edit-form">
      <form onSubmit={handleSubmit}>
        <h3>Edit Todo</h3>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor={`edit-title-${todo.id}`}>
            Title <span className="required">*</span>
          </label>
          <input
            id={`edit-title-${todo.id}`}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={500}
            disabled={isSubmitting}
            required
            autoFocus
          />
          <small>{title.length}/500 characters</small>
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
          <small>{description.length}/5000 characters</small>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-save"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="btn-cancel"
          >
            Cancel
          </button>
        </div>
      </form>

      <style jsx>{`
        .todo-edit-form {
          background: white;
          border: 2px solid #0070f3;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          color: #333;
          font-size: 1rem;
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

        .form-group {
          margin-bottom: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
          font-size: 0.875rem;
        }

        .required {
          color: #c33;
        }

        .optional {
          color: #666;
          font-weight: normal;
        }

        input,
        textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9375rem;
          font-family: inherit;
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: #0070f3;
        }

        input:disabled,
        textarea:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        small {
          display: block;
          margin-top: 0.25rem;
          color: #666;
          font-size: 0.8125rem;
        }

        .form-actions {
          display: flex;
          gap: 0.5rem;
        }

        button {
          flex: 1;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .btn-save {
          background-color: #0070f3;
          color: white;
        }

        .btn-save:hover:not(:disabled) {
          background-color: #0051cc;
        }

        .btn-cancel {
          background-color: #fff;
          color: #333;
          border: 1px solid #ddd;
        }

        .btn-cancel:hover:not(:disabled) {
          background-color: #f5f5f5;
        }
      `}</style>
    </div>
  );
}
