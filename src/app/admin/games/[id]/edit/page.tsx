import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/admin';
import { GameForm } from '@/components/admin/GameForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGamePage({ params }: PageProps) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  const supabase = await createServerSupabaseClient();
  const { data: game } = await supabase.from('games').select('*').eq('id', id).single();
  if (!game) notFound();

  return <GameForm initialData={game} />;
}
