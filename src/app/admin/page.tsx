import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default async function AdminPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: series } = await supabase
    .from('series')
    .select('*, seasons(id, number, episodes(id))')
    .order('updated_at', { ascending: false });

  return <AdminDashboard series={series || []} />;
}
