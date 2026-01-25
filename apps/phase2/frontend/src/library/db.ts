/**
 * Simple in-memory database with global persistence
 * Uses Node.js global to persist data between API calls in dev mode
 * For production on Vercel, use Vercel Postgres or Vercel KV
 */

// Types
export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
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

interface Database {
  users: User[];
  todos: Todo[];
}

// Use global to persist across hot reloads in development
// and across API route invocations
const globalForDb = globalThis as unknown as {
  db: Database | undefined;
};

// Initialize or get existing database
function getDb(): Database {
  if (!globalForDb.db) {
    globalForDb.db = {
      users: [],
      todos: [],
    };
  }
  return globalForDb.db;
}

// Generate UUID
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// User operations
export function findUserByEmail(email: string): User | undefined {
  const db = getDb();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  const db = getDb();
  return db.users.find(u => u.id === id);
}

export function createUser(email: string, passwordHash: string): User {
  const db = getDb();
  const now = new Date().toISOString();
  const user: User = {
    id: generateId(),
    email: email.toLowerCase(),
    password_hash: passwordHash,
    created_at: now,
    updated_at: now,
  };
  db.users.push(user);
  return user;
}

// Todo operations
export function findTodosByUserId(userId: string): Todo[] {
  const db = getDb();
  return db.todos.filter(t => t.user_id === userId);
}

export function findTodoById(id: string): Todo | undefined {
  const db = getDb();
  return db.todos.find(t => t.id === id);
}

export function findTodoByIdAndUserId(id: string, userId: string): Todo | undefined {
  const db = getDb();
  return db.todos.find(t => t.id === id && t.user_id === userId);
}

export function createTodo(userId: string, title: string, description: string | null): Todo {
  const db = getDb();
  const now = new Date().toISOString();
  const todo: Todo = {
    id: generateId(),
    user_id: userId,
    title,
    description,
    completed: false,
    created_at: now,
    updated_at: now,
  };
  db.todos.push(todo);
  return todo;
}

export function updateTodo(id: string, userId: string, updates: Partial<Pick<Todo, 'title' | 'description' | 'completed'>>): Todo | null {
  const db = getDb();
  const index = db.todos.findIndex(t => t.id === id && t.user_id === userId);
  if (index === -1) return null;

  db.todos[index] = {
    ...db.todos[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return db.todos[index];
}

export function deleteTodo(id: string, userId: string): boolean {
  const db = getDb();
  const index = db.todos.findIndex(t => t.id === id && t.user_id === userId);
  if (index === -1) return false;

  db.todos.splice(index, 1);
  return true;
}

// Export database for debugging
export function getDatabase(): Database {
  return getDb();
}
