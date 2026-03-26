'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Heart, User, LogIn } from 'lucide-react';
import { Series, Movie, Book, Game } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { siteConfig } from '@/lib/site-config';
import { getBrandParts } from '@/lib/brand';
import { AdSlot } from '@/components/ads/AdSlot';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useI18n } from '@/lib/i18n/context';
import { translateGenre } from '@/lib/genreTranslations';
import { useAuth } from '@/lib/auth/AuthContext';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ type: 'serie' | 'movie' | 'book' | 'game'; item: Series | Movie | Book | Game }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [brandFirst, brandSecond] = getBrandParts();
  const { t, locale } = useI18n();
  const { user } = useAuth();

  const getSearchUrl = (type: string, slug: string) => {
    const routes: Record<string, string> = { serie: '/serie', movie: '/filmes', book: '/livros', game: '/jogos' };
    return `${routes[type] || '/serie'}/${slug}`;
  };
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = { serie: t.common.seriesNav, movie: t.movies.title, book: t.books.title, game: t.games.title };
    return labels[type] || type;
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const supabase = createClient();
        const [seriesRes, moviesRes, booksRes, gamesRes] = await Promise.all([
          supabase.from('series').select('*').ilike('title', `%${searchQuery}%`).limit(3),
          supabase.from('movies').select('*').ilike('title', `%${searchQuery}%`).limit(3),
          supabase.from('books').select('*').ilike('title', `%${searchQuery}%`).limit(3),
          supabase.from('games').select('*').ilike('title', `%${searchQuery}%`).limit(3),
        ]);
        const results: Array<{ type: 'serie' | 'movie' | 'book' | 'game'; item: Series | Movie | Book | Game }> = [
          ...(seriesRes.data || []).map((s) => ({ type: 'serie' as const, item: s as Series })),
          ...(moviesRes.data || []).map((m) => ({ type: 'movie' as const, item: m as Movie })),
          ...(booksRes.data || []).map((b) => ({ type: 'book' as const, item: b as Book })),
          ...(gamesRes.data || []).map((g) => ({ type: 'game' as const, item: g as Game })),
        ];
        setSearchResults(results.slice(0, 8));
      } catch (err) {
        console.error('[Search] Falha na busca:', err);
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-lg"
      style={{
        backgroundColor: isScrolled ? 'color-mix(in srgb, var(--surface-900-hex) 95%, transparent)' : 'color-mix(in srgb, var(--surface-900-hex) 80%, transparent)',
        boxShadow: isScrolled ? '0 10px 15px -3px rgba(0,0,0,0.2)' : 'none',
      }}
    >
      {/* Ad Banner Top */}
      <div className="hidden lg:flex justify-center items-center gap-4 py-2" style={{ backgroundColor: 'color-mix(in srgb, var(--surface-900-hex) 50%, transparent)' }}>
        <AdSlot width={728} height={90} format="horizontal" slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER} />
        <AdSlot width={728} height={90} format="horizontal" slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <span className="text-2xl font-extrabold">
              <span className="text-white">{brandFirst}</span>
              <span className="text-gradient">{brandSecond}</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-neon-blue transition-colors text-sm font-medium">
              {t.common.home}
            </Link>
            <Link href="/series" className="text-gray-300 hover:text-neon-blue transition-colors text-sm font-medium">
              {t.common.seriesNav}
            </Link>
            <Link href="/filmes" className="text-gray-300 hover:text-neon-blue transition-colors text-sm font-medium">
              {t.movies.title}
            </Link>
            <Link href="/livros" className="text-gray-300 hover:text-neon-blue transition-colors text-sm font-medium">
              {t.books.title}
            </Link>
            <Link href="/jogos" className="text-gray-300 hover:text-neon-blue transition-colors text-sm font-medium">
              {t.games.title}
            </Link>
            <Link href="/doar" className="flex items-center gap-1 text-pink-400 hover:text-pink-300 transition-colors text-sm font-medium">
              <Heart className="h-3.5 w-3.5" />
              {t.donate.navTitle}
            </Link>
          </nav>

          {/* Search */}
          <div ref={searchRef} className="hidden md:block relative w-72">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t.common.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-700 border border-surface-500 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 transition-all"
              />
            </div>
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 w-full bg-surface-800 border border-surface-600 rounded-xl shadow-2xl overflow-hidden"
                >
                  {searchResults.map(({ type, item }) => (
                    <Link
                      key={`${type}-${item.id}`}
                      href={getSearchUrl(type, item.slug)}
                      onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                      className="flex items-center gap-3 p-3 hover:bg-surface-700 transition-colors"
                    >
                      {item.poster_url && (
                        <Image src={item.poster_url} alt={item.title} width={40} height={56} className="object-cover rounded" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <p className="text-xs text-gray-400">
                          <span className="text-neon-blue">{getTypeLabel(type)}</span> • {item.year} • {item.genre ? translateGenre(item.genre, locale) : ''}
                        </p>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Language + Theme Toggle + Mobile Menu */}
          <div className="flex items-center gap-1">
            <Link
              href="/conta"
              className="p-2 hover:bg-surface-700 rounded-lg transition-colors"
              title={user ? t.auth.myAccount : t.auth.login}
            >
              {user ? (
                <User className="h-5 w-5 text-neon-blue" />
              ) : (
                <LogIn className="h-5 w-5 text-gray-400 hover:text-white" />
              )}
            </Link>
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-surface-700 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface-800/95 backdrop-blur-lg border-t border-surface-600"
          >
            <div className="px-4 py-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.common.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-700 border border-surface-500 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {searchResults.length > 0 && (
                <div className="bg-surface-700 border border-surface-600 rounded-xl overflow-hidden">
                  {searchResults.map(({ type, item }) => (
                    <Link
                      key={`${type}-${item.id}`}
                      href={getSearchUrl(type, item.slug)}
                      onClick={() => { setSearchQuery(''); setSearchResults([]); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-3 p-3 hover:bg-surface-600 transition-colors"
                    >
                      {item.poster_url && (
                        <Image src={item.poster_url} alt={item.title} width={32} height={44} className="object-cover rounded" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <p className="text-xs text-gray-400"><span className="text-neon-blue">{getTypeLabel(type)}</span> — {item.year} • {item.genre ? translateGenre(item.genre, locale) : ''}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">{t.common.home}</Link>
              <Link href="/series" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">{t.common.seriesNav}</Link>
              <Link href="/filmes" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">{t.movies.title}</Link>
              <Link href="/livros" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">{t.books.title}</Link>
              <Link href="/jogos" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">{t.games.title}</Link>
              <Link href="/doar" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-1.5 py-2 text-pink-400 hover:text-pink-300">
                <Heart className="h-4 w-4" />
                {t.donate.navTitle}
              </Link>
              <Link href="/conta" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-1.5 py-2 text-neon-blue hover:text-white">
                {user ? <User className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                {user ? t.auth.myAccount : t.auth.login}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
