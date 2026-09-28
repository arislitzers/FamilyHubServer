import type { User } from '@supabase/supabase-js';

export interface AuthUser extends User {}

export interface AppUserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
}

export interface LogInInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  password: string;
  confirmPassword: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
