import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cached } from '@/lib/cache';
import { HeroCarousel } from '@/components/ui/HeroCarousel';
import { CategoryRow } from '@/components/ui/CategoryRow';
import { InfiniteCategories } from '@/components/ui/InfiniteCategories';
import { SiteShell } from '@/components/ui/SiteShell';
import { Series } from '@/types/database';

export const revalidate = 300; // ISR: regenera a cada 5 minutos

const SERIES_LIST_FIELDS = 'id,title,slug,poster_url,backdrop_url,year,genre,rating,category,featured,synopsis,created_at,updated_at' as const;

async function getFeaturedSeries(): Promise<Series[]> {
  return cached('home:featured', 120, async () => {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from('series')
        .select(SERIES_LIST_FIELDS)
        .eq('featured', true)
        .order('updated_at', { ascending: false })
        .limit(5);
      if (error) console.error('[Home] Erro ao buscar featured:', error.message);
      return data || [];
    } catch (err) {
      console.error('[Home] Falha ao buscar featured:', err);
      return [];
    }
  });
}

async function getSeriesByCategory(): Promise<Record<string, Series[]>> {
  return cached('home:categories', 120, async () => {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from('series')
        .select(SERIES_LIST_FIELDS)
        .order('updated_at', { ascending: false });

      if (error) console.error('[Home] Erro ao buscar categorias:', error.message);
      if (!data) return {};

      const grouped: Record<string, Series[]> = {};
      data.forEach((series) => {
        const cat = series.category || 'Geral';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(series);
      });
      return grouped;
    } catch (err) {
      console.error('[Home] Falha ao buscar categorias:', err);
      return {};
    }
  });
}

async function getLatestSeries(): Promise<Series[]> {
  return cached('home:latest', 120, async () => {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from('series')
        .select(SERIES_LIST_FIELDS)
        .order('created_at', { ascending: false })
        .limit(15);
      if (error) console.error('[Home] Erro ao buscar lançamentos:', error.message);
      return data || [];
    } catch (err) {
      console.error('[Home] Falha ao buscar lançamentos:', err);
      return [];
    }
  });
}

export default async function HomePage() {
  const [featured, categories, latest] = await Promise.all([
    getFeaturedSeries(),
    getSeriesByCategory(),
    getLatestSeries(),
  ]);

  return (
    <SiteShell>
      {/* Hero Section */}
      <HeroCarousel series={featured} />

      {/* Content Grid */}
      <div className="space-y-10 py-10">
        {/* Latest Releases */}
        <section id="lancamentos">
          <CategoryRow title="🔥 Lançamentos" series={latest} showNativeAd />
        </section>

        {/* Categories — first 2 server-rendered, rest lazy-loaded on scroll */}
        <section id="categorias">
          {(() => {
            const entries = Object.entries(categories);
            const initial = entries.slice(0, 2);
            const rest = entries.slice(2);
            return (
              <InfiniteCategories
                initialCategories={initial}
                remainingCategories={rest}
                batchSize={3}
              />
            );
          })()}
        </section>
      </div>
    </SiteShell>
  );
}
