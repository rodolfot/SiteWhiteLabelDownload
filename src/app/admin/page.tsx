import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/admin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default async function AdminPage() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect('/admin/login');
  }

  const supabase = await createServerSupabaseClient();
  const { data: series } = await supabase
    .from('series')
    .select('*, seasons(id, number, episodes(id))')
    .order('updated_at', { ascending: false });

  return <AdminDashboard series={series || []} />;
}
