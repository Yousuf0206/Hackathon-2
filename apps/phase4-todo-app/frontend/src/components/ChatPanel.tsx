'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useChatPanel } from '@/contexts/ChatPanelContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  conversation_id: number;
  response: string;
  tool_calls: { tool: string; arguments: Record<string, unknown>; success: boolean; result: unknown }[];
}

export default function ChatPanel() {
  const router = useRouter();
  const { isOpen, closePanel } = useChatPanel();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  };

  const getUserId = () => {
    if (typeof window !== 'undefined') {
      const userJson = localStorage.getItem('auth_user');
      if (userJson) {
        try {
          return JSON.parse(userJson).id;
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Escape key closes panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closePanel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closePanel]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const token = getToken();
    const userId = getUserId();

    if (!token || !userId) {
      router.push('/login');
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/${userId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: userMessage,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        router.push('/login?expired=true');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to send message');
      }

      const data: ChatResponse = await response.json();

      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="chat-backdrop" onClick={closePanel} />
      )}

      {/* Panel */}
      <div className={`chat-panel ${isOpen ? 'chat-panel-open' : ''}`}>
        {/* Header */}
        <div className="chat-panel-header">
          <div className="chat-panel-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>AI Assistant</span>
          </div>
          <div className="chat-panel-actions">
            <button onClick={startNewConversation} className="chat-panel-new-btn" title="New conversation">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button onClick={closePanel} className="chat-panel-close-btn" title="Close panel">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-panel-messages">
          {messages.length === 0 && (
            <div className="chat-panel-welcome">
              <div className="chat-panel-welcome-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3>How can I help?</h3>
              <p>Manage your tasks through conversation:</p>
              <div className="chat-panel-suggestions">
                <span>&ldquo;Add buy groceries to my list&rdquo;</span>
                <span>&ldquo;Show me my tasks&rdquo;</span>
                <span>&ldquo;Mark groceries as done&rdquo;</span>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-bubble ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}
            >
              <div className="chat-bubble-content">{message.content}</div>
            </div>
          ))}

          {isLoading && (
            <div className="chat-bubble chat-bubble-assistant">
              <div className="chat-bubble-content chat-typing">
                <span className="chat-dot" />
                <span className="chat-dot" />
                <span className="chat-dot" />
              </div>
            </div>
          )}

          {error && (
            <div className="chat-panel-error">{error}</div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="chat-panel-input">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()} title="Send message">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>

      <style jsx>{`
        .chat-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: 150;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .chat-panel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 420px;
          max-width: 100vw;
          background: #fff;
          z-index: 200;
          display: flex;
          flex-direction: column;
          box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .chat-panel-open {
          transform: translateX(0);
        }

        .chat-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--gray-200, #e5e7eb);
          background: #fff;
          flex-shrink: 0;
        }

        .chat-panel-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 1rem;
          color: var(--gray-900, #111827);
        }

        .chat-panel-title svg {
          color: var(--primary-600, #2563eb);
        }

        .chat-panel-actions {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .chat-panel-new-btn,
        .chat-panel-close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: var(--gray-500, #6b7280);
          border-radius: var(--radius-md, 0.375rem);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .chat-panel-new-btn:hover,
        .chat-panel-close-btn:hover {
          background: var(--gray-100, #f3f4f6);
          color: var(--gray-700, #374151);
        }

        .chat-panel-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .chat-panel-welcome {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2rem 1rem;
          color: var(--gray-500, #6b7280);
        }

        .chat-panel-welcome-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-full, 50%);
          background: var(--primary-50, #eff6ff);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          color: var(--primary-500, #3b82f6);
        }

        .chat-panel-welcome h3 {
          margin: 0 0 0.5rem;
          font-size: 1.125rem;
          color: var(--gray-800, #1f2937);
        }

        .chat-panel-welcome p {
          margin: 0 0 1rem;
          font-size: 0.875rem;
        }

        .chat-panel-suggestions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          width: 100%;
        }

        .chat-panel-suggestions span {
          padding: 0.5rem 0.75rem;
          background: var(--gray-50, #f9fafb);
          border: 1px solid var(--gray-200, #e5e7eb);
          border-radius: var(--radius-md, 0.375rem);
          font-size: 0.8125rem;
          color: var(--gray-600, #4b5563);
        }

        .chat-bubble {
          max-width: 85%;
          padding: 0.625rem 0.875rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          line-height: 1.5;
          word-wrap: break-word;
          white-space: pre-wrap;
        }

        .chat-bubble-user {
          align-self: flex-end;
          background: var(--primary-600, #2563eb);
          color: #fff;
          border-bottom-right-radius: 0.25rem;
        }

        .chat-bubble-assistant {
          align-self: flex-start;
          background: var(--gray-100, #f3f4f6);
          color: var(--gray-900, #111827);
          border-bottom-left-radius: 0.25rem;
        }

        .chat-bubble-content {
          margin: 0;
        }

        .chat-typing {
          display: flex;
          gap: 0.3rem;
          padding: 0.25rem 0;
        }

        .chat-dot {
          width: 7px;
          height: 7px;
          background: var(--gray-400, #9ca3af);
          border-radius: 50%;
          animation: chatBounce 1.4s infinite ease-in-out both;
        }

        .chat-dot:nth-child(1) { animation-delay: -0.32s; }
        .chat-dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes chatBounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .chat-panel-error {
          background: var(--error-light, #fee2e2);
          color: var(--error, #dc2626);
          padding: 0.625rem 0.875rem;
          border-radius: var(--radius-md, 0.375rem);
          font-size: 0.8125rem;
        }

        .chat-panel-input {
          display: flex;
          gap: 0.5rem;
          padding: 0.875rem 1.25rem;
          border-top: 1px solid var(--gray-200, #e5e7eb);
          background: #fff;
          flex-shrink: 0;
        }

        .chat-panel-input input {
          flex: 1;
          padding: 0.625rem 0.875rem;
          border: 1px solid var(--gray-300, #d1d5db);
          border-radius: var(--radius-md, 0.375rem);
          font-size: 0.875rem;
          background: #fff;
          color: var(--gray-900, #111827);
          outline: none;
          transition: border-color 0.15s ease;
        }

        .chat-panel-input input:focus {
          border-color: var(--primary-500, #3b82f6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .chat-panel-input input::placeholder {
          color: var(--gray-400, #9ca3af);
        }

        .chat-panel-input button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border: none;
          background: var(--primary-600, #2563eb);
          color: #fff;
          border-radius: var(--radius-md, 0.375rem);
          cursor: pointer;
          transition: background 0.15s ease;
          flex-shrink: 0;
        }

        .chat-panel-input button:hover:not(:disabled) {
          background: var(--primary-700, #1d4ed8);
        }

        .chat-panel-input button:disabled {
          background: var(--gray-300, #d1d5db);
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .chat-panel {
            width: 100vw;
          }
        }
      `}</style>
    </>
  );
}
