import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cached } from '@/lib/cache';
import { HeroCarousel } from '@/components/ui/HeroCarousel';
import { CategoryRow } from '@/components/ui/CategoryRow';
import { InfiniteCategories } from '@/components/ui/InfiniteCategories';
import { MovieRow } from '@/components/ui/MovieRow';
import { BookRow } from '@/components/ui/BookRow';
import { GameRow } from '@/components/ui/GameRow';
import { SiteShell } from '@/components/ui/SiteShell';
import { Series, Movie, Book, Game } from '@/types/database';

export const revalidate = 300; // ISR: regenera a cada 5 minutos

const SERIES_LIST_FIELDS = 'id,title,slug,poster_url,backdrop_url,year,genre,rating,category,featured,synopsis,title_en,title_es,synopsis_en,synopsis_es,created_at,updated_at' as const;

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
        const cats = Array.isArray(series.category) && series.category.length > 0
          ? series.category
          : ['Geral'];
        cats.forEach((cat) => {
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(series);
        });
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

const MOVIE_LIST_FIELDS = 'id,title,slug,poster_url,backdrop_url,year,genre,rating,category,featured,synopsis,title_en,title_es,synopsis_en,synopsis_es,duration,created_at,updated_at' as const;

async function getLatestMovies(): Promise<Movie[]> {
  return cached('home:latest-movies', 120, async () => {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from('movies')
        .select(MOVIE_LIST_FIELDS)
        .order('created_at', { ascending: false })
        .limit(15);
      if (error) console.error('[Home] Erro ao buscar filmes recentes:', error.message);
      return (data || []) as Movie[];
    } catch (err) {
      console.error('[Home] Falha ao buscar filmes recentes:', err);
      return [];
    }
  });
}

async function getMoviesByCategory(): Promise<Record<string, Movie[]>> {
  return cached('home:movies-categories', 120, async () => {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from('movies')
        .select(MOVIE_LIST_FIELDS)
        .order('updated_at', { ascending: false });

      if (error) console.error('[Home] Erro ao buscar filmes por categoria:', error.message);
      if (!data) return {};

      const grouped: Record<string, Movie[]> = {};
      (data as Movie[]).forEach((movie) => {
        const cats = Array.isArray(movie.category) && movie.category.length > 0
          ? movie.category
          : ['Geral'];
        cats.forEach((cat) => {
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(movie);
        });
      });
      return grouped;
    } catch (err) {
      console.error('[Home] Falha ao buscar filmes por categoria:', err);
      return {};
    }
  });
}

const BOOK_LIST_FIELDS = 'id,title,slug,poster_url,backdrop_url,year,genre,rating,category,featured,synopsis,title_en,title_es,synopsis_en,synopsis_es,author,pages,format,created_at,updated_at' as const;

async function getLatestBooks(): Promise<Book[]> {
  return cached('home:latest-books', 120, async () => {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from('books')
        .select(BOOK_LIST_FIELDS)
        .order('created_at', { ascending: false })
        .limit(15);
      if (error) console.error('[Home] Erro ao buscar livros recentes:', error.message);
      return (data || []) as Book[];
    } catch (err) {
      console.error('[Home] Falha ao buscar livros recentes:', err);
      return [];
    }
  });
}

const GAME_LIST_FIELDS = 'id,title,slug,poster_url,backdrop_url,year,genre,rating,category,featured,synopsis,title_en,title_es,synopsis_en,synopsis_es,platform,developer,created_at,updated_at' as const;

async function getLatestGames(): Promise<Game[]> {
  return cached('home:latest-games', 120, async () => {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from('games')
        .select(GAME_LIST_FIELDS)
        .order('created_at', { ascending: false })
        .limit(15);
      if (error) console.error('[Home] Erro ao buscar jogos recentes:', error.message);
      return (data || []) as Game[];
    } catch (err) {
      console.error('[Home] Falha ao buscar jogos recentes:', err);
      return [];
    }
  });
}

export default async function HomePage() {
  const [featured, categories, latest, latestMovies, movieCategories, latestBooks, latestGames] = await Promise.all([
    getFeaturedSeries(),
    getSeriesByCategory(),
    getLatestSeries(),
    getLatestMovies(),
    getMoviesByCategory(),
    getLatestBooks(),
    getLatestGames(),
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

        {/* Latest Movies */}
        {latestMovies.length > 0 && (
          <section id="lancamentos-filmes">
            <MovieRow title="🎬 Lançamentos de Filmes" movies={latestMovies} />
          </section>
        )}

        {/* Movie Categories */}
        {Object.entries(movieCategories).map(([cat, movies]) => (
          <MovieRow key={cat} title={cat} movies={movies} />
        ))}

        {/* Latest Books */}
        {latestBooks.length > 0 && (
          <section id="lancamentos-livros">
            <BookRow title="📚 Lançamentos de Livros" books={latestBooks} />
          </section>
        )}

        {/* Latest Games */}
        {latestGames.length > 0 && (
          <section id="lancamentos-jogos">
            <GameRow title="🎮 Lançamentos de Jogos" games={latestGames} />
          </section>
        )}
      </div>
    </SiteShell>
  );
}
