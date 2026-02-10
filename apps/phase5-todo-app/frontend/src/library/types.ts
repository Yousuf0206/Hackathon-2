/**
 * TypeScript types for User and Todo entities.
 * T021: Type definitions matching backend models.
 */

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly';
  end_after_count?: number | null;
  end_by_date?: string | null;
  is_active?: boolean;
}

export interface Todo {
  id: string | number;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  tags: string | null;
  due_date: string | null;
  due_time: string | null;
  recurrence_rule_id: number | null;
  recurrence: RecurrenceRule | null;
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

export interface TaskCounts {
  total: number;
  pending: number;
  completed: number;
}

export interface TaskListResponse {
  tasks: Todo[];
  counts: TaskCounts;
}

export interface ErrorResponse {
  detail: string;
}
