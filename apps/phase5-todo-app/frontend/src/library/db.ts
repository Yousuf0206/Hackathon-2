/**
 * Database module using Neon Serverless Postgres (Vercel Postgres)
 * Falls back to in-memory storage for local development without database
 */

import { neon } from '@neondatabase/serverless';

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

// Check if we have a database URL configured
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

// Create SQL client if database URL is available
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

// ============================================
// In-memory fallback for local development
// ============================================
interface InMemoryDatabase {
  users: User[];
  todos: Todo[];
}

const globalForDb = globalThis as unknown as {
  inMemoryDb: InMemoryDatabase | undefined;
};

function getInMemoryDb(): InMemoryDatabase {
  if (!globalForDb.inMemoryDb) {
    globalForDb.inMemoryDb = { users: [], todos: [] };
  }
  return globalForDb.inMemoryDb;
}

// Generate UUID
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============================================
// Initialize database tables
// ============================================
export async function initDatabase(): Promise<void> {
  if (!sql) {
    console.log('No DATABASE_URL configured, using in-memory storage');
    return;
  }

  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create todos table
    await sql`
      CREATE TABLE IF NOT EXISTS todos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create index on user_id for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id)
    `;

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// ============================================
// User operations
// ============================================
export async function findUserByEmail(email: string): Promise<User | null> {
  if (!sql) {
    const db = getInMemoryDb();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  const result = await sql`
    SELECT id, email, password_hash, created_at, updated_at
    FROM users
    WHERE LOWER(email) = LOWER(${email})
    LIMIT 1
  `;

  if (result.length === 0) return null;

  const row = result[0];
  return {
    id: row.id,
    email: row.email,
    password_hash: row.password_hash,
    created_at: row.created_at?.toISOString?.() || row.created_at,
    updated_at: row.updated_at?.toISOString?.() || row.updated_at,
  };
}

export async function findUserById(id: string): Promise<User | null> {
  if (!sql) {
    const db = getInMemoryDb();
    return db.users.find(u => u.id === id) || null;
  }

  const result = await sql`
    SELECT id, email, password_hash, created_at, updated_at
    FROM users
    WHERE id = ${id}::uuid
    LIMIT 1
  `;

  if (result.length === 0) return null;

  const row = result[0];
  return {
    id: row.id,
    email: row.email,
    password_hash: row.password_hash,
    created_at: row.created_at?.toISOString?.() || row.created_at,
    updated_at: row.updated_at?.toISOString?.() || row.updated_at,
  };
}

export async function createUser(email: string, passwordHash: string): Promise<User> {
  if (!sql) {
    const db = getInMemoryDb();
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

  const result = await sql`
    INSERT INTO users (email, password_hash)
    VALUES (${email.toLowerCase()}, ${passwordHash})
    RETURNING id, email, password_hash, created_at, updated_at
  `;

  const row = result[0];
  return {
    id: row.id,
    email: row.email,
    password_hash: row.password_hash,
    created_at: row.created_at?.toISOString?.() || row.created_at,
    updated_at: row.updated_at?.toISOString?.() || row.updated_at,
  };
}

// ============================================
// Todo operations
// ============================================
export async function findTodosByUserId(userId: string): Promise<Todo[]> {
  if (!sql) {
    const db = getInMemoryDb();
    return db.todos.filter(t => t.user_id === userId);
  }

  const result = await sql`
    SELECT id, user_id, title, description, completed, created_at, updated_at
    FROM todos
    WHERE user_id = ${userId}::uuid
    ORDER BY created_at DESC
  `;

  return result.map(row => ({
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    completed: row.completed,
    created_at: row.created_at?.toISOString?.() || row.created_at,
    updated_at: row.updated_at?.toISOString?.() || row.updated_at,
  }));
}

export async function findTodoById(id: string): Promise<Todo | null> {
  if (!sql) {
    const db = getInMemoryDb();
    return db.todos.find(t => t.id === id) || null;
  }

  const result = await sql`
    SELECT id, user_id, title, description, completed, created_at, updated_at
    FROM todos
    WHERE id = ${id}::uuid
    LIMIT 1
  `;

  if (result.length === 0) return null;

  const row = result[0];
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    completed: row.completed,
    created_at: row.created_at?.toISOString?.() || row.created_at,
    updated_at: row.updated_at?.toISOString?.() || row.updated_at,
  };
}

export async function findTodoByIdAndUserId(id: string, userId: string): Promise<Todo | null> {
  if (!sql) {
    const db = getInMemoryDb();
    return db.todos.find(t => t.id === id && t.user_id === userId) || null;
  }

  const result = await sql`
    SELECT id, user_id, title, description, completed, created_at, updated_at
    FROM todos
    WHERE id = ${id}::uuid AND user_id = ${userId}::uuid
    LIMIT 1
  `;

  if (result.length === 0) return null;

  const row = result[0];
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    completed: row.completed,
    created_at: row.created_at?.toISOString?.() || row.created_at,
    updated_at: row.updated_at?.toISOString?.() || row.updated_at,
  };
}

export async function createTodo(userId: string, title: string, description: string | null): Promise<Todo> {
  if (!sql) {
    const db = getInMemoryDb();
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

  const result = await sql`
    INSERT INTO todos (user_id, title, description)
    VALUES (${userId}::uuid, ${title}, ${description})
    RETURNING id, user_id, title, description, completed, created_at, updated_at
  `;

  const row = result[0];
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    completed: row.completed,
    created_at: row.created_at?.toISOString?.() || row.created_at,
    updated_at: row.updated_at?.toISOString?.() || row.updated_at,
  };
}

export async function updateTodo(
  id: string,
  userId: string,
  updates: Partial<Pick<Todo, 'title' | 'description' | 'completed'>>
): Promise<Todo | null> {
  if (!sql) {
    const db = getInMemoryDb();
    const index = db.todos.findIndex(t => t.id === id && t.user_id === userId);
    if (index === -1) return null;

    db.todos[index] = {
      ...db.todos[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return db.todos[index];
  }

  // Build dynamic update query
  const setClauses: string[] = ['updated_at = NOW()'];
  const values: any[] = [];

  if (updates.title !== undefined) {
    setClauses.push(`title = $${values.length + 1}`);
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    setClauses.push(`description = $${values.length + 1}`);
    values.push(updates.description);
  }
  if (updates.completed !== undefined) {
    setClauses.push(`completed = $${values.length + 1}`);
    values.push(updates.completed);
  }

  // Use individual update queries based on what's being updated
  let result;
  if (updates.title !== undefined && updates.description !== undefined) {
    result = await sql`
      UPDATE todos
      SET title = ${updates.title}, description = ${updates.description}, updated_at = NOW()
      WHERE id = ${id}::uuid AND user_id = ${userId}::uuid
      RETURNING id, user_id, title, description, completed, created_at, updated_at
    `;
  } else if (updates.title !== undefined) {
    result = await sql`
      UPDATE todos
      SET title = ${updates.title}, updated_at = NOW()
      WHERE id = ${id}::uuid AND user_id = ${userId}::uuid
      RETURNING id, user_id, title, description, completed, created_at, updated_at
    `;
  } else if (updates.completed !== undefined) {
    result = await sql`
      UPDATE todos
      SET completed = ${updates.completed}, updated_at = NOW()
      WHERE id = ${id}::uuid AND user_id = ${userId}::uuid
      RETURNING id, user_id, title, description, completed, created_at, updated_at
    `;
  } else {
    result = await sql`
      UPDATE todos
      SET updated_at = NOW()
      WHERE id = ${id}::uuid AND user_id = ${userId}::uuid
      RETURNING id, user_id, title, description, completed, created_at, updated_at
    `;
  }

  if (result.length === 0) return null;

  const row = result[0];
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    completed: row.completed,
    created_at: row.created_at?.toISOString?.() || row.created_at,
    updated_at: row.updated_at?.toISOString?.() || row.updated_at,
  };
}

// ============================================
// Task operations (Phase IV - tasks table with due_date/due_time)
// ============================================
export interface Task {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  due_date: string | null;
  due_time: string | null;
  created_at: string;
  updated_at: string;
}

// In-memory task storage for local dev
const globalForTasks = globalThis as unknown as {
  inMemoryTasks: Task[] | undefined;
  taskIdCounter: number | undefined;
};

function getInMemoryTasks(): Task[] {
  if (!globalForTasks.inMemoryTasks) {
    globalForTasks.inMemoryTasks = [];
    globalForTasks.taskIdCounter = 0;
  }
  return globalForTasks.inMemoryTasks;
}

function nextTaskId(): number {
  if (!globalForTasks.taskIdCounter) globalForTasks.taskIdCounter = 0;
  globalForTasks.taskIdCounter++;
  return globalForTasks.taskIdCounter;
}

export async function findTasksByUserId(userId: string, status?: string | null): Promise<Task[]> {
  if (!sql) {
    const tasks = getInMemoryTasks().filter(t => t.user_id === userId);
    const filtered = status === 'pending' ? tasks.filter(t => !t.completed)
      : status === 'completed' ? tasks.filter(t => t.completed)
      : tasks;
    return filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  let result;
  if (status === 'pending') {
    result = await sql`
      SELECT id, user_id, title, description, completed, due_date, due_time, created_at, updated_at
      FROM tasks WHERE user_id = ${userId} AND completed = false ORDER BY updated_at DESC
    `;
  } else if (status === 'completed') {
    result = await sql`
      SELECT id, user_id, title, description, completed, due_date, due_time, created_at, updated_at
      FROM tasks WHERE user_id = ${userId} AND completed = true ORDER BY updated_at DESC
    `;
  } else {
    result = await sql`
      SELECT id, user_id, title, description, completed, due_date, due_time, created_at, updated_at
      FROM tasks WHERE user_id = ${userId} ORDER BY updated_at DESC
    `;
  }

  return result.map(row => ({
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    completed: row.completed,
    due_date: row.due_date ? String(row.due_date) : null,
    due_time: row.due_time || null,
    created_at: row.created_at?.toISOString?.() || row.created_at,
    updated_at: row.updated_at?.toISOString?.() || row.updated_at,
  }));
}

export async function createTask(
  userId: string, title: string, description: string | null,
  dueDate: string | null = null, dueTime: string | null = null
): Promise<Task> {
  if (!sql) {
    const tasks = getInMemoryTasks();
    const now = new Date().toISOString();
    const task: Task = {
      id: nextTaskId(), user_id: userId, title, description,
      completed: false, due_date: dueDate, due_time: dueTime,
      created_at: now, updated_at: now,
    };
    tasks.push(task);
    return task;
  }

  const result = await sql`
    INSERT INTO tasks (user_id, title, description, due_date, due_time)
    VALUES (${userId}, ${title}, ${description}, ${dueDate}::date, ${dueTime})
    RETURNING id, user_id, title, description, completed, due_date, due_time, created_at, updated_at
  `;

  const row = result[0];
  return {
    id: row.id, user_id: row.user_id, title: row.title, description: row.description,
    completed: row.completed, due_date: row.due_date ? String(row.due_date) : null,
    due_time: row.due_time || null,
    created_at: row.created_at?.toISOString?.() || row.created_at,
    updated_at: row.updated_at?.toISOString?.() || row.updated_at,
  };
}

export async function findTaskByIdAndUserId(id: number, userId: string): Promise<Task | null> {
  if (!sql) {
    const tasks = getInMemoryTasks();
    return tasks.find(t => t.id === id && t.user_id === userId) || null;
  }

  const result = await sql`
    SELECT id, user_id, title, description, completed, due_date, due_time, created_at, updated_at
    FROM tasks WHERE id = ${id} AND user_id = ${userId} LIMIT 1
  `;

  if (result.length === 0) return null;
  const row = result[0];
  return {
    id: row.id, user_id: row.user_id, title: row.title, description: row.description,
    completed: row.completed, due_date: row.due_date ? String(row.due_date) : null,
    due_time: row.due_time || null,
    created_at: row.created_at?.toISOString?.() || row.created_at,
    updated_at: row.updated_at?.toISOString?.() || row.updated_at,
  };
}

export async function updateTask(
  id: number, userId: string,
  updates: Partial<Pick<Task, 'title' | 'description' | 'completed'>>
): Promise<Task | null> {
  if (!sql) {
    const tasks = getInMemoryTasks();
    const index = tasks.findIndex(t => t.id === id && t.user_id === userId);
    if (index === -1) return null;
    tasks[index] = { ...tasks[index], ...updates, updated_at: new Date().toISOString() };
    return tasks[index];
  }

  let result;
  if (updates.title !== undefined && updates.description !== undefined) {
    result = await sql`
      UPDATE tasks SET title = ${updates.title}, description = ${updates.description}, updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id, user_id, title, description, completed, due_date, due_time, created_at, updated_at
    `;
  } else if (updates.completed !== undefined) {
    result = await sql`
      UPDATE tasks SET completed = ${updates.completed}, updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id, user_id, title, description, completed, due_date, due_time, created_at, updated_at
    `;
  } else {
    result = await sql`
      UPDATE tasks SET updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id, user_id, title, description, completed, due_date, due_time, created_at, updated_at
    `;
  }

  if (result.length === 0) return null;
  const row = result[0];
  return {
    id: row.id, user_id: row.user_id, title: row.title, description: row.description,
    completed: row.completed, due_date: row.due_date ? String(row.due_date) : null,
    due_time: row.due_time || null,
    created_at: row.created_at?.toISOString?.() || row.created_at,
    updated_at: row.updated_at?.toISOString?.() || row.updated_at,
  };
}

export async function deleteTask(id: number, userId: string): Promise<boolean> {
  if (!sql) {
    const tasks = getInMemoryTasks();
    const index = tasks.findIndex(t => t.id === id && t.user_id === userId);
    if (index === -1) return false;
    tasks.splice(index, 1);
    return true;
  }

  const result = await sql`
    DELETE FROM tasks WHERE id = ${id} AND user_id = ${userId} RETURNING id
  `;
  return result.length > 0;
}

export async function deleteTodo(id: string, userId: string): Promise<boolean> {
  if (!sql) {
    const db = getInMemoryDb();
    const index = db.todos.findIndex(t => t.id === id && t.user_id === userId);
    if (index === -1) return false;

    db.todos.splice(index, 1);
    return true;
  }

  const result = await sql`
    DELETE FROM todos
    WHERE id = ${id}::uuid AND user_id = ${userId}::uuid
    RETURNING id
  `;

  return result.length > 0;
}
