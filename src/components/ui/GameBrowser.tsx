'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, X, ArrowUpDown, Heart } from 'lucide-react';
import { Game } from '@/types/database';
import { GameCard } from './GameCard';
import { useFavorites } from '@/hooks/useFavorites';
import { useI18n } from '@/lib/i18n/context';
import { translateGenre } from '@/lib/genreTranslations';

interface GameBrowserProps {
  games: Game[];
  categories: string[];
}

type SortOption = 'title' | 'year_desc' | 'year_asc' | 'rating';

const ITEMS_PER_PAGE = 30;

export function GameBrowser({ games, categories }: GameBrowserProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState<[number, number] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const { favorites, isFavorite } = useFavorites();
  const { t, locale } = useI18n();

  const genres = useMemo(() => {
    const genreSet = new Set<string>();
    games.forEach((g) => {
      if (g.genre) g.genre.split(',').forEach((ge) => genreSet.add(ge.trim()));
    });
    return Array.from(genreSet).sort();
  }, [games]);

  const platforms = useMemo(() => {
    const platformSet = new Set<string>();
    games.forEach((g) => {
      if (g.platform) g.platform.split(',').forEach((p) => platformSet.add(p.trim()));
    });
    return Array.from(platformSet).sort();
  }, [games]);

  const yearBounds = useMemo(() => {
    const years = games.map((g) => g.year).filter(Boolean);
    if (years.length === 0) return { min: 2000, max: new Date().getFullYear() };
    return { min: Math.min(...years), max: Math.max(...years) };
  }, [games]);

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const result = games.filter((g) => {
      const gameCats = Array.isArray(g.category) && g.category.length > 0 ? g.category : [t.categories.general];
      const matchesCategory = !activeCategory || gameCats.includes(activeCategory);
      const matchesSearch = !query || g.title.toLowerCase().includes(query) || (g.genre && g.genre.toLowerCase().includes(query)) || (g.developer && g.developer.toLowerCase().includes(query));
      const matchesGenre = selectedGenres.length === 0 || (g.genre && selectedGenres.some((sg) => g.genre.toLowerCase().includes(sg.toLowerCase())));
      const matchesYear = !yearRange || (g.year >= yearRange[0] && g.year <= yearRange[1]);
      const matchesFavorites = !showFavoritesOnly || isFavorite(g.id);
      const matchesPlatform = !selectedPlatform || (g.platform && g.platform.toLowerCase().includes(selectedPlatform.toLowerCase()));
      return matchesCategory && matchesSearch && matchesGenre && matchesYear && matchesFavorites && matchesPlatform;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'year_desc': return (b.year || 0) - (a.year || 0);
        case 'year_asc': return (a.year || 0) - (b.year || 0);
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        default: return a.title.localeCompare(b.title);
      }
    });

    return result;
  }, [games, activeCategory, searchQuery, selectedGenres, yearRange, sortBy, showFavoritesOnly, isFavorite, selectedPlatform, t.categories.general]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const categoryCounts = useMemo(() =>
    categories.map((cat) => ({
      name: cat,
      count: games.filter((g) => {
        const cats = Array.isArray(g.category) && g.category.length > 0 ? g.category : [t.categories.general];
        return cats.includes(cat);
      }).length,
    })),
    [games, categories, t.categories.general]
  );

  const handleCategoryChange = (cat: string | null) => { setActiveCategory(cat); setPage(1); };
  const handleSearchChange = (value: string) => { setSearchQuery(value); setPage(1); };

  const toggleGenre = useCallback((g: string) => {
    setSelectedGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setActiveCategory(null); setSearchQuery(''); setSelectedGenres([]); setYearRange(null);
    setSortBy('title'); setShowFavoritesOnly(false); setSelectedPlatform(null); setPage(1);
  }, []);

  const hasActiveFilters = activeCategory || searchQuery || selectedGenres.length > 0 || yearRange || showFavoritesOnly || selectedPlatform;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{t.games.allGames}</h1>
        <p className="text-gray-400 text-sm">
          {games.length} {t.games.title.toLowerCase()} em {categories.length} {t.common.categories.toLowerCase()}
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder={t.common.search} value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 transition-all" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${showFilters ? 'bg-neon-blue/20 border border-neon-blue text-white' : 'bg-surface-700 border border-surface-500 text-gray-300 hover:text-white hover:border-neon-blue'}`}>
          <SlidersHorizontal className="h-4 w-4" /> {t.categories.filter}
        </button>
        <button onClick={() => { setShowFavoritesOnly(!showFavoritesOnly); setPage(1); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${showFavoritesOnly ? 'bg-red-500/20 border border-red-500 text-red-400' : 'bg-surface-700 border border-surface-500 text-gray-300 hover:text-white hover:border-red-500'}`}>
          <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} /> {t.common.favorites} ({favorites.length})
        </button>
        {hasActiveFilters && (
          <button onClick={resetFilters} className="flex items-center gap-2 px-4 py-2.5 bg-surface-700 border border-surface-500 rounded-lg text-sm text-gray-300 hover:text-white hover:border-neon-blue transition-all">
            <X className="h-4 w-4" /> {t.common.clear}
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-surface-800 border border-surface-500 rounded-xl flex flex-col gap-4 animate-fadeIn">
          {/* Genre pills */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">{t.categories.genreFilter}</label>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <button key={g} type="button" onClick={() => toggleGenre(g)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedGenres.includes(g) ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white' : 'bg-surface-700 border border-surface-500 text-gray-300 hover:border-neon-blue hover:text-white'}`}>
                  {translateGenre(g, locale)}
                </button>
              ))}
            </div>
          </div>
          {/* Platform + Year + Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{t.games.platform}</label>
              <select value={selectedPlatform || ''} onChange={(e) => { setSelectedPlatform(e.target.value || null); setPage(1); }}
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all">
                <option value="">Todas</option>
                {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{t.categories.yearRange} {yearRange ? `(${yearRange[0]} - ${yearRange[1]})` : ''}</label>
              <div className="flex gap-2">
                <input type="number" placeholder={String(yearBounds.min)} min={yearBounds.min} max={yearBounds.max} value={yearRange ? yearRange[0] : ''}
                  onChange={(e) => { const v = parseInt(e.target.value); setYearRange(v ? [v, yearRange?.[1] || yearBounds.max] : null); setPage(1); }}
                  className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all" />
                <input type="number" placeholder={String(yearBounds.max)} min={yearBounds.min} max={yearBounds.max} value={yearRange ? yearRange[1] : ''}
                  onChange={(e) => { const v = parseInt(e.target.value); setYearRange(v ? [yearRange?.[0] || yearBounds.min, v] : null); setPage(1); }}
                  className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{t.categories.sort}</label>
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <select value={sortBy} onChange={(e) => { setSortBy(e.target.value as SortOption); setPage(1); }}
                  className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all">
                  <option value="title">{t.categories.sortTitle}</option>
                  <option value="year_desc">{t.categories.sortYearDesc}</option>
                  <option value="year_asc">{t.categories.sortYearAsc}</option>
                  <option value="rating">{t.categories.sortRating}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => handleCategoryChange(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!activeCategory ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg shadow-neon-blue/25' : 'bg-surface-700 text-gray-300 border border-surface-500 hover:border-neon-blue hover:text-white'}`}>
          {t.categories.all} ({games.length})
        </button>
        {categoryCounts.map(({ name, count }) => (
          <button key={name} onClick={() => handleCategoryChange(activeCategory === name ? null : name)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === name ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg shadow-neon-blue/25' : 'bg-surface-700 text-gray-300 border border-surface-500 hover:border-neon-blue hover:text-white'}`}>
            {translateGenre(name, locale)} ({count})
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16"><p className="text-gray-400 text-lg mb-2">{t.common.noResults}</p></div>
      ) : (
        <>
          <p className="text-gray-400 text-xs mb-4">
            {filtered.length} {t.categories.results}
            {activeCategory && <> — <span className="text-neon-blue">{translateGenre(activeCategory, locale)}</span></>}
            {selectedGenres.length > 0 && <> • <span className="text-neon-blue">{selectedGenres.map((g) => translateGenre(g, locale)).join(', ')}</span></>}
            {totalPages > 1 && <> — {t.categories.pageOf.replace('{page}', String(page)).replace('{total}', String(totalPages))}</>}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {paginated.map((item, i) => <GameCard key={item.id} game={item} index={i} />)}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg bg-surface-700 border border-surface-500 text-gray-300 hover:text-white hover:border-neon-blue disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) pageNum = i + 1;
                else if (page <= 4) pageNum = i + 1;
                else if (page >= totalPages - 3) pageNum = totalPages - 6 + i;
                else pageNum = page - 3 + i;
                return (
                  <button key={pageNum} onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${page === pageNum ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg' : 'bg-surface-700 text-gray-300 border border-surface-500 hover:border-neon-blue hover:text-white'}`}>
                    {pageNum}
                  </button>
                );
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg bg-surface-700 border border-surface-500 text-gray-300 hover:text-white hover:border-neon-blue disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
