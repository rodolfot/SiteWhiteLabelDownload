'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowLeft, Eye, TrendingUp, MessageCircle, FileQuestion,
  Check, X, Trash2, ExternalLink, Download
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { Comment, SeriesRequest } from '@/types/database';

interface AnalyticsDashboardProps {
  totalViews: number;
  totalDownloads?: number;
  dailyViews: { date: string; count: number }[];
  topPages: { path: string; count: number }[];
  topSeries: { title: string; slug: string; count: number }[];
  topMovies: { title: string; slug: string; count: number }[];
  topBooks: { title: string; slug: string; count: number }[];
  topGames: { title: string; slug: string; count: number }[];
  recentComments: (Comment & {
    series: { title: string; slug: string } | null;
    movie: { title: string; slug: string } | null;
    book: { title: string; slug: string } | null;
    game: { title: string; slug: string } | null;
  })[];
  recentRequests: SeriesRequest[];
}

export function AnalyticsDashboard({
  totalViews,
  totalDownloads,
  dailyViews,
  topPages,
  topSeries,
  topMovies,
  topBooks,
  topGames,
  recentComments,
  recentRequests,
}: AnalyticsDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'requests'>('overview');
  const [comments, setComments] = useState(recentComments);
  const [requests, setRequests] = useState(recentRequests);
  const [requestTypeFilter, setRequestTypeFilter] = useState<'serie' | 'movie' | 'book' | 'game'>('serie');
  const [overviewFilter, setOverviewFilter] = useState<'series' | 'movies' | 'books' | 'games'>('series');
  const [commentTypeFilter, setCommentTypeFilter] = useState<'series' | 'movies' | 'books' | 'games'>('series');

  const handleDeleteComment = async (id: string) => {
    if (!confirm('Excluir este comentário?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (!error) {
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleToggleComment = async (id: string, approved: boolean) => {
    const supabase = createClient();
    const { error } = await supabase.from('comments').update({ approved: !approved }).eq('id', id);
    if (!error) {
      setComments((prev) => prev.map((c) => c.id === id ? { ...c, approved: !approved } : c));
    }
  };

  const handleUpdateRequestStatus = async (id: string, status: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('series_requests').update({ status }).eq('id', id);
    if (!error) {
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: status as SeriesRequest['status'] } : r));
      router.refresh();
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Excluir esta requisição?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('series_requests').delete().eq('id', id);
    if (!error) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const tabs = [
    { key: 'overview' as const, label: 'Visão Geral', icon: Eye },
    { key: 'comments' as const, label: `Comentários (${comments.length})`, icon: MessageCircle },
    { key: 'requests' as const, label: `Requisições (${requests.length})`, icon: FileQuestion },
  ];

  const statusColors: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10',
    approved: 'text-green-400 bg-green-400/10',
    rejected: 'text-red-400 bg-red-400/10',
    completed: 'text-neon-blue bg-neon-blue/10',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    approved: 'Aprovada',
    rejected: 'Rejeitada',
    completed: 'Concluída',
  };

  function TopContentChart({ data, title, color }: { data: { title: string; slug: string; count: number }[]; title: string; color: string }) {
    if (data.length === 0) return null;
    return (
      <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
        <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
          <Eye className="h-4 w-4 text-neon-purple" />
          {title}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis
                type="category"
                dataKey="title"
                stroke="#6b7280"
                fontSize={11}
                width={120}
                tickFormatter={(v) => v.length > 18 ? v.slice(0, 18) + '...' : v}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e1e2e',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(value: unknown) => [String(value), 'Views']}
              />
              <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  function TopContentList({ data, title, basePath }: { data: { title: string; slug: string; count: number }[]; title: string; basePath: string }) {
    return (
      <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-surface-600">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Eye className="h-4 w-4 text-neon-purple" />
            {title}
          </h3>
        </div>
        <div className="divide-y divide-surface-600">
          {data.length === 0 ? (
            <p className="p-4 text-gray-500 text-sm text-center">Nenhuma visualização</p>
          ) : (
            data.map((item, i) => (
              <div key={item.slug} className="flex items-center justify-between p-3 px-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-gray-500 text-xs w-5">{i + 1}.</span>
                  <Link href={`${basePath}/${item.slug}`} className="text-gray-300 text-sm truncate hover:text-neon-blue transition-colors">
                    {item.title}
                  </Link>
                </div>
                <span className="text-neon-purple text-sm font-medium shrink-0">{item.count} views</span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="p-2 text-gray-400 hover:text-white hover:bg-surface-700 rounded-lg transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Visualizações, comentários e requisições</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-neon-blue/10 p-2 rounded-lg">
              <Eye className="h-5 w-5 text-neon-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalViews.toLocaleString('pt-BR')}</p>
              <p className="text-gray-400 text-sm">Views Totais</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-neon-purple/10 p-2 rounded-lg">
              <MessageCircle className="h-5 w-5 text-neon-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{comments.length}</p>
              <p className="text-gray-400 text-sm">Comentários</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/10 p-2 rounded-lg">
              {totalDownloads !== undefined ? (
                <Download className="h-5 w-5 text-yellow-400" />
              ) : (
                <FileQuestion className="h-5 w-5 text-yellow-400" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {totalDownloads !== undefined
                  ? totalDownloads.toLocaleString('pt-BR')
                  : requests.filter((r) => r.status === 'pending').length}
              </p>
              <p className="text-gray-400 text-sm">
                {totalDownloads !== undefined ? 'Downloads' : 'Requisições Pendentes'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white'
                : 'bg-surface-700 text-gray-400 hover:text-white hover:bg-surface-600'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Views Chart */}
          {dailyViews.length > 0 && (
            <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-neon-blue" />
                Visualizações por Dia (30 dias)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyViews}>
                    <defs>
                      <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis
                      dataKey="date"
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(v) => {
                        const d = new Date(v);
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                      }}
                    />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e1e2e',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      labelFormatter={(v) => new Date(v).toLocaleDateString('pt-BR')}
                      formatter={(value: unknown) => [String(value), 'Views']}
                    />
                    <Area type="monotone" dataKey="count" stroke="#00d4ff" strokeWidth={2} fill="url(#viewsGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Sub-abas por tipo de conteúdo */}
          <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
            <div className="flex border-b border-surface-600">
              {([
                { key: 'series' as const, label: 'Séries', color: 'text-purple-400' },
                { key: 'movies' as const, label: 'Filmes', color: 'text-orange-400' },
                { key: 'books' as const, label: 'Livros', color: 'text-green-400' },
                { key: 'games' as const, label: 'Jogos', color: 'text-blue-400' },
              ]).map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setOverviewFilter(key)}
                  className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${
                    overviewFilter === key
                      ? `${color} border-current`
                      : 'text-gray-400 border-transparent hover:text-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-6">
              {overviewFilter === 'series' && (
                <>
                  <TopContentChart data={topSeries} title="Top Séries por Views" color="#a855f7" />
                  <TopContentList data={topSeries} title="Séries Mais Vistas (30 dias)" basePath="/serie" />
                </>
              )}
              {overviewFilter === 'movies' && (
                <>
                  <TopContentChart data={topMovies} title="Top Filmes por Views" color="#f97316" />
                  <TopContentList data={topMovies} title="Filmes Mais Vistos (30 dias)" basePath="/filmes" />
                </>
              )}
              {overviewFilter === 'books' && (
                <>
                  <TopContentChart data={topBooks} title="Top Livros por Views" color="#22c55e" />
                  <TopContentList data={topBooks} title="Livros Mais Vistos (30 dias)" basePath="/livros" />
                </>
              )}
              {overviewFilter === 'games' && (
                <>
                  <TopContentChart data={topGames} title="Top Jogos por Views" color="#3b82f6" />
                  <TopContentList data={topGames} title="Jogos Mais Vistos (30 dias)" basePath="/jogos" />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
          {/* Sub-abas por tipo */}
          <div className="flex border-b border-surface-600">
            {([
              { key: 'series' as const, label: 'Séries', color: 'text-purple-400', filter: (c: typeof comments[0]) => !!c.series },
              { key: 'movies' as const, label: 'Filmes', color: 'text-orange-400', filter: (c: typeof comments[0]) => !!c.movie },
              { key: 'books' as const, label: 'Livros', color: 'text-green-400', filter: (c: typeof comments[0]) => !!c.book },
              { key: 'games' as const, label: 'Jogos', color: 'text-blue-400', filter: (c: typeof comments[0]) => !!c.game },
            ]).map(({ key, label, color, filter }) => {
              const count = comments.filter(filter).length;
              return (
                <button
                  key={key}
                  onClick={() => setCommentTypeFilter(key)}
                  className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${
                    commentTypeFilter === key
                      ? `${color} border-current`
                      : 'text-gray-400 border-transparent hover:text-gray-200'
                  }`}
                >
                  {label} <span className="text-xs opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
          <div className="divide-y divide-surface-600">
            {comments.filter((c) =>
              commentTypeFilter === 'series' ? !!c.series :
              commentTypeFilter === 'movies' ? !!c.movie :
              commentTypeFilter === 'books' ? !!c.book :
              !!c.game
            ).length === 0 ? (
              <p className="p-8 text-gray-500 text-sm text-center">Nenhum comentário</p>
            ) : (
              comments.filter((c) =>
                commentTypeFilter === 'series' ? !!c.series :
                commentTypeFilter === 'movies' ? !!c.movie :
                commentTypeFilter === 'books' ? !!c.book :
                !!c.game
              ).map((comment) => (
                <div key={comment.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-neon-blue text-sm font-medium">{comment.nickname}</span>
                        {comment.series && (
                          <Link href={`/serie/${comment.series.slug}`} className="text-gray-500 text-xs hover:text-gray-300 flex items-center gap-1">
                            em {comment.series.title}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                        {comment.movie && (
                          <Link href={`/filmes/${comment.movie.slug}`} className="text-gray-500 text-xs hover:text-gray-300 flex items-center gap-1">
                            em {comment.movie.title}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                        {comment.book && (
                          <Link href={`/livros/${comment.book.slug}`} className="text-gray-500 text-xs hover:text-gray-300 flex items-center gap-1">
                            em {comment.book.title}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                        {comment.game && (
                          <Link href={`/jogos/${comment.game.slug}`} className="text-gray-500 text-xs hover:text-gray-300 flex items-center gap-1">
                            em {comment.game.title}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                        <span className="text-gray-600 text-xs">
                          {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        {!comment.approved && (
                          <span className="text-xs text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                            Pendente
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleComment(comment.id, comment.approved)}
                        className={`p-1.5 rounded-lg transition-all ${
                          comment.approved
                            ? 'text-green-400 hover:bg-green-400/10'
                            : 'text-yellow-400 hover:bg-yellow-400/10'
                        }`}
                        title={comment.approved ? 'Desaprovar' : 'Aprovar'}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
          {/* Sub-tabs por tipo */}
          <div className="flex border-b border-surface-600">
            {([
              { key: 'serie' as const, label: 'Séries', color: 'text-neon-blue' },
              { key: 'movie' as const, label: 'Filmes', color: 'text-purple-400' },
              { key: 'book' as const, label: 'Livros', color: 'text-green-400' },
              { key: 'game' as const, label: 'Jogos', color: 'text-orange-400' },
            ]).map(({ key, label, color }) => {
              const count = requests.filter((r) => r.type === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setRequestTypeFilter(key)}
                  className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${
                    requestTypeFilter === key
                      ? `${color} border-current`
                      : 'text-gray-400 border-transparent hover:text-gray-200'
                  }`}
                >
                  {label} <span className="text-xs opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
          <div className="divide-y divide-surface-600">
            {requests.filter((r) => r.type === requestTypeFilter).length === 0 ? (
              <p className="p-8 text-gray-500 text-sm text-center">Nenhuma requisição</p>
            ) : (
              requests.filter((r) => r.type === requestTypeFilter).map((req) => (
                <div key={req.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-white text-sm font-medium">{req.title}</h4>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${statusColors[req.status]}`}>
                          {statusLabels[req.status]}
                        </span>
                        <span className="text-gray-500 text-xs">{req.votes} voto(s)</span>
                      </div>
                      {req.description && (
                        <p className="text-gray-400 text-xs mb-1">{req.description}</p>
                      )}
                      <span className="text-gray-600 text-xs">
                        por {req.nickname} em {new Date(req.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, 'approved')}
                            className="p-1.5 text-green-400 hover:bg-green-400/10 rounded-lg transition-all"
                            title="Aprovar"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, 'rejected')}
                            className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            title="Rejeitar"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {req.status === 'approved' && (
                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, 'completed')}
                          className="p-1.5 text-neon-blue hover:bg-neon-blue/10 rounded-lg transition-all"
                          title="Marcar como concluída"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteRequest(req.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
