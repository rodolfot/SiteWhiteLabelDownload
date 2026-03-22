import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/admin';
import { SeriesForm } from '@/components/admin/SeriesForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSeriesPage({ params }: PageProps) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  const supabase = await createServerSupabaseClient();

  const { data: series } = await supabase
    .from('series')
    .select('*')
    .eq('id', id)
    .single();

  if (!series) notFound();

  const { data: seasons } = await supabase
    .from('seasons')
    .select('*, episodes(*)')
    .eq('series_id', series.id)
    .order('number', { ascending: true });

  const formattedSeasons = (seasons || []).map((s) => ({
    id: s.id,
    number: s.number,
    title: s.title || `Temporada ${s.number}`,
    trailer_url: s.trailer_url || '',
    episodes: (s.episodes || [])
      .sort((a: { number: number }, b: { number: number }) => a.number - b.number)
      .map((ep: Record<string, string | number>) => ({
        id: ep.id,
        number: ep.number,
        title: ep.title,
        download_url: ep.download_url,
        file_size: ep.file_size || '',
        quality: ep.quality || '1080p',
      })),
  }));

  return (
    <SeriesForm
      initialData={series}
      initialSeasons={formattedSeasons}
    />
  );
}
