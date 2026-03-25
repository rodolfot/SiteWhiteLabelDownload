import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/admin';
import { MovieForm } from '@/components/admin/MovieForm';

export default async function NewMoviePage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  return <MovieForm />;
}
