'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Series } from '@/types/database';
import { SeriesCard } from './SeriesCard';

interface CategoryBrowserProps {
  series: Series[];
  categories: string[];
}

export function CategoryBrowser({ series, categories }: CategoryBrowserProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = series.filter((s) => {
    const matchesCategory = !activeCategory || (s.category || 'Geral') === activeCategory;
    const matchesSearch =
      !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryCounts = categories.map((cat) => ({
    name: cat,
    count: series.filter((s) => (s.category || 'Geral') === cat).length,
  }));

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Categorias</h1>
        <p className="text-gray-400 text-sm">
          {series.length} séries em {categories.length} categorias
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título ou gênero..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 transition-all"
          />
        </div>
        {activeCategory && (
          <button
            onClick={() => setActiveCategory(null)}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface-700 border border-surface-500 rounded-lg text-sm text-gray-300 hover:text-white hover:border-neon-blue transition-all"
          >
            <Filter className="h-4 w-4" />
            Limpar filtro
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            !activeCategory
              ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg shadow-neon-blue/25'
              : 'bg-surface-700 text-gray-300 border border-surface-500 hover:border-neon-blue hover:text-white'
          }`}
        >
          Todas ({series.length})
        </button>
        {categoryCounts.map(({ name, count }) => (
          <button
            key={name}
            onClick={() => setActiveCategory(activeCategory === name ? null : name)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === name
                ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg shadow-neon-blue/25'
                : 'bg-surface-700 text-gray-300 border border-surface-500 hover:border-neon-blue hover:text-white'
            }`}
          >
            {name} ({count})
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg mb-2">Nenhuma série encontrada</p>
          <p className="text-gray-500 text-sm">Tente outro filtro ou termo de busca</p>
        </div>
      ) : (
        <>
          <p className="text-gray-400 text-xs mb-4">
            {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
            {activeCategory && <> em <span className="text-neon-blue">{activeCategory}</span></>}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((item, i) => (
              <SeriesCard key={item.id} series={item} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
