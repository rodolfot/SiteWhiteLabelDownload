'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit, Trash2, LogOut, Tv, Film, BarChart3 } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { logAdminAction } from '@/lib/audit-log';

interface SeriesWithRelations {
  id: string;
  title: string;
  slug: string;
  poster_url: string;
  category: string;
  featured: boolean;
  updated_at: string;
  seasons: { id: string; number: number; episodes: { id: string }[] }[];
}

interface AdminDashboardProps {
  series: SeriesWithRelations[];
}

export function AdminDashboard({ series }: AdminDashboardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const totalEpisodes = series.reduce(
    (acc, s) => acc + s.seasons.reduce((a, sea) => a + sea.episodes.length, 0),
    0
  );

  const handleLogout = async () => {
    const supabase = createClient();
    logAdminAction({ action: 'logout', entity: 'auth' });
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta serie e todo seu conteudo?')) return;
    setDeleting(id);
    try {
      const supabase = createClient();
      const target = series.find((s) => s.id === id);
      const { error } = await supabase.from('series').delete().eq('id', id);
      if (error) {
        alert(`Erro ao excluir: ${error.message}`);
      } else {
        logAdminAction({ action: 'delete', entity: 'series', entity_id: id, details: target?.title });
        router.refresh();
      }
    } catch {
      alert('Erro inesperado ao excluir a serie. Tente novamente.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Painel Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie o conteudo do {siteConfig.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/series/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" />
            Nova Série
          </Link>
          <button onClick={handleLogout} className="btn-secondary flex items-center gap-2 text-sm">
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-neon-blue/10 p-2 rounded-lg">
              <Tv className="h-5 w-5 text-neon-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{series.length}</p>
              <p className="text-gray-400 text-sm">Séries</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-neon-purple/10 p-2 rounded-lg">
              <Film className="h-5 w-5 text-neon-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalEpisodes}</p>
              <p className="text-gray-400 text-sm">Episódios</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/10 p-2 rounded-lg">
              <BarChart3 className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {series.filter((s) => s.featured).length}
              </p>
              <p className="text-gray-400 text-sm">Destaques</p>
            </div>
          </div>
        </div>
      </div>

      {/* Series List */}
      <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-surface-600">
          <h2 className="text-white font-semibold">Todas as Séries</h2>
        </div>
        {series.length === 0 ? (
          <div className="p-12 text-center">
            <Tv className="h-10 w-10 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Nenhuma série cadastrada ainda.</p>
            <Link href="/admin/series/new" className="text-neon-blue text-sm hover:underline mt-2 inline-block">
              Adicionar primeira série
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-surface-600">
            {series.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-4 p-4 hover:bg-surface-700/50 transition-colors"
              >
                {s.poster_url ? (
                  <Image src={s.poster_url} alt={s.title} width={48} height={64} className="object-cover rounded-lg shrink-0" />
                ) : (
                  <div className="w-12 h-16 bg-surface-600 rounded-lg shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium text-sm truncate">{s.title}</h3>
                    {s.featured && (
                      <span className="text-[10px] bg-neon-blue/20 text-neon-blue px-1.5 py-0.5 rounded-full">
                        Destaque
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {s.category} • {s.seasons.length} temp. •{' '}
                    {s.seasons.reduce((a, sea) => a + sea.episodes.length, 0)} eps.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/series/${s.id}/edit`}
                    className="p-2 text-gray-400 hover:text-neon-blue hover:bg-surface-600 rounded-lg transition-all"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={deleting === s.id}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-surface-600 rounded-lg transition-all disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
