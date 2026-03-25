import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/admin';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';

export default async function AnalyticsPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  const supabase = await createServerSupabaseClient();

  // Views dos últimos 30 dias
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    { data: allViews },
    { data: topPages },
    { data: topSeries },
    { data: totalViews },
    { data: recentComments },
    { data: recentRequests },
    { data: topMovieViews },
  ] = await Promise.all([
    // All views últimos 30 dias (para agregar por dia)
    supabase
      .from('page_views')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true })
      .limit(5000),
    // Top páginas
    supabase
      .from('page_views')
      .select('page_path')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(500),
    // Top séries por views
    supabase
      .from('page_views')
      .select('series_id, series:series_id(title, slug)')
      .not('series_id', 'is', null)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(500),
    // Total geral
    supabase
      .from('page_views')
      .select('id', { count: 'exact', head: true }),
    // Comentários recentes
    supabase
      .from('comments')
      .select('*, series:series_id(title, slug)')
      .order('created_at', { ascending: false })
      .limit(20),
    // Requisições recentes
    supabase
      .from('series_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20),
    // Top filmes por views
    supabase
      .from('page_views')
      .select('movie_id, movies:movie_id(title, slug)')
      .not('movie_id', 'is', null)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(500),
  ]);

  // Agregar top páginas
  const pageCount: Record<string, number> = {};
  (topPages || []).forEach((v) => {
    pageCount[v.page_path] = (pageCount[v.page_path] || 0) + 1;
  });
  const topPagesAgg = Object.entries(pageCount)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Agregar top séries
  const seriesCount: Record<string, { title: string; slug: string; count: number }> = {};
  (topSeries || []).forEach((v) => {
    const s = v.series as unknown as { title: string; slug: string } | null;
    if (s && v.series_id) {
      if (!seriesCount[v.series_id]) {
        seriesCount[v.series_id] = { title: s.title, slug: s.slug, count: 0 };
      }
      seriesCount[v.series_id].count++;
    }
  });
  const topSeriesAgg = Object.values(seriesCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Agregar top filmes
  const moviesCount: Record<string, { title: string; slug: string; count: number }> = {};
  (topMovieViews || []).forEach((v) => {
    const m = v.movies as unknown as { title: string; slug: string } | null;
    if (m && v.movie_id) {
      if (!moviesCount[v.movie_id]) {
        moviesCount[v.movie_id] = { title: m.title, slug: m.slug, count: 0 };
      }
      moviesCount[v.movie_id].count++;
    }
  });
  const topMoviesAgg = Object.values(moviesCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Agregar top páginas de filmes (a partir dos dados já buscados)
  const moviePageCount: Record<string, number> = {};
  (topPages || []).forEach((v) => {
    if (v.page_path.startsWith('/filmes/')) {
      moviePageCount[v.page_path] = (moviePageCount[v.page_path] || 0) + 1;
    }
  });
  const topMoviePagesAgg = Object.entries(moviePageCount)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Agregar views por dia
  const dailyCount: Record<string, number> = {};
  (allViews || []).forEach((v) => {
    const day = v.created_at.split('T')[0];
    dailyCount[day] = (dailyCount[day] || 0) + 1;
  });
  // Fill missing days with 0
  const dailyViews: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    dailyViews.push({ date: key, count: dailyCount[key] || 0 });
  }

  return (
    <AnalyticsDashboard
      totalViews={totalViews?.length ?? 0}
      dailyViews={dailyViews}
      topPages={topPagesAgg}
      topSeries={topSeriesAgg}
      topMovies={topMoviesAgg}
      topMoviePages={topMoviePagesAgg}
      recentComments={recentComments || []}
      recentRequests={recentRequests || []}
    />
  );
}
