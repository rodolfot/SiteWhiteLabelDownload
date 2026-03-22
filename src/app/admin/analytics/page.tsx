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
    { data: recentViews },
    { data: topPages },
    { data: topSeries },
    { data: totalViews },
    { data: recentComments },
    { data: recentRequests },
  ] = await Promise.all([
    // Views por dia (últimos 30 dias)
    supabase.rpc('get_daily_views', { days_ago: 30 }).select('*'),
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

  return (
    <AnalyticsDashboard
      totalViews={totalViews?.length ?? 0}
      dailyViews={recentViews || []}
      topPages={topPagesAgg}
      topSeries={topSeriesAgg}
      recentComments={recentComments || []}
      recentRequests={recentRequests || []}
    />
  );
}
