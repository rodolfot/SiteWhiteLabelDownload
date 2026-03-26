import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/admin';
import { GameForm } from '@/components/admin/GameForm';

export default async function NewGamePage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  return <GameForm />;
}
