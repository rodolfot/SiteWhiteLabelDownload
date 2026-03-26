'use client';

import { useState, useEffect } from 'react';
import { Heart, Tv, Film, BookOpen, Gamepad2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useFavorites } from '@/hooks/useFavorites';
import { useI18n } from '@/lib/i18n/context';
import { SeriesCard } from './SeriesCard';
import { MovieCard } from './MovieCard';
import { BookCard } from './BookCard';
import { GameCard } from './GameCard';
import type { Series, Movie, Book, Game } from '@/types/database';

type TabKey = 'series' | 'movies' | 'books' | 'games';

export function FavoritesPage() {
  const { favorites } = useFavorites();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabKey>('series');
  const [series, setSeries] = useState<Series[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favorites.length === 0) {
      setSeries([]); setMovies([]); setBooks([]); setGames([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    setLoading(true);

    Promise.all([
      supabase.from('series').select('*').in('id', favorites),
      supabase.from('movies').select('*').in('id', favorites),
      supabase.from('books').select('*').in('id', favorites),
      supabase.from('games').select('*').in('id', favorites),
    ]).then(([s, m, b, g]) => {
      setSeries(s.data || []);
      setMovies(m.data || []);
      setBooks(b.data || []);
      setGames(g.data || []);
      setLoading(false);
    });
  }, [favorites]);

  const tabs: { key: TabKey; label: string; icon: React.ElementType; color: string; count: number }[] = [
    { key: 'series', label: t.common.seriesNav, icon: Tv, color: 'text-purple-400', count: series.length },
    { key: 'movies', label: t.movies.title, icon: Film, color: 'text-orange-400', count: movies.length },
    { key: 'books', label: t.books.title, icon: BookOpen, color: 'text-green-400', count: books.length },
    { key: 'games', label: t.games.title, icon: Gamepad2, color: 'text-blue-400', count: games.length },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Heart className="h-6 w-6 text-red-400 fill-current" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{t.auth.myFavorites}</h1>
          <p className="text-gray-400 text-sm mt-1">{favorites.length} {t.common.favorites.toLowerCase()}</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon, color, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
              activeTab === key
                ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white'
                : 'bg-surface-700 border border-surface-500 text-gray-300 hover:text-white hover:border-neon-blue'
            }`}
          >
            <Icon className={`h-4 w-4 ${activeTab === key ? 'text-white' : color}`} />
            {label}
            <span className="text-xs opacity-70">({count})</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-surface-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">{t.common.noResults}</p>
          <p className="text-gray-500 text-sm mt-1">Adicione favoritos clicando no ❤️ em qualquer conteúdo</p>
        </div>
      ) : (
        <>
          {activeTab === 'series' && (
            series.length === 0
              ? <EmptyTab />
              : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {series.map((item, i) => <SeriesCard key={item.id} series={item} index={i} />)}
                </div>
          )}
          {activeTab === 'movies' && (
            movies.length === 0
              ? <EmptyTab />
              : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {movies.map((item, i) => <MovieCard key={item.id} movie={item} index={i} />)}
                </div>
          )}
          {activeTab === 'books' && (
            books.length === 0
              ? <EmptyTab />
              : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {books.map((item, i) => <BookCard key={item.id} book={item} index={i} />)}
                </div>
          )}
          {activeTab === 'games' && (
            games.length === 0
              ? <EmptyTab />
              : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {games.map((item, i) => <GameCard key={item.id} game={item} index={i} />)}
                </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyTab() {
  return (
    <div className="text-center py-16">
      <Heart className="h-8 w-8 text-gray-600 mx-auto mb-3" />
      <p className="text-gray-400">Nenhum favorito nesta categoria</p>
    </div>
  );
}
