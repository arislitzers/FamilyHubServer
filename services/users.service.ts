import { createClient } from '@/lib/supabase/server';

/**
 * Example service — the only one implemented in the foundation, since
 * "fetch the current user's profile row" is infrastructure every future
 * module will need, not a feature in itself.
 */
export async function getCurrentUserProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single();

  if (error) {
    console.error('getCurrentUserProfile error', error);
    return null;
  }

  return data;
}
