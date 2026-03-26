import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { requireAdmin } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Plus, Edit, BookOpen, BarChart3, Star, ArrowLeft, Tv, Tag, Film, Gamepad2 } from 'lucide-react';
import { BookDeleteButton } from '@/components/admin/BookDeleteButton';

export default async function AdminBooksPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  const supabase = await createServerSupabaseClient();
  const { data: books } = await supabase
    .from('books')
    .select('id, title, slug, poster_url, category, featured, year, format, author')
    .order('title', { ascending: true });

  const list = books || [];
  const totalFeatured = list.filter((b) => b.featured).length;
  const totalPDF = list.filter((b) => b.format === 'PDF').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 text-gray-400 hover:text-white hover:bg-surface-700 rounded-lg transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Livros</h1>
            <p className="text-gray-400 text-sm mt-1">Gerencie os livros do catálogo</p>
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
          <Link href="/admin/books/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" />
            Novo Livro
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-neon-blue/10 p-2 rounded-lg"><BookOpen className="h-5 w-5 text-neon-blue" /></div>
            <div>
              <p className="text-2xl font-bold text-white">{list.length}</p>
              <p className="text-gray-400 text-sm">Livros</p>
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
              <p className="text-2xl font-bold text-white">{totalPDF}</p>
              <p className="text-gray-400 text-sm">PDF</p>
            </div>
          </div>
        </div>
      </div>

      {/* Books List */}
      <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-surface-600">
          <h2 className="text-white font-semibold">Todos os Livros</h2>
        </div>
        {list.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="h-10 w-10 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Nenhum livro cadastrado ainda.</p>
            <Link href="/admin/books/new" className="text-neon-blue text-sm hover:underline mt-2 inline-block">
              Adicionar primeiro livro
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-surface-600">
            {list.map((b) => (
              <div key={b.id} className="flex items-center gap-4 p-4 hover:bg-surface-700/50 transition-colors">
                {b.poster_url ? (
                  <Image src={b.poster_url} alt={b.title} width={48} height={64} className="object-cover rounded-lg shrink-0" />
                ) : (
                  <div className="w-12 h-16 bg-surface-600 rounded-lg shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium text-sm truncate">{b.title}</h3>
                    {b.featured && (
                      <span className="text-[10px] bg-neon-blue/20 text-neon-blue px-1.5 py-0.5 rounded-full">Destaque</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {b.author && `${b.author} • `}{b.year} • {b.format} • {Array.isArray(b.category) ? b.category.join(', ') : b.category}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/admin/books/${b.id}/edit`} className="p-2 text-gray-400 hover:text-neon-blue hover:bg-surface-600 rounded-lg transition-all">
                    <Edit className="h-4 w-4" />
                  </Link>
                  <BookDeleteButton id={b.id} title={b.title} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
