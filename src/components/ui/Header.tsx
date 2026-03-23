'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X } from 'lucide-react';
import { Series } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { siteConfig } from '@/lib/site-config';
import { getBrandParts } from '@/lib/brand';
import { AdSlot } from '@/components/ads/AdSlot';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useI18n } from '@/lib/i18n/context';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Series[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [brandFirst, brandSecond] = getBrandParts();
  const { t } = useI18n();

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
        const { data } = await supabase
          .from('series')
          .select('*')
          .ilike('title', `%${searchQuery}%`)
          .limit(5);
        setSearchResults(data || []);
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
            <Link href="/#categorias" className="text-gray-300 hover:text-neon-blue transition-colors text-sm font-medium">
              {t.common.categories}
            </Link>
            <Link href="/#lancamentos" className="text-gray-300 hover:text-neon-blue transition-colors text-sm font-medium">
              {t.series.featured}
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
                  {searchResults.map((series) => (
                    <Link
                      key={series.id}
                      href={`/serie/${series.slug}`}
                      onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                      className="flex items-center gap-3 p-3 hover:bg-surface-700 transition-colors"
                    >
                      {series.poster_url && (
                        <Image src={series.poster_url} alt={series.title} width={40} height={56} className="object-cover rounded" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">{series.title}</p>
                        <p className="text-xs text-gray-400">{series.year} • {series.genre}</p>
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
                  {searchResults.map((series) => (
                    <Link
                      key={series.id}
                      href={`/serie/${series.slug}`}
                      onClick={() => { setSearchQuery(''); setSearchResults([]); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-3 p-3 hover:bg-surface-600 transition-colors"
                    >
                      {series.poster_url && (
                        <Image src={series.poster_url} alt={series.title} width={32} height={44} className="object-cover rounded" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">{series.title}</p>
                        <p className="text-xs text-gray-400">{series.year} - {series.genre}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">{t.common.home}</Link>
              <Link href="/#categorias" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">{t.common.categories}</Link>
              <Link href="/#lancamentos" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">{t.series.featured}</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
