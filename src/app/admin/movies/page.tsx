import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { requireAdmin } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Plus, Edit, Film, BarChart3, Star, ArrowLeft, Tv, Tag, BookOpen, Gamepad2 } from 'lucide-react';
import { MovieDeleteButton } from '@/components/admin/MovieDeleteButton';

export default async function AdminMoviesPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  const supabase = await createServerSupabaseClient();
  const { data: movies } = await supabase
    .from('movies')
    .select('id, title, slug, poster_url, category, featured, year, quality')
    .order('title', { ascending: true });

  const list = movies || [];
  const totalFeatured = list.filter((m) => m.featured).length;
  const totalHD = list.filter((m) => m.quality === '1080p' || m.quality === '4K').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 text-gray-400 hover:text-white hover:bg-surface-700 rounded-lg transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Filmes</h1>
            <p className="text-gray-400 text-sm mt-1">Gerencie os filmes do catálogo</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="btn-secondary flex items-center gap-2 text-sm">
            <Tv className="h-4 w-4" />
            Séries
          </Link>
          <Link href="/admin/books" className="btn-secondary flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4" />
            Livros
          </Link>
          <Link href="/admin/games" className="btn-secondary flex items-center gap-2 text-sm">
            <Gamepad2 className="h-4 w-4" />
            Jogos
          </Link>
          <Link href="/admin/categories" className="btn-secondary flex items-center gap-2 text-sm">
            <Tag className="h-4 w-4" />
            Categorias
          </Link>
          <Link href="/admin/analytics" className="btn-secondary flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Link>
          <Link href="/admin/movies/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" />
            Novo Filme
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-neon-blue/10 p-2 rounded-lg">
              <Film className="h-5 w-5 text-neon-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{list.length}</p>
              <p className="text-gray-400 text-sm">Filmes</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-neon-purple/10 p-2 rounded-lg">
              <Star className="h-5 w-5 text-neon-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalFeatured}</p>
              <p className="text-gray-400 text-sm">Destaques</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/10 p-2 rounded-lg">
              <BarChart3 className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalHD}</p>
              <p className="text-gray-400 text-sm">HD (1080p / 4K)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Movies List */}
      <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-surface-600">
          <h2 className="text-white font-semibold">Todos os Filmes</h2>
        </div>
        {list.length === 0 ? (
          <div className="p-12 text-center">
            <Film className="h-10 w-10 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Nenhum filme cadastrado ainda.</p>
            <Link href="/admin/movies/new" className="text-neon-blue text-sm hover:underline mt-2 inline-block">
              Adicionar primeiro filme
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-surface-600">
            {list.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-4 p-4 hover:bg-surface-700/50 transition-colors"
              >
                {m.poster_url ? (
                  <Image src={m.poster_url} alt={m.title} width={48} height={64} className="object-cover rounded-lg shrink-0" />
                ) : (
                  <div className="w-12 h-16 bg-surface-600 rounded-lg shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium text-sm truncate">{m.title}</h3>
                    {m.featured && (
                      <span className="text-[10px] bg-neon-blue/20 text-neon-blue px-1.5 py-0.5 rounded-full">
                        Destaque
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {m.year} • {m.quality} • {Array.isArray(m.category) ? m.category.join(', ') : m.category}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/movies/${m.id}/edit`}
                    className="p-2 text-gray-400 hover:text-neon-blue hover:bg-surface-600 rounded-lg transition-all"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <MovieDeleteButton id={m.id} title={m.title} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
