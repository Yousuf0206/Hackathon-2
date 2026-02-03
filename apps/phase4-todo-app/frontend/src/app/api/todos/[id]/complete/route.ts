/**
 * PATCH /api/todos/[id]/complete - Toggle todo completion status
 */
import { NextRequest, NextResponse } from 'next/server';
import { updateTodo, initDatabase } from '@/lib/db';
import { extractUserId, getTokenFromHeader } from '@/lib/jwt';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await initDatabase();

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
    const { completed } = body;

    if (typeof completed !== 'boolean') {
      return NextResponse.json(
        { detail: 'completed field must be a boolean' },
        { status: 400 }
      );
    }

    const todo = await updateTodo(id, userId, { completed });

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
    console.error('Toggle complete error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}
