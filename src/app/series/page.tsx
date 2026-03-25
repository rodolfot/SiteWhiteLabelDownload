import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/site-config';
import { SiteShell } from '@/components/ui/SiteShell';
import { CategoryBrowser } from '@/components/ui/CategoryBrowser';
import { Series } from '@/types/database';

export const revalidate = 300; // ISR: 5 minutos

export function generateMetadata(): Metadata {
  return {
    title: `Séries - ${siteConfig.name}`,
    description: `Explore todas as categorias de séries disponíveis no ${siteConfig.name}.`,
  };
}

async function getAllSeries(): Promise<Series[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('series')
      .select('id,title,slug,synopsis,poster_url,backdrop_url,year,genre,rating,category,featured,title_en,title_es,synopsis_en,synopsis_es,created_at,updated_at')
      .order('title', { ascending: true });
    if (error) console.error('[Series] Erro ao buscar séries:', error.message);
    return data || [];
  } catch (err) {
    console.error('[Series] Falha ao buscar séries:', err);
    return [];
  }
}

export default async function SeriesPage() {
  const series = await getAllSeries();

  const categories = Array.from(
    new Set(
      series.flatMap((s) =>
        Array.isArray(s.category) && s.category.length > 0 ? s.category : ['Geral']
      )
    )
  ).sort();

  return (
    <SiteShell>
      <CategoryBrowser series={series} categories={categories} />
    </SiteShell>
  );
}
