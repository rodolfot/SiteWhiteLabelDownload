import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/site-config';
import { SiteShell } from '@/components/ui/SiteShell';
import { SeriesDetail } from '@/components/ui/SeriesDetail';
import { Series, SeasonWithEpisodes } from '@/types/database';

interface PageProps {
  params: { slug: string };
}

async function getSeriesData(slug: string) {
  const supabase = createServerSupabaseClient();

  const { data: series } = await supabase
    .from('series')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!series) return null;

  const { data: seasons } = await supabase
    .from('seasons')
    .select('*, episodes(*)')
    .eq('series_id', series.id)
    .order('number', { ascending: true });

  const seasonsWithEpisodes: SeasonWithEpisodes[] = (seasons || []).map((season) => ({
    ...season,
    episodes: (season.episodes || []).sort(
      (a: { number: number }, b: { number: number }) => a.number - b.number
    ),
  }));

  return { series: series as Series, seasons: seasonsWithEpisodes };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getSeriesData(params.slug);
  if (!data) return { title: `Serie nao encontrada - ${siteConfig.name}` };

  const { series } = data;
  return {
    title: `${series.title} - Download Gratis | ${siteConfig.name}`,
    description: series.synopsis || `Baixe ${series.title} gratuitamente no ${siteConfig.name}.`,
    openGraph: {
      title: `${series.title} - ${siteConfig.name}`,
      description: series.synopsis || `Baixe ${series.title} gratuitamente.`,
      images: [{ url: series.backdrop_url || series.poster_url || '' }],
      type: 'video.tv_show',
    },
  };
}

export default async function SeriePage({ params }: PageProps) {
  const data = await getSeriesData(params.slug);
  if (!data) notFound();

  return (
    <SiteShell>
      <SeriesDetail series={data.series} seasons={data.seasons} />
    </SiteShell>
  );
}
