import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/site-config';
import { SiteShell } from '@/components/ui/SiteShell';
import { MovieBrowser } from '@/components/ui/MovieBrowser';
import { Movie } from '@/types/database';

export const revalidate = 300; // ISR: 5 minutos

export function generateMetadata(): Metadata {
  return {
    title: `Filmes - ${siteConfig.name}`,
    description: `Explore todos os filmes disponíveis no ${siteConfig.name}.`,
  };
}

async function getAllMovies(): Promise<Movie[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('movies')
      .select('id,title,slug,synopsis,poster_url,backdrop_url,year,genre,rating,category,featured,duration,download_url,file_size,quality,title_en,title_es,synopsis_en,synopsis_es,created_at,updated_at')
      .order('title', { ascending: true });
    if (error) console.error('[Filmes] Erro ao buscar filmes:', error.message);
    return data || [];
  } catch (err) {
    console.error('[Filmes] Falha ao buscar filmes:', err);
    return [];
  }
}

export default async function FilmesPage() {
  const movies = await getAllMovies();

  const categories = Array.from(
    new Set(
      movies.flatMap((m) =>
        Array.isArray(m.category) && m.category.length > 0 ? m.category : ['Geral']
      )
    )
  ).sort();

  return (
    <SiteShell>
      <MovieBrowser movies={movies} categories={categories} />
    </SiteShell>
  );
}
