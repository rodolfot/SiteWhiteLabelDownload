import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/site-config';
import { SiteShell } from '@/components/ui/SiteShell';
import { MovieDetail } from '@/components/ui/MovieDetail';
import { PageViewTracker } from '@/components/ui/PageViewTracker';
import { AgeVerificationGate } from '@/components/ui/AgeVerificationGate';
import { Movie, DownloadLink } from '@/types/database';

export const revalidate = 3600; // ISR: 1 hora

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getMovieData(slug: string): Promise<{ movie: Movie; downloadLinks: DownloadLink[] } | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('movies').select('*').eq('slug', slug).single();
  if (!data) return null;
  const { data: links } = await supabase
    .from('download_links')
    .select('*')
    .eq('content_type', 'movie')
    .eq('content_id', data.id)
    .order('created_at', { ascending: true });
  return { movie: data as Movie, downloadLinks: (links || []) as DownloadLink[] };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getMovieData(slug);
  if (!data) return { title: `Filme não encontrado - ${siteConfig.name}` };
  const movie = data.movie;

  return {
    title: `${movie.title} - Download Grátis | ${siteConfig.name}`,
    description: movie.synopsis || `Baixe ${movie.title} gratuitamente no ${siteConfig.name}.`,
    openGraph: {
      title: `${movie.title} - ${siteConfig.name}`,
      description: movie.synopsis || `Baixe ${movie.title} gratuitamente.`,
      images: [{ url: movie.backdrop_url || movie.poster_url || '' }],
      type: 'video.movie',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${movie.title} - ${siteConfig.name}`,
      description: movie.synopsis || `Baixe ${movie.title} gratuitamente.`,
      images: [movie.backdrop_url || movie.poster_url || ''],
    },
  };
}

function generateJsonLd(movie: Movie) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.title,
    description: movie.synopsis,
    image: movie.poster_url || movie.backdrop_url,
    url: `${baseUrl}/filmes/${movie.slug}`,
    datePublished: movie.created_at,
    dateModified: movie.updated_at,
    genre: movie.genre,
    duration: movie.duration ? `PT${movie.duration}M` : undefined,
    aggregateRating: movie.rating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: movie.rating,
      bestRating: 10,
      worstRating: 0,
    } : undefined,
  };
}

export default async function FilmePage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getMovieData(slug);
  if (!data) notFound();

  const { movie, downloadLinks } = data;
  const jsonLd = generateJsonLd(movie);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageViewTracker movieId={movie.id} />
      <AgeVerificationGate category={movie.category}>
        <MovieDetail movie={movie} downloadLinks={downloadLinks} />
      </AgeVerificationGate>
    </SiteShell>
  );
}
