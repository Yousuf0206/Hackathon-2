'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ChatPanelContextType {
  isOpen: boolean;
  togglePanel: () => void;
  closePanel: () => void;
}

const ChatPanelContext = createContext<ChatPanelContextType>({
  isOpen: false,
  togglePanel: () => {},
  closePanel: () => {},
});

export function useChatPanel() {
  return useContext(ChatPanelContext);
}

export function ChatPanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ChatPanelContext.Provider value={{ isOpen, togglePanel, closePanel }}>
      {children}
    </ChatPanelContext.Provider>
  );
}
