import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/site-config';
import { SiteShell } from '@/components/ui/SiteShell';
import { GameDetail } from '@/components/ui/GameDetail';
import { PageViewTracker } from '@/components/ui/PageViewTracker';
import { AgeVerificationGate } from '@/components/ui/AgeVerificationGate';
import { Game, DownloadLink } from '@/types/database';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getGameData(slug: string): Promise<{ game: Game; downloadLinks: DownloadLink[] } | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('games').select('*').eq('slug', slug).single();
  if (!data) return null;
  const { data: links } = await supabase
    .from('download_links')
    .select('*')
    .eq('content_type', 'game')
    .eq('content_id', data.id)
    .order('created_at', { ascending: true });
  return { game: data as Game, downloadLinks: (links || []) as DownloadLink[] };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getGameData(slug);
  if (!data) return { title: `Jogo não encontrado - ${siteConfig.name}` };
  const game = data.game;

  return {
    title: `${game.title} - Download Grátis | ${siteConfig.name}`,
    description: game.synopsis || `Baixe ${game.title} gratuitamente no ${siteConfig.name}.`,
    openGraph: {
      title: `${game.title} - ${siteConfig.name}`,
      description: game.synopsis || `Baixe ${game.title} gratuitamente.`,
      images: [{ url: game.backdrop_url || game.poster_url || '' }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${game.title} - ${siteConfig.name}`,
      description: game.synopsis || `Baixe ${game.title} gratuitamente.`,
      images: [game.backdrop_url || game.poster_url || ''],
    },
  };
}

function generateJsonLd(game: Game) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.title,
    description: game.synopsis,
    image: game.poster_url || game.backdrop_url,
    url: `${baseUrl}/jogos/${game.slug}`,
    datePublished: game.created_at,
    dateModified: game.updated_at,
    genre: game.genre,
    gamePlatform: game.platform,
    author: game.developer ? { '@type': 'Organization', name: game.developer } : undefined,
    publisher: game.publisher ? { '@type': 'Organization', name: game.publisher } : undefined,
    aggregateRating: game.rating > 0 ? { '@type': 'AggregateRating', ratingValue: game.rating, bestRating: 10, worstRating: 0 } : undefined,
  };
}

export default async function JogoPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getGameData(slug);
  if (!data) notFound();

  const { game, downloadLinks } = data;
  const jsonLd = generateJsonLd(game);

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageViewTracker gameId={game.id} />
      <AgeVerificationGate category={game.category}>
        <GameDetail game={game} downloadLinks={downloadLinks} />
      </AgeVerificationGate>
    </SiteShell>
  );
}
