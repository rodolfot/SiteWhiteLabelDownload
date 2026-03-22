import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/site-config';
import { SiteShell } from '@/components/ui/SiteShell';
import { CategoryBrowser } from '@/components/ui/CategoryBrowser';
import { Series } from '@/types/database';

export function generateMetadata(): Metadata {
  return {
    title: `Categorias - ${siteConfig.name}`,
    description: `Explore todas as categorias de séries disponíveis no ${siteConfig.name}.`,
  };
}

async function getAllSeries(): Promise<Series[]> {
  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('series')
      .select('*')
      .order('title', { ascending: true });
    return data || [];
  } catch {
    return [];
  }
}

export default async function CategoriasPage() {
  const series = await getAllSeries();

  const categories = Array.from(new Set(series.map((s) => s.category || 'Geral'))).sort();

  return (
    <SiteShell>
      <CategoryBrowser series={series} categories={categories} />
    </SiteShell>
  );
}
