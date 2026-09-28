'use client';

/**
 * Family context — ARCHITECTURE ONLY.
 * Will hold the active family, its members, and switch-family logic once
 * the Family module is implemented. Shape is stable so nav/layout code
 * can be written against it now.
 */
import { createContext, useContext, useState, type ReactNode } from 'react';

export interface FamilySummary {
  id: string;
  name: string;
  coverImageUrl?: string | null;
}

interface FamilyContextValue {
  activeFamily: FamilySummary | null;
  families: FamilySummary[];
  setActiveFamily: (family: FamilySummary) => void;
}

const FamilyContext = createContext<FamilyContextValue | undefined>(undefined);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [families] = useState<FamilySummary[]>([]);
  const [activeFamily, setActiveFamily] = useState<FamilySummary | null>(null);

  return (
    <FamilyContext.Provider value={{ activeFamily, families, setActiveFamily }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error('useFamily must be used within a FamilyProvider');
  return ctx;
}
