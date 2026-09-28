'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/constants/routes';

interface ActionResult {
  error: string | null;
}

export async function joinViaInviteAction(token: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await (supabase as any).rpc('join_family_via_invite', { p_token: token });

  if (error) return { error: error.message };

  revalidatePath(ROUTES.family);
  revalidatePath(ROUTES.dashboard);
  return { error: null };
}
