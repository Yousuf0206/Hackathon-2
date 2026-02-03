'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/todos', label: 'All Tasks' },
  { href: '/todos/pending', label: 'Pending' },
  { href: '/todos/completed', label: 'Completed' },
  { href: '/todos/summary', label: 'Summary' },
];

export function TaskNavigation() {
  const pathname = usePathname();

  return (
    <nav className="task-nav">
      <div className="nav-tabs">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-tab ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <style jsx>{`
        .task-nav {
          margin-bottom: 1.5rem;
        }

        .nav-tabs {
          display: flex;
          gap: 0.25rem;
          padding: 0.25rem;
          background: var(--gray-100);
          border-radius: var(--radius-lg);
          border: 1px solid var(--gray-200);
        }

        .nav-tabs :global(.nav-tab) {
          flex: 1;
          padding: 0.625rem 1rem;
          text-align: center;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-600);
          border-radius: var(--radius-md);
          transition: all 0.15s ease;
          text-decoration: none;
        }

        .nav-tabs :global(.nav-tab:hover) {
          color: var(--gray-800);
          background: var(--gray-50);
        }

        .nav-tabs :global(.nav-tab.active) {
          background: white;
          color: var(--primary-600);
          font-weight: 600;
          box-shadow: var(--shadow-sm);
        }

        @media (max-width: 640px) {
          .nav-tabs {
            flex-wrap: wrap;
          }

          .nav-tabs :global(.nav-tab) {
            flex: 1 1 45%;
            font-size: 0.8125rem;
            padding: 0.5rem 0.75rem;
          }
        }
      `}</style>
    </nav>
  );
}
