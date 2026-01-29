'use client';

/**
 * Chat Page for Phase III Todo AI Chatbot.
 *
 * Per constitution - Frontend Rules:
 * - No business logic in frontend
 * - Frontend never mutates state directly
 * - All mutations go through backend API
 */

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ToolCall {
  tool: string;
  arguments: Record<string, unknown>;
  success: boolean;
  result: unknown;
}

interface ChatResponse {
  conversation_id: number;
  response: string;
  tool_calls: ToolCall[];
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get auth token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  };

  // Get user ID from localStorage
  const getUserId = () => {
    if (typeof window !== 'undefined') {
      const userJson = localStorage.getItem('auth_user');
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          return user.id;
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  // Check authentication on mount
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    // Add user message to UI immediately
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

      // Update conversation ID
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      // Add assistant response to messages
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      // Remove the user message on error
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
    <div className="chat-container">
      <div className="chat-header">
        <h1>Todo AI Assistant</h1>
        <p>Manage your tasks through natural conversation</p>
        <button onClick={startNewConversation} className="new-chat-btn">
          New Conversation
        </button>
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h2>Welcome!</h2>
            <p>I can help you manage your tasks. Try saying:</p>
            <ul>
              <li>&quot;Add buy groceries to my list&quot;</li>
              <li>&quot;Show me my tasks&quot;</li>
              <li>&quot;Mark the groceries task as done&quot;</li>
              <li>&quot;Delete the completed tasks&quot;</li>
            </ul>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <div className="message-role">
              {message.role === 'user' ? 'You' : 'Assistant'}
            </div>
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant-message">
            <div className="message-role">Assistant</div>
            <div className="message-content typing">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          autoFocus
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </button>
      </form>

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-width: 800px;
          margin: 0 auto;
          padding: 1rem;
        }

        .chat-header {
          text-align: center;
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .chat-header h1 {
          margin: 0;
          font-size: 1.5rem;
          color: #1f2937;
        }

        .chat-header p {
          margin: 0.5rem 0;
          color: #6b7280;
        }

        .new-chat-btn {
          margin-top: 0.5rem;
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .new-chat-btn:hover {
          background: #2563eb;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .welcome-message {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }

        .welcome-message h2 {
          color: #1f2937;
        }

        .welcome-message ul {
          list-style: none;
          padding: 0;
        }

        .welcome-message li {
          padding: 0.5rem;
          margin: 0.5rem 0;
          background: #f3f4f6;
          border-radius: 0.375rem;
        }

        .message {
          margin-bottom: 1rem;
          padding: 1rem;
          border-radius: 0.5rem;
        }

        .user-message {
          background: #dbeafe;
          margin-left: 2rem;
        }

        .assistant-message {
          background: #f3f4f6;
          margin-right: 2rem;
        }

        .message-role {
          font-weight: 600;
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .message-content {
          color: #1f2937;
          white-space: pre-wrap;
        }

        .typing {
          display: flex;
          gap: 0.25rem;
        }

        .dot {
          width: 8px;
          height: 8px;
          background: #6b7280;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .input-form {
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .input-form input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 1rem;
        }

        .input-form input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .input-form button {
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 1rem;
          cursor: pointer;
        }

        .input-form button:hover:not(:disabled) {
          background: #2563eb;
        }

        .input-form button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
