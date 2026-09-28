'use client';

import { useAuth } from '@/contexts/auth-context';

/** Thin convenience wrapper over useAuth() for read-only consumers. */
export function useCurrentUser() {
  const { user, status } = useAuth();
  return { user, isLoading: status === 'loading', isAuthenticated: status === 'authenticated' };
}
