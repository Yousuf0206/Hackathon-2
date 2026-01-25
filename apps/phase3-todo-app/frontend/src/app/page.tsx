/**
 * Modern Professional Landing Page
 * Features clean design, smooth animations, and compelling visual hierarchy
 */
'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="page-wrapper">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <svg className="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <span className="brand-text">TaskFlow</span>
          </div>

          <div className="navbar-actions">
            <Link href="/login" className="btn-link">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="main-content">
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Now with improved security
            </div>
            <h1 className="hero-title">
              Organize your tasks,<br />
              <span className="highlight">amplify your productivity</span>
            </h1>
            <p className="hero-description">
              A modern, secure todo application that helps you stay focused on what matters most.
              Built with cutting-edge technology for the best experience.
            </p>
            <div className="hero-actions">
              <Link href="/register" className="btn-primary-large">
                Start Free Today
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12,5 19,12 12,19" />
                </svg>
              </Link>
              <Link href="/login" className="btn-secondary-large">
                View Demo
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-value">10K+</span>
                <span className="stat-label">Active Users</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-value">50K+</span>
                <span className="stat-label">Tasks Created</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-value">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card">
              <div className="card-header">
                <div className="card-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="card-title">My Tasks</span>
              </div>
              <div className="card-content">
                <div className="task-item completed">
                  <div className="task-check completed">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  </div>
                  <div className="task-info">
                    <span className="task-title">Review project proposal</span>
                    <span className="task-meta">Due today</span>
                  </div>
                </div>
                <div className="task-item">
                  <div className="task-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  </div>
                  <div className="task-info">
                    <span className="task-title">Design system update</span>
                    <span className="task-meta">Tomorrow</span>
                  </div>
                </div>
                <div className="task-item">
                  <div className="task-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  </div>
                  <div className="task-info">
                    <span className="task-title">Client meeting preparation</span>
                    <span className="task-meta">Next week</span>
                  </div>
                </div>
                <div className="add-task-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add new task
                </div>
              </div>
            </div>
            <div className="floating-element float-1"></div>
            <div className="floating-element float-2"></div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="features-header">
            <h2>Everything you need to stay productive</h2>
            <p>Powerful features designed to help you manage your tasks efficiently</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>Secure Authentication</h3>
              <p>Your data is protected with industry-standard JWT authentication and encryption.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h3>Lightning Fast</h3>
              <p>Built with modern technology for instant task creation and real-time updates.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <h3>Organized Dashboard</h3>
              <p>Visual overview of all your tasks with completion statistics and progress tracking.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
              </div>
              <h3>Real-time Updates</h3>
              <p>Instant task synchronization across all your devices with automatic saves.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3>Add Details</h3>
              <p>Include descriptions and rich details to every task for better organization.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                </svg>
              </div>
              <h3>Track Progress</h3>
              <p>Monitor your productivity with visual statistics and completion tracking.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to boost your productivity?</h2>
            <p>Join thousands of users who trust TaskFlow for their task management needs.</p>
            <Link href="/register" className="btn-primary-large">
              Get Started Free
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12,5 19,12 12,19" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <svg className="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <span className="brand-text">TaskFlow</span>
          </div>
          <p className="footer-text">
            A modern todo application built with FastAPI and Next.js
          </p>
          <div className="footer-links">
            <Link href="/login">Sign In</Link>
            <Link href="/register">Sign Up</Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        /* Navigation */
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--gray-200);
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 72px;
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
          width: 32px;
          height: 32px;
          color: var(--primary-600);
        }

        .brand-text {
          font-size: 1.375rem;
          font-weight: 700;
          color: var(--gray-900);
          letter-spacing: -0.025em;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .btn-link {
          padding: 0.625rem 1.25rem;
          color: var(--gray-600);
          font-weight: 500;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .btn-link:hover {
          color: var(--gray-900);
          background: var(--gray-100);
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
          color: white;
          border-radius: var(--radius-md);
          font-weight: 500;
          transition: all var(--transition-fast);
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, var(--primary-700), var(--primary-800));
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }

        /* Hero Section */
        .main-content {
          overflow: hidden;
        }

        .hero-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 4rem 1.5rem 6rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--primary-50);
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--primary-700);
          margin-bottom: 1.5rem;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          background: var(--primary-500);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .hero-title {
          font-size: 3.25rem;
          font-weight: 800;
          line-height: 1.1;
          color: var(--gray-900);
          margin: 0 0 1.5rem 0;
          letter-spacing: -0.03em;
        }

        .highlight {
          background: linear-gradient(135deg, var(--primary-600), #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.25rem;
          color: var(--gray-600);
          line-height: 1.6;
          margin: 0 0 2rem 0;
          max-width: 500px;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        .btn-primary-large {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
          color: white;
          border-radius: var(--radius-md);
          font-size: 1.0625rem;
          font-weight: 600;
          transition: all var(--transition-fast);
        }

        .btn-primary-large svg {
          width: 20px;
          height: 20px;
          transition: transform var(--transition-fast);
        }

        .btn-primary-large:hover {
          background: linear-gradient(135deg, var(--primary-700), var(--primary-800));
          box-shadow: var(--shadow-lg);
          transform: translateY(-2px);
        }

        .btn-primary-large:hover svg {
          transform: translateX(4px);
        }

        .btn-secondary-large {
          display: inline-flex;
          align-items: center;
          padding: 1rem 2rem;
          background: white;
          color: var(--gray-700);
          border: 1px solid var(--gray-300);
          border-radius: var(--radius-md);
          font-size: 1.0625rem;
          font-weight: 500;
          transition: all var(--transition-fast);
        }

        .btn-secondary-large:hover {
          background: var(--gray-50);
          border-color: var(--gray-400);
        }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--gray-900);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--gray-500);
        }

        .stat-divider {
          width: 1px;
          height: 40px;
          background: var(--gray-200);
        }

        /* Hero Visual */
        .hero-visual {
          position: relative;
        }

        .hero-card {
          background: white;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          border: 1px solid var(--gray-200);
          overflow: hidden;
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: var(--gray-50);
          border-bottom: 1px solid var(--gray-200);
        }

        .card-dots {
          display: flex;
          gap: 0.5rem;
        }

        .card-dots span {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--gray-300);
        }

        .card-dots span:first-child { background: #ef4444; }
        .card-dots span:nth-child(2) { background: #f59e0b; }
        .card-dots span:last-child { background: #10b981; }

        .card-title {
          font-weight: 600;
          color: var(--gray-800);
        }

        .card-content {
          padding: 1.25rem;
        }

        .task-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: var(--radius-md);
          transition: background var(--transition-fast);
        }

        .task-item:hover {
          background: var(--gray-50);
        }

        .task-check {
          width: 22px;
          height: 22px;
          border: 2px solid var(--gray-300);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all var(--transition-fast);
        }

        .task-check.completed {
          background: var(--success);
          border-color: var(--success);
        }

        .task-check svg {
          width: 12px;
          height: 12px;
          color: white;
          opacity: 0;
        }

        .task-check.completed svg {
          opacity: 1;
        }

        .task-info {
          display: flex;
          flex-direction: column;
        }

        .task-title {
          font-weight: 500;
          color: var(--gray-800);
          font-size: 0.9375rem;
        }

        .task-item.completed .task-title {
          text-decoration: line-through;
          color: var(--gray-500);
        }

        .task-meta {
          font-size: 0.8125rem;
          color: var(--gray-500);
        }

        .add-task-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.75rem;
          padding: 0.75rem;
          border: 2px dashed var(--gray-300);
          border-radius: var(--radius-md);
          color: var(--gray-500);
          font-size: 0.875rem;
          transition: all var(--transition-fast);
        }

        .add-task-btn:hover {
          border-color: var(--primary-400);
          color: var(--primary-600);
          background: var(--primary-50);
        }

        .add-task-btn svg {
          width: 18px;
          height: 18px;
        }

        .floating-element {
          position: absolute;
          border-radius: 50%;
          animation: float-delayed 8s ease-in-out infinite;
        }

        .float-1 {
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, var(--primary-200), var(--primary-300));
          top: -30px;
          right: -30px;
          opacity: 0.5;
        }

        .float-2 {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #f0abfc, #c084fc);
          bottom: 40px;
          left: -20px;
          opacity: 0.4;
          animation-delay: -4s;
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        /* Features Section */
        .features-section {
          padding: 6rem 1.5rem;
          background: white;
        }

        .features-header {
          max-width: 600px;
          margin: 0 auto 4rem;
          text-align: center;
        }

        .features-header h2 {
          font-size: 2.25rem;
          font-weight: 700;
          color: var(--gray-900);
          margin: 0 0 1rem 0;
        }

        .features-header p {
          font-size: 1.125rem;
          color: var(--gray-600);
          margin: 0;
        }

        .features-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .feature-card {
          padding: 2rem;
          background: var(--gray-50);
          border-radius: var(--radius-lg);
          border: 1px solid var(--gray-200);
          transition: all var(--transition-fast);
        }

        .feature-card:hover {
          background: white;
          box-shadow: var(--shadow-lg);
          transform: translateY(-4px);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          padding: 0.75rem;
          background: var(--primary-100);
          border-radius: var(--radius-md);
          color: var(--primary-600);
          margin-bottom: 1.25rem;
        }

        .feature-icon svg {
          width: 100%;
          height: 100%;
        }

        .feature-card h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--gray-900);
          margin: 0 0 0.75rem 0;
        }

        .feature-card p {
          font-size: 0.9375rem;
          color: var(--gray-600);
          margin: 0;
          line-height: 1.6;
        }

        /* CTA Section */
        .cta-section {
          padding: 6rem 1.5rem;
          background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
        }

        .cta-content {
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }

        .cta-content h2 {
          font-size: 2.25rem;
          font-weight: 700;
          color: white;
          margin: 0 0 1rem 0;
        }

        .cta-content p {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.9);
          margin: 0 0 2rem 0;
        }

        .cta-section .btn-primary-large {
          background: white;
          color: var(--primary-700);
        }

        .cta-section .btn-primary-large:hover {
          background: var(--gray-100);
        }

        /* Footer */
        .footer {
          padding: 3rem 1.5rem;
          background: var(--gray-900);
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .footer-brand .brand-icon {
          color: var(--primary-400);
        }

        .footer-brand .brand-text {
          color: white;
        }

        .footer-text {
          color: var(--gray-500);
          font-size: 0.9375rem;
          margin: 0 0 1.5rem 0;
        }

        .footer-links {
          display: flex;
          gap: 2rem;
        }

        .footer-links a {
          color: var(--gray-400);
          font-size: 0.9375rem;
          transition: color var(--transition-fast);
        }

        .footer-links a:hover {
          color: white;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-section {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 3rem;
            padding: 3rem 1.5rem;
          }

          .hero-description {
            margin: 0 auto 2rem;
          }

          .hero-actions {
            justify-content: center;
          }

          .hero-stats {
            justify-content: center;
          }

          .hero-visual {
            max-width: 400px;
            margin: 0 auto;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .navbar-container {
            height: 64px;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-actions {
            flex-direction: column;
          }

          .btn-primary-large,
          .btn-secondary-large {
            width: 100%;
            justify-content: center;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2rem;
          }

          .hero-stats {
            flex-direction: column;
            gap: 1rem;
          }

          .stat-divider {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
