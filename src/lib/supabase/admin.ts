import { createServerSupabaseClient } from './server';

/** Check if the current user is an admin. Returns the user if admin, null otherwise. */
export async function requireAdmin() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: adminRecord } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!adminRecord) return null;

  return user;
}
