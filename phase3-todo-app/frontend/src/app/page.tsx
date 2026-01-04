/**
 * Landing page with links to login and register.
 * T024: Landing page with authentication links.
 */
import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333' }}>
        Phase II Todo App
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#666' }}>
        Manage your tasks with secure authentication
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link
          href="/login"
          style={{
            padding: '12px 24px',
            backgroundColor: '#0070f3',
            color: 'white',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          Log In
        </Link>
        <Link
          href="/register"
          style={{
            padding: '12px 24px',
            backgroundColor: '#fff',
            color: '#0070f3',
            border: '2px solid #0070f3',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
