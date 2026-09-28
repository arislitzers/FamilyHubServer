'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Theme } from '@/types/ui.types';
import { DEFAULT_COLOR_THEME, type ColorTheme } from '@/types/theme.types';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  colorTheme: ColorTheme;
  setColorTheme: (colorTheme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'familyhub-theme';
const COLOR_STORAGE_KEY = 'familyhub-color-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(DEFAULT_COLOR_THEME);

  // Load persisted preferences on mount. These live in localStorage as
  // the source of truth for instant, flash-free hydration on this
  // device; Settings → Appearance additionally writes the same values
  // through to the settings table (see contexts/theme-context usage in
  // the Appearance tab) purely so they're visible/recorded server-side —
  // that write-through isn't what this provider reads from, to avoid
  // an extra network round trip before the UI can paint its own theme.
  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (storedTheme) setThemeState(storedTheme);

    const storedColor = window.localStorage.getItem(COLOR_STORAGE_KEY) as ColorTheme | null;
    if (storedColor) setColorThemeState(storedColor);
  }, []);

  // Apply the resolved light/dark mode to <html> and react to system changes.
  useEffect(() => {
    const root = window.document.documentElement;
    const apply = () => {
      const resolved = theme === 'system' ? getSystemTheme() : theme;
      root.classList.toggle('dark', resolved === 'dark');
      setResolvedTheme(resolved);
    };

    apply();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', apply);
      return () => mediaQuery.removeEventListener('change', apply);
    }
  }, [theme]);

  // Apply the selected color theme package to <html>.
  useEffect(() => {
    window.document.documentElement.setAttribute('data-color-theme', colorTheme);
  }, [colorTheme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const setColorTheme = useCallback((next: ColorTheme) => {
    setColorThemeState(next);
    window.localStorage.setItem(COLOR_STORAGE_KEY, next);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, setTheme, colorTheme, setColorTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
