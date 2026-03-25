import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/admin';
import { MovieForm } from '@/components/admin/MovieForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMoviePage({ params }: PageProps) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  const supabase = await createServerSupabaseClient();

  const { data: movie } = await supabase
    .from('movies')
    .select('*')
    .eq('id', id)
    .single();

  if (!movie) notFound();

  return <MovieForm initialData={movie} />;
}
