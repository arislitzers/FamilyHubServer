'use client';

/**
 * Chat context — ARCHITECTURE ONLY.
 * Placeholder shape for the realtime chat module (Supabase Realtime).
 */
import { createContext, useContext, useState, type ReactNode } from 'react';

export interface ChatThreadSummary {
  id: string;
  name: string;
  lastMessagePreview?: string | null;
}

interface ChatContextValue {
  threads: ChatThreadSummary[];
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [threads] = useState<ChatThreadSummary[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  return (
    <ChatContext.Provider value={{ threads, activeThreadId, setActiveThreadId }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return ctx;
}
