/**
 * /api/todos/[id] - Single todo endpoints
 * GET - Get a specific todo
 * PUT - Update a todo
 * DELETE - Delete a todo
 */
import { NextRequest, NextResponse } from 'next/server';
import { findTodoByIdAndUserId, updateTodo, deleteTodo } from '@/lib/db';
import { extractUserId, getTokenFromHeader } from '@/lib/jwt';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/todos/[id] - Get single todo
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const todo = findTodoByIdAndUserId(id, userId);
    if (!todo) {
      return NextResponse.json(
        { detail: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: todo.id,
      user_id: todo.user_id,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      created_at: todo.created_at,
      updated_at: todo.updated_at,
    });
  } catch (error) {
    console.error('Get todo error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/todos/[id] - Update todo
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const todo = updateTodo(id, userId, {
      title: title.trim(),
      description: description || null,
    });

    if (!todo) {
      return NextResponse.json(
        { detail: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: todo.id,
      user_id: todo.user_id,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      created_at: todo.created_at,
      updated_at: todo.updated_at,
    });
  } catch (error) {
    console.error('Update todo error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/todos/[id] - Delete todo
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const deleted = deleteTodo(id, userId);
    if (!deleted) {
      return NextResponse.json(
        { detail: 'Todo not found' },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Delete todo error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}
