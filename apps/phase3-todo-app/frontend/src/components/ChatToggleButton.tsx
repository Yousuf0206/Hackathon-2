'use client';

import { useChatPanel } from '@/contexts/ChatPanelContext';

export default function ChatToggleButton() {
  const { togglePanel } = useChatPanel();

  return (
    <>
      <button onClick={togglePanel} className="chat-toggle-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>Chat</span>
      </button>

      <style jsx>{`
        .chat-toggle-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-600);
          padding: 0.5rem 0.75rem;
          border: none;
          background: transparent;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast, 0.15s ease);
        }

        .chat-toggle-btn:hover {
          color: var(--primary-600);
          background: var(--gray-100);
        }
      `}</style>
    </>
  );
}
