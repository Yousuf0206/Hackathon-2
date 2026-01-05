'use client';

/**
 * TodoForm component for creating new todos.
 * T036: Form with title input, description textarea, client-side validation.
 */
import { useState, FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';

interface TodoFormProps {
  onTodoCreated: () => void;
}

export function TodoForm({ onTodoCreated }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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
      await api.createTodo(trimmedTitle, description || undefined);

      // Clear form on success
      setTitle('');
      setDescription('');

      // Notify parent to refresh todo list
      onTodoCreated();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create todo. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <h2>Create New Todo</h2>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="title">
          Title <span className="required">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter todo title"
          maxLength={500}
          disabled={isSubmitting}
          required
        />
        <small>{title.length}/500 characters</small>
      </div>

      <div className="form-group">
        <label htmlFor="description">
          Description <span className="optional">(optional)</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter todo description"
          maxLength={5000}
          rows={3}
          disabled={isSubmitting}
        />
        <small>{description.length}/5000 characters</small>
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add Todo'}
      </button>

      <style jsx>{`
        .todo-form {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        h2 {
          margin-top: 0;
          margin-bottom: 1rem;
          color: #333;
        }

        .error-message {
          background-color: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
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
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
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
          font-size: 0.875rem;
        }

        button {
          background-color: #0070f3;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        button:hover:not(:disabled) {
          background-color: #0051cc;
        }

        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
}
