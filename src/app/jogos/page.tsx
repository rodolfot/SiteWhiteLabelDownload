import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/site-config';
import { SiteShell } from '@/components/ui/SiteShell';
import { GameBrowser } from '@/components/ui/GameBrowser';
import { Game } from '@/types/database';

export const revalidate = 300;

export function generateMetadata(): Metadata {
  return {
    title: `Jogos - ${siteConfig.name}`,
    description: `Explore todos os jogos disponíveis no ${siteConfig.name}.`,
  };
}

async function getAllGames(): Promise<Game[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('games')
      .select('id,title,slug,synopsis,poster_url,backdrop_url,year,genre,rating,category,featured,platform,developer,publisher,min_requirements,rec_requirements,download_url,file_size,title_en,title_es,synopsis_en,synopsis_es,created_at,updated_at')
      .order('title', { ascending: true });
    if (error) console.error('[Jogos] Erro ao buscar jogos:', error.message);
    return data || [];
  } catch (err) {
    console.error('[Jogos] Falha ao buscar jogos:', err);
    return [];
  }
}

export default async function JogosPage() {
  const games = await getAllGames();

  const categories = Array.from(
    new Set(games.flatMap((g) => Array.isArray(g.category) && g.category.length > 0 ? g.category : ['Geral']))
  ).sort();

  return (
    <SiteShell>
      <GameBrowser games={games} categories={categories} />
    </SiteShell>
  );
}
