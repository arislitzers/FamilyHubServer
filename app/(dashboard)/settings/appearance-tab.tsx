'use client';

import { useEffect, useRef } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-context';
import { updateThemePreferenceAction } from './actions';
import { THEME_PACKAGES } from '@/types/theme.types';
import type { Theme } from '@/types/ui.types';

const MODE_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function AppearanceTab() {
  const { theme, setTheme, colorTheme, setColorTheme } = useTheme();
  const isFirstRender = useRef(true);

  // Write-through to the settings table whenever either preference
  // changes (see the note in contexts/theme-context.tsx — localStorage
  // stays the source of truth for hydration; this is just a server-side
  // record). Skipped on first render so mounting this tab doesn't fire
  // an update for values that haven't actually changed.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    updateThemePreferenceAction(theme, colorTheme);
  }, [theme, colorTheme]);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Display mode</CardTitle>
          <CardDescription>How FamilyHub looks on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {MODE_OPTIONS.map(({ value, label, icon: Icon }) => {
              const isSelected = theme === value;
              return (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-md border p-4 transition-colors',
                    isSelected
                      ? 'border-hearth-400 bg-hearth-50 dark:bg-hearth-900/20'
                      : 'border-linen-300 hover:border-hearth-200 dark:border-dusk-600'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      isSelected ? 'text-hearth-500' : 'text-dusk-400 dark:text-dusk-300'
                    )}
                  />
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isSelected ? 'text-hearth-600 dark:text-hearth-200' : 'text-dusk-600 dark:text-linen-200'
                    )}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Theme package</CardTitle>
          <CardDescription>
            Pick an accent color for buttons, highlights, and badges throughout FamilyHub.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {THEME_PACKAGES.map((pkg) => {
              const isSelected = colorTheme === pkg.id;
              return (
                <button
                  key={pkg.id}
                  onClick={() => setColorTheme(pkg.id)}
                  className={cn(
                    'flex flex-col items-start gap-2 rounded-md border p-3 text-left transition-colors',
                    isSelected
                      ? 'border-dusk-700 dark:border-linen-100'
                      : 'border-linen-300 hover:border-dusk-400 dark:border-dusk-600'
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span
                      className="h-7 w-7 rounded-full border border-black/10"
                      style={{ backgroundColor: pkg.swatch }}
                    />
                    {isSelected && <Check className="h-4 w-4 text-dusk-700 dark:text-linen-100" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dusk-700 dark:text-linen-100">{pkg.label}</p>
                    <p className="text-xs text-dusk-400 dark:text-dusk-300">{pkg.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
