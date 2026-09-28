'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/theme-context';
import { AuthProvider } from '@/contexts/auth-context';
import { NotificationProvider } from '@/contexts/notification-context';
import { FamilyProvider } from '@/contexts/family-context';
import { PlannerProvider } from '@/contexts/planner-context';
import { ChatProvider } from '@/contexts/chat-context';
import { SettingsProvider } from '@/contexts/settings-context';
import { ToastProvider } from '@/components/ui/toast';

/**
 * Single composition root for every context provider in the app.
 * Future modules should plug their provider in here rather than
 * editing app/layout.tsx directly.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <FamilyProvider>
            <NotificationProvider>
              <PlannerProvider>
                <ChatProvider>
                  <ToastProvider>{children}</ToastProvider>
                </ChatProvider>
              </PlannerProvider>
            </NotificationProvider>
          </FamilyProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
