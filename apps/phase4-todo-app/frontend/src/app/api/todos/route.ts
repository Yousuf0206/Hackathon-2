/**
 * /api/todos - Todo list endpoints
 * GET - List all todos for authenticated user
 * POST - Create a new todo
 */
import { NextRequest, NextResponse } from 'next/server';
import { findTodosByUserId, createTodo, initDatabase } from '@/lib/db';
import { extractUserId, getTokenFromHeader } from '@/lib/jwt';

// GET /api/todos - List todos
export async function GET(request: NextRequest) {
  try {
    await initDatabase();

    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { detail: 'Missing authentication token' },
        { status: 401 }
      );
    }

    const userId = await extractUserId(token);
    if (!userId) {
      return NextResponse.json(
        { detail: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const todos = await findTodosByUserId(userId);

    return NextResponse.json({
      todos: todos.map(todo => ({
        id: todo.id,
        user_id: todo.user_id,
        title: todo.title,
        description: todo.description,
        completed: todo.completed,
        created_at: todo.created_at,
        updated_at: todo.updated_at,
      })),
    });
  } catch (error) {
    console.error('Get todos error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/todos - Create todo
export async function POST(request: NextRequest) {
  try {
    await initDatabase();

    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { detail: 'Missing authentication token' },
        { status: 401 }
      );
    }

    const userId = await extractUserId(token);
    if (!userId) {
      return NextResponse.json(
        { detail: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description } = body;

    // Validate input
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { detail: 'Title is required' },
        { status: 400 }
      );
    }

    if (title.length > 500) {
      return NextResponse.json(
        { detail: 'Title must be 500 characters or less' },
        { status: 400 }
      );
    }

    if (description && description.length > 5000) {
      return NextResponse.json(
        { detail: 'Description must be 5000 characters or less' },
        { status: 400 }
      );
    }

    const todo = await createTodo(userId, title.trim(), description || null);

    return NextResponse.json(
      {
        id: todo.id,
        user_id: todo.user_id,
        title: todo.title,
        description: todo.description,
        completed: todo.completed,
        created_at: todo.created_at,
        updated_at: todo.updated_at,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create todo error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}
