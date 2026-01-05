/**
 * Modern Professional Navbar Component
 * Features glassmorphism effect, smooth animations, and clean design
 */
'use client';

import { useRouter } from 'next/navigation';
import { clearSession, getSession } from '@/lib/auth';

export default function Navbar() {
  const router = useRouter();
  const session = getSession();

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <svg className="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          <span className="brand-text">TaskFlow</span>
        </div>

        {session && (
          <div className="navbar-user">
            <div className="user-info">
              <div className="user-avatar">
                {session.user.email.charAt(0).toUpperCase()}
              </div>
              <span className="user-email">{session.user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="btn-logout"
            >
              <svg className="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--gray-200);
          box-shadow: var(--shadow-xs);
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-icon {
          width: 28px;
          height: 28px;
          color: var(--primary-600);
        }

        .brand-text {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--gray-900);
          letter-spacing: -0.025em;
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .user-email {
          font-size: 0.875rem;
          color: var(--gray-600);
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .btn-logout {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          color: var(--gray-600);
          background: var(--gray-100);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all var(--transition-fast);
        }

        .btn-logout:hover {
          background: var(--error-light);
          color: var(--error);
        }

        .logout-icon {
          width: 16px;
          height: 16px;
        }

        @media (max-width: 640px) {
          .navbar-container {
            padding: 0 1rem;
            height: 56px;
          }

          .user-email {
            display: none;
          }

          .btn-logout span {
            display: none;
          }

          .btn-logout {
            padding: 0.5rem;
          }
        }
      `}</style>
    </nav>
  );
}
