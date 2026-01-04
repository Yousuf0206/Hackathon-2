'use client';

/**
 * TodoList component for displaying list of todos.
 * T035: Display todos with title, description, timestamp, empty state.
 */
import { Todo } from '@/lib/types';
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
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading todos...</p>
        </div>

        <style jsx>{`
          .todo-list {
            margin-top: 2rem;
          }

          .loading {
            text-align: center;
            padding: 3rem 1rem;
            color: #666;
          }

          .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #0070f3;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="todo-list">
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h2>No todos yet</h2>
          <p>Create your first todo to get started!</p>
        </div>

        <style jsx>{`
          .todo-list {
            margin-top: 2rem;
          }

          .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .empty-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }

          .empty-state h2 {
            margin: 0 0 0.5rem 0;
            color: #333;
          }

          .empty-state p {
            margin: 0;
            color: #666;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="todo-list">
      <h2>Your Todos ({todos.length})</h2>

      <div className="todos">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onTodoUpdated={onTodoUpdated}
          />
        ))}
      </div>

      <style jsx>{`
        .todo-list {
          margin-top: 2rem;
        }

        h2 {
          margin-bottom: 1rem;
          color: #333;
        }

        .todos {
          /* Container for todo items */
        }
      `}</style>
    </div>
  );
}
