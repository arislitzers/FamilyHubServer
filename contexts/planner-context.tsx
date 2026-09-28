'use client';

/**
 * Planner context — ARCHITECTURE ONLY.
 * Placeholder shape for the shared weekly planner module.
 */
import { createContext, useContext, useState, type ReactNode } from 'react';

export interface PlannerEventSummary {
  id: string;
  title: string;
  startsAt: string;
  endsAt?: string | null;
}

interface PlannerContextValue {
  events: PlannerEventSummary[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const PlannerContext = createContext<PlannerContextValue | undefined>(undefined);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [events] = useState<PlannerEventSummary[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <PlannerContext.Provider value={{ events, selectedDate, setSelectedDate }}>
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error('usePlanner must be used within a PlannerProvider');
  return ctx;
}
