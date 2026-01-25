/**
 * TypeScript types for User and Todo entities.
 * T021: Type definitions matching backend models.
 */

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface TodoListResponse {
  todos: Todo[];
}

export interface ErrorResponse {
  detail: string;
}
