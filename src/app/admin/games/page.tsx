import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { requireAdmin } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Plus, Edit, Gamepad2, BarChart3, Star, ArrowLeft, Tv, Tag, Film, BookOpen } from 'lucide-react';
import { GameDeleteButton } from '@/components/admin/GameDeleteButton';

export default async function AdminGamesPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  const supabase = await createServerSupabaseClient();
  const { data: games } = await supabase
    .from('games')
    .select('id, title, slug, poster_url, category, featured, year, platform, developer')
    .order('title', { ascending: true });

  const list = games || [];
  const totalFeatured = list.filter((g) => g.featured).length;
  const totalPC = list.filter((g) => g.platform && g.platform.includes('PC')).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 text-gray-400 hover:text-white hover:bg-surface-700 rounded-lg transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Jogos</h1>
            <p className="text-gray-400 text-sm mt-1">Gerencie os jogos do catálogo</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="btn-secondary flex items-center gap-2 text-sm">
            <Tv className="h-4 w-4" />
            Séries
          </Link>
          <Link href="/admin/movies" className="btn-secondary flex items-center gap-2 text-sm">
            <Film className="h-4 w-4" />
            Filmes
          </Link>
          <Link href="/admin/books" className="btn-secondary flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4" />
            Livros
          </Link>
          <Link href="/admin/categories" className="btn-secondary flex items-center gap-2 text-sm">
            <Tag className="h-4 w-4" />
            Categorias
          </Link>
          <Link href="/admin/analytics" className="btn-secondary flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Link>
          <Link href="/admin/games/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" />
            Novo Jogo
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-neon-blue/10 p-2 rounded-lg"><Gamepad2 className="h-5 w-5 text-neon-blue" /></div>
            <div>
              <p className="text-2xl font-bold text-white">{list.length}</p>
              <p className="text-gray-400 text-sm">Jogos</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-neon-purple/10 p-2 rounded-lg"><Star className="h-5 w-5 text-neon-purple" /></div>
            <div>
              <p className="text-2xl font-bold text-white">{totalFeatured}</p>
              <p className="text-gray-400 text-sm">Destaques</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/10 p-2 rounded-lg"><BarChart3 className="h-5 w-5 text-yellow-400" /></div>
            <div>
              <p className="text-2xl font-bold text-white">{totalPC}</p>
              <p className="text-gray-400 text-sm">PC</p>
            </div>
          </div>
        </div>
      </div>

      {/* Games List */}
      <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-surface-600">
          <h2 className="text-white font-semibold">Todos os Jogos</h2>
        </div>
        {list.length === 0 ? (
          <div className="p-12 text-center">
            <Gamepad2 className="h-10 w-10 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Nenhum jogo cadastrado ainda.</p>
            <Link href="/admin/games/new" className="text-neon-blue text-sm hover:underline mt-2 inline-block">
              Adicionar primeiro jogo
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-surface-600">
            {list.map((g) => (
              <div key={g.id} className="flex items-center gap-4 p-4 hover:bg-surface-700/50 transition-colors">
                {g.poster_url ? (
                  <Image src={g.poster_url} alt={g.title} width={48} height={64} className="object-cover rounded-lg shrink-0" />
                ) : (
                  <div className="w-12 h-16 bg-surface-600 rounded-lg shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium text-sm truncate">{g.title}</h3>
                    {g.featured && (
                      <span className="text-[10px] bg-neon-blue/20 text-neon-blue px-1.5 py-0.5 rounded-full">Destaque</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {g.developer && `${g.developer} • `}{g.year} • {g.platform} • {Array.isArray(g.category) ? g.category.join(', ') : g.category}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/admin/games/${g.id}/edit`} className="p-2 text-gray-400 hover:text-neon-blue hover:bg-surface-600 rounded-lg transition-all">
                    <Edit className="h-4 w-4" />
                  </Link>
                  <GameDeleteButton id={g.id} title={g.title} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
