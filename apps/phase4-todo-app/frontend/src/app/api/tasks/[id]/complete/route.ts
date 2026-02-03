/**
 * PATCH /api/tasks/[id]/complete - Toggle task completion status (Phase IV)
 */
import { NextRequest, NextResponse } from 'next/server';
import { updateTask, initDatabase } from '@/library/db';
import { extractUserId, getTokenFromHeader } from '@/lib/jwt';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await initDatabase();

    const { id } = await params;
    const taskId = parseInt(id, 10);
    if (isNaN(taskId)) {
      return NextResponse.json({ detail: 'Invalid task ID' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ detail: 'Missing authentication token' }, { status: 401 });
    }

    const userId = await extractUserId(token);
    if (!userId) {
      return NextResponse.json({ detail: 'Invalid or expired token' }, { status: 401 });
    }

    const body = await request.json();
    const { completed } = body;

    if (typeof completed !== 'boolean') {
      return NextResponse.json({ detail: 'completed field must be a boolean' }, { status: 400 });
    }

    const task = await updateTask(taskId, userId, { completed });

    if (!task) {
      return NextResponse.json({ detail: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: task.id, user_id: task.user_id, title: task.title, description: task.description,
      completed: task.completed, due_date: task.due_date, due_time: task.due_time,
      created_at: task.created_at, updated_at: task.updated_at,
    });
  } catch (error) {
    console.error('Toggle task complete error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
