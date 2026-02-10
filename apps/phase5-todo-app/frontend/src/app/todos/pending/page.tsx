/**
 * Pending Tasks Page with Search, Filter, and Sort (Features 2+3)
 */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/library/api';
import { Todo, TaskListResponse } from '@/library/types';
import { isAuthenticated, clearSession } from '@/library/auth';
import { TodoList } from '@/components/TodoList';
import { TaskNavigation } from '@/components/TaskNavigation';
import Navbar from '@/components/Navbar';

export const dynamic = 'force-dynamic';

const PRIORITY_MAP: Record<string, number> = { high: 3, medium: 2, low: 1 };

export default function PendingTasksPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [sortBy, setSortBy] = useState('updated_at_desc');

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = isAuthenticated();
      if (!authenticated) { router.push('/login'); setAuthChecked(true); return; }
      fetchTasks();
      setAuthChecked(true);
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: TaskListResponse = await api.getTasks('pending');
      setTodos(response.tasks);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) { clearSession(); router.push('/login'); return; }
        setError(err.message);
      } else {
        setError('Failed to load tasks. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const uniqueTags = useMemo(() => {
    const tagSet = new Set<string>();
    todos.forEach(t => {
      if (t.tags) t.tags.split(',').map(s => s.trim()).filter(Boolean).forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [todos]);

  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!todo.title.toLowerCase().includes(q) && !(todo.description || '').toLowerCase().includes(q)) return false;
      }
      if (filterPriority !== 'all' && todo.priority !== filterPriority) return false;
      if (filterTag !== 'all') {
        const tags = todo.tags ? todo.tags.split(',').map(s => s.trim()) : [];
        if (!tags.includes(filterTag)) return false;
      }
      if (filterDateFrom && todo.due_date && todo.due_date < filterDateFrom) return false;
      if (filterDateTo && todo.due_date && todo.due_date > filterDateTo) return false;
      if (filterDateFrom && !todo.due_date) return false;
      return true;
    });
  }, [todos, searchQuery, filterPriority, filterTag, filterDateFrom, filterDateTo]);

  const sortedTodos = useMemo(() => {
    const sorted = [...filteredTodos];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'updated_at_desc': return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'due_date_asc': {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return a.due_date.localeCompare(b.due_date);
        }
        case 'due_date_desc': {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return b.due_date.localeCompare(a.due_date);
        }
        case 'priority_high': return (PRIORITY_MAP[b.priority] || 2) - (PRIORITY_MAP[a.priority] || 2);
        case 'priority_low': return (PRIORITY_MAP[a.priority] || 2) - (PRIORITY_MAP[b.priority] || 2);
        case 'alpha_asc': return a.title.localeCompare(b.title);
        case 'alpha_desc': return b.title.localeCompare(a.title);
        case 'created_at_desc': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'created_at_asc': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default: return 0;
      }
    });
    return sorted;
  }, [filteredTodos, sortBy]);

  const hasFilters = searchQuery || filterPriority !== 'all' || filterTag !== 'all' || filterDateFrom || filterDateTo;
  const clearFilters = () => { setSearchQuery(''); setFilterPriority('all'); setFilterTag('all'); setFilterDateFrom(''); setFilterDateTo(''); };

  return (
    <div className="page-wrapper">
      {!authChecked ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      ) : (
        <>
          <Navbar />
          <main className="main-content">
            <div className="container">
              <header className="page-header">
                <h1 className="page-title">Pending Tasks</h1>
                <p className="page-subtitle">Tasks that still need to be completed</p>
              </header>

              {error && (
                <div className="error-banner">
                  <span>{error}</span>
                  <button onClick={fetchTasks} className="retry-button">Try Again</button>
                </div>
              )}

              <div className="search-filter-bar">
                <div className="filter-row">
                  <div className="search-input-wrapper">
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
                  </div>
                  <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="filter-select">
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} className="filter-select">
                    <option value="all">All Tags</option>
                    {uniqueTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                  </select>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                    <option value="updated_at_desc">Recently Updated</option>
                    <option value="due_date_asc">Due Date (Earliest)</option>
                    <option value="due_date_desc">Due Date (Latest)</option>
                    <option value="priority_high">Priority (High First)</option>
                    <option value="priority_low">Priority (Low First)</option>
                    <option value="alpha_asc">Alphabetical (A-Z)</option>
                    <option value="alpha_desc">Alphabetical (Z-A)</option>
                    <option value="created_at_desc">Newest</option>
                    <option value="created_at_asc">Oldest</option>
                  </select>
                </div>
                <div className="filter-row">
                  <div className="filter-group">
                    <label>From:</label>
                    <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="date-filter" />
                  </div>
                  <div className="filter-group">
                    <label>To:</label>
                    <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="date-filter" />
                  </div>
                  {hasFilters && <button onClick={clearFilters} className="clear-filters-btn">Clear Filters</button>}
                  {hasFilters && <span className="results-count">{sortedTodos.length} result{sortedTodos.length !== 1 ? 's' : ''}</span>}
                </div>
              </div>

              <TaskNavigation />
              <TodoList todos={sortedTodos} isLoading={isLoading} onTodoUpdated={() => fetchTasks()} source="tasks" />
            </div>
          </main>
        </>
      )}
      <style jsx>{`
        .page-wrapper { min-height: 100vh; background: var(--gray-50); }
        .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
        .loading-spinner { width: 40px; height: 40px; border: 4px solid var(--gray-200); border-top-color: var(--primary-600); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
        .main-content { padding: 2rem 1rem; }
        .container { max-width: 1000px; margin: 0 auto; }
        .page-header { text-align: center; margin-bottom: 2rem; }
        .page-title { font-size: 2rem; font-weight: 700; color: var(--gray-900); margin-bottom: 0.5rem; }
        .page-subtitle { color: var(--gray-500); font-size: 1rem; }
        .error-banner { background: var(--error-light); border: 1px solid var(--error); color: var(--error); padding: 1rem 1.25rem; border-radius: var(--radius-lg); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
        .error-banner span { flex: 1; font-weight: 500; }
        .retry-button { padding: 0.5rem 1rem; background: var(--error); color: white; border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 500; }
        .search-filter-bar { background: white; border-radius: var(--radius-lg); padding: 1rem 1.25rem; border: 1px solid var(--gray-200); margin-bottom: 1rem; box-shadow: var(--shadow-sm); }
        .filter-row { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; }
        .filter-row + .filter-row { margin-top: 0.75rem; }
        .search-input-wrapper { position: relative; flex: 1; min-width: 200px; }
        .search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: var(--gray-400); pointer-events: none; }
        .search-input { width: 100%; padding: 0.625rem 0.75rem 0.625rem 2.5rem; border: 1px solid var(--gray-300); border-radius: var(--radius-md); font-size: 0.875rem; color: var(--gray-800); }
        .search-input:focus { outline: none; border-color: var(--primary-500); box-shadow: 0 0 0 3px var(--primary-100); }
        .filter-select, .sort-select { padding: 0.625rem 0.75rem; border: 1px solid var(--gray-300); border-radius: var(--radius-md); font-size: 0.875rem; color: var(--gray-800); background: white; }
        .filter-select:focus, .sort-select:focus { outline: none; border-color: var(--primary-500); }
        .filter-group { display: flex; align-items: center; gap: 0.375rem; }
        .filter-group label { font-size: 0.8125rem; color: var(--gray-500); white-space: nowrap; }
        .date-filter { padding: 0.5rem 0.75rem; border: 1px solid var(--gray-300); border-radius: var(--radius-md); font-size: 0.875rem; }
        .date-filter:focus { outline: none; border-color: var(--primary-500); }
        .clear-filters-btn { padding: 0.5rem 1rem; background: var(--gray-100); color: var(--gray-600); border: 1px solid var(--gray-300); border-radius: var(--radius-md); font-size: 0.8125rem; font-weight: 500; cursor: pointer; }
        .clear-filters-btn:hover { background: var(--gray-200); }
        .results-count { font-size: 0.8125rem; color: var(--gray-500); }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .filter-row { flex-direction: column; }
          .search-input-wrapper { min-width: unset; width: 100%; }
          .filter-select, .sort-select { width: 100%; }
        }
      `}</style>
    </div>
  );
}
