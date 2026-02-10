/**
 * /api/tasks - Task list and creation endpoints (Phase IV)
 * GET - List tasks with optional status filter and counts
 * POST - Create a new task
 */
import { NextRequest, NextResponse } from 'next/server';
import { findTasksByUserId, createTask, initDatabase } from '@/library/db';
import { extractUserId, getTokenFromHeader } from '@/lib/jwt';

// GET /api/tasks?status=all|pending|completed
export async function GET(request: NextRequest) {
  try {
    await initDatabase();

    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ detail: 'Missing authentication token' }, { status: 401 });
    }

    const userId = await extractUserId(token);
    if (!userId) {
      return NextResponse.json({ detail: 'Invalid or expired token' }, { status: 401 });
    }

    const status = request.nextUrl.searchParams.get('status') || 'all';
    if (!['all', 'pending', 'completed'].includes(status)) {
      return NextResponse.json({ detail: 'Invalid status filter' }, { status: 422 });
    }

    const filterStatus = status === 'all' ? null : status;
    const tasks = await findTasksByUserId(userId, filterStatus);

    // Get all tasks for counts
    const allTasks = await findTasksByUserId(userId, null);
    const completedCount = allTasks.filter(t => t.completed).length;
    const totalCount = allTasks.length;

    return NextResponse.json({
      tasks: tasks.map(t => ({
        id: t.id,
        user_id: t.user_id,
        title: t.title,
        description: t.description,
        completed: t.completed,
        priority: t.priority || 'medium',
        tags: t.tags || null,
        due_date: t.due_date,
        due_time: t.due_time,
        created_at: t.created_at,
        updated_at: t.updated_at,
      })),
      counts: {
        total: totalCount,
        pending: totalCount - completedCount,
        completed: completedCount,
      },
    });
  } catch (error) {
    console.error('List tasks error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tasks
export async function POST(request: NextRequest) {
  try {
    await initDatabase();

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
    const { title, description, due_date, due_time, priority, tags } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ detail: 'Title is required' }, { status: 400 });
    }

    if (title.length > 500) {
      return NextResponse.json({ detail: 'Title must be 500 characters or less' }, { status: 400 });
    }

    const task = await createTask(
      userId, title.trim(), description || null,
      due_date || null, due_time || null,
      priority || 'medium', tags || null
    );

    return NextResponse.json({
      id: task.id,
      user_id: task.user_id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      priority: task.priority || 'medium',
      tags: task.tags || null,
      due_date: task.due_date,
      due_time: task.due_time,
      created_at: task.created_at,
      updated_at: task.updated_at,
    }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
