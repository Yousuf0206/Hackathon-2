/**
 * Navbar component with logout functionality.
 * T030: Navbar with logout button that clears session and redirects to login.
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
    <nav style={{
      backgroundColor: '#0070f3',
      color: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
          Todo App
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {session && (
          <>
            <span style={{ fontSize: '0.9rem' }}>
              {session.user.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid white',
                borderRadius: '4px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
              }}
            >
              Log Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
