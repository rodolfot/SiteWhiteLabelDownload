'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Book } from '@/types/database';
import { BookCard } from './BookCard';
import { useI18n } from '@/lib/i18n/context';

interface BookRowProps {
  title: string;
  books: Book[];
}

export function BookRow({ title, books }: BookRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const displayTitle = title === '📚 Lançamentos de Livros' ? t.home.latestBooks : title;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (books.length === 0) return null;

  return (
    <section className="relative group/row">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 px-4 sm:px-6 lg:px-8">
        {displayTitle}
      </h2>

      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
          style={{ background: 'linear-gradient(to right, var(--surface-900-hex), transparent)' }}
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
          style={{ background: 'linear-gradient(to left, var(--surface-900-hex), transparent)' }}
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {books.map((item, i) => (
            <div key={item.id} className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px]">
              <BookCard book={item} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
