/**
 * Centralized API client with automatic JWT attachment.
 * T020: API client with JWT from localStorage, error handling, 401 redirect.
 */

// Use local API routes (same origin) - no external backend needed
const API_URL = '';

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Get the authentication token from localStorage.
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Clear authentication data from localStorage.
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

/**
 * Make an authenticated API request.
 * Automatically attaches JWT token from localStorage.
 * Handles 401 errors by redirecting to login.
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Get token from localStorage
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Attach JWT token if available from Better Auth
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized (token expired or invalid)
    if (response.status === 401) {
      // Clear auth data from localStorage
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login?expired=true';
      }
      throw new ApiError(401, 'Unauthorized - please log in again');
    }

    // Handle other error responses
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      let errorDetails;

      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
        errorDetails = errorData;
      } catch {
        // Response body is not JSON
      }

      throw new ApiError(response.status, errorMessage, errorDetails);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    // Parse JSON response
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network error or other fetch failure
    throw new ApiError(0, 'Network error - please check your connection');
  }
}

/**
 * API client methods for common operations.
 */
export const api = {
  // Task endpoints (Phase IV task view pages - uses Task model with due_date/due_time)
  getTasks: (status: 'all' | 'pending' | 'completed' = 'all') =>
    apiRequest(`/api/tasks?status=${status}`),

  createTask: (
    title: string, description: string | null,
    due_date?: string | null, due_time?: string | null,
    priority?: string, tags?: string | null,
    recurrence?: { frequency: string; end_after_count?: number | null; end_by_date?: string | null } | null
  ) =>
    apiRequest('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title, description,
        due_date: due_date || null, due_time: due_time || null,
        priority: priority || 'medium', tags: tags || null,
        recurrence: recurrence || null,
      }),
    }),

  toggleTaskComplete: (id: number, completed: boolean) =>
    apiRequest(`/api/tasks/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    }),

  updateTask: (
    id: number, title: string, description: string | null,
    priority?: string, tags?: string | null,
    due_date?: string | null, due_time?: string | null,
    recurrence?: { frequency: string; end_after_count?: number | null; end_by_date?: string | null } | null
  ) =>
    apiRequest(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title, description,
        priority, tags,
        due_date, due_time,
        recurrence: recurrence || null,
      }),
    }),

  deleteTask: (id: number) =>
    apiRequest(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),

  // Todo endpoints (Better Auth handles auth at the session level)
  getTodos: () => apiRequest('/api/todos'),

  createTodo: (title: string, description: string | null) =>
    apiRequest('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    }),

  getTodo: (id: string) => apiRequest(`/api/todos/${id}`),

  updateTodo: (id: string, title: string, description: string | null) =>
    apiRequest(`/api/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, description }),
    }),

  toggleComplete: (id: string, completed: boolean) =>
    apiRequest(`/api/todos/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    }),

  deleteTodo: (id: string) =>
    apiRequest(`/api/todos/${id}`, {
      method: 'DELETE',
    }),
};
