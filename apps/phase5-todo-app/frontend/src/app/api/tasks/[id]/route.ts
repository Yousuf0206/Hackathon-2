/**
 * /api/tasks/[id] - Single task endpoints (Phase IV)
 * PUT - Update a task
 * DELETE - Delete a task
 */
import { NextRequest, NextResponse } from 'next/server';
import { updateTask, deleteTask, findTaskByIdAndUserId, initDatabase } from '@/library/db';
import { extractUserId, getTokenFromHeader } from '@/lib/jwt';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/tasks/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const { title, description } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ detail: 'Title is required' }, { status: 400 });
    }

    const task = await updateTask(taskId, userId, { title: title.trim(), description: description || null });

    if (!task) {
      return NextResponse.json({ detail: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: task.id, user_id: task.user_id, title: task.title, description: task.description,
      completed: task.completed, due_date: task.due_date, due_time: task.due_time,
      created_at: task.created_at, updated_at: task.updated_at,
    });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const deleted = await deleteTask(taskId, userId);
    if (!deleted) {
      return NextResponse.json({ detail: 'Task not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
