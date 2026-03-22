import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/site-config';
import { SiteShell } from '@/components/ui/SiteShell';
import { SeriesDetail } from '@/components/ui/SeriesDetail';
import { Series, SeasonWithEpisodes } from '@/types/database';

export const revalidate = 3600; // ISR: regenera a cada 1 hora

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
    twitter: {
      card: 'summary_large_image',
      title: `${series.title} - ${siteConfig.name}`,
      description: series.synopsis || `Baixe ${series.title} gratuitamente.`,
      images: [series.backdrop_url || series.poster_url || ''],
    },
  };
}

function generateJsonLd(series: Series, seasons: SeasonWithEpisodes[]) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const totalEpisodes = seasons.reduce((acc, s) => acc + s.episodes.length, 0);

  return {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: series.title,
    description: series.synopsis,
    image: series.poster_url || series.backdrop_url,
    url: `${baseUrl}/serie/${series.slug}`,
    datePublished: series.created_at,
    dateModified: series.updated_at,
    genre: series.genre,
    aggregateRating: series.rating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: series.rating,
      bestRating: 10,
      worstRating: 0,
    } : undefined,
    numberOfSeasons: seasons.length,
    numberOfEpisodes: totalEpisodes,
    containsSeason: seasons.map((season) => ({
      '@type': 'TVSeason',
      seasonNumber: season.number,
      name: season.title || `Temporada ${season.number}`,
      numberOfEpisodes: season.episodes.length,
    })),
  };
}

export default async function SeriePage({ params }: PageProps) {
  const data = await getSeriesData(params.slug);
  if (!data) notFound();

  const jsonLd = generateJsonLd(data.series, data.seasons);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SeriesDetail series={data.series} seasons={data.seasons} />
    </SiteShell>
  );
}
