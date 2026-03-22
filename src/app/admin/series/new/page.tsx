import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/admin';
import { SeriesForm } from '@/components/admin/SeriesForm';

export default async function NewSeriesPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  return <SeriesForm />;
}
