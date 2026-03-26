import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/admin';
import { GameForm } from '@/components/admin/GameForm';
import { DownloadLinksEditor } from '@/components/admin/DownloadLinksEditor';

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

  return (
    <>
      <GameForm initialData={game} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <DownloadLinksEditor contentType="game" contentId={id} />
      </div>
    </>
  );
}
