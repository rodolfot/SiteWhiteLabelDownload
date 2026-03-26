import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/admin';
import { MovieForm } from '@/components/admin/MovieForm';
import { DownloadLinksEditor } from '@/components/admin/DownloadLinksEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMoviePage({ params }: PageProps) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  const supabase = await createServerSupabaseClient();
  const { data: movie } = await supabase.from('movies').select('*').eq('id', id).single();
  if (!movie) notFound();

  return (
    <>
      <MovieForm initialData={movie} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <DownloadLinksEditor contentType="movie" contentId={id} />
      </div>
    </>
  );
}
