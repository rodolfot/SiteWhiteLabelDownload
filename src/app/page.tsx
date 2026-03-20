import { createServerSupabaseClient } from '@/lib/supabase/server';
import { HeroCarousel } from '@/components/ui/HeroCarousel';
import { CategoryRow } from '@/components/ui/CategoryRow';
import { Series } from '@/types/database';

async function getFeaturedSeries(): Promise<Series[]> {
  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('series')
      .select('*')
      .eq('featured', true)
      .order('updated_at', { ascending: false })
      .limit(5);
    return data || [];
  } catch {
    return [];
  }
}

async function getSeriesByCategory(): Promise<Record<string, Series[]>> {
  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('series')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!data) return {};

    const grouped: Record<string, Series[]> = {};
    data.forEach((series) => {
      const cat = series.category || 'Geral';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(series);
    });
    return grouped;
  } catch {
    return {};
  }
}

async function getLatestSeries(): Promise<Series[]> {
  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('series')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(15);
    return data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featured, categories, latest] = await Promise.all([
    getFeaturedSeries(),
    getSeriesByCategory(),
    getLatestSeries(),
  ]);

  return (
    <>
      {/* Hero Section */}
      <HeroCarousel series={featured} />

      {/* Content Grid */}
      <div className="space-y-10 py-10">
        {/* Latest Releases */}
        <section id="lancamentos">
          <CategoryRow title="🔥 Lançamentos" series={latest} showNativeAd />
        </section>

        {/* Categories */}
        <section id="categorias" className="space-y-10">
          {Object.entries(categories).map(([category, seriesList], i) => (
            <CategoryRow
              key={category}
              title={category}
              series={seriesList}
              showNativeAd={i % 2 === 0}
            />
          ))}
        </section>
      </div>
    </>
  );
}
