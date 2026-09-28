'use client';

/**
 * Settings context — ARCHITECTURE ONLY.
 * Placeholder shape for the user Settings module (notification prefs,
 * language, etc. — see the `settings` table in database/schema.sql).
 */
import { createContext, useContext, useState, type ReactNode } from 'react';

export interface UserSettings {
  language: string;
  notificationPreferences: Record<string, boolean>;
}

interface SettingsContextValue {
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
}

const defaultSettings: UserSettings = {
  language: 'en',
  notificationPreferences: {},
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  const updateSettings = (partial: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
