'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Series } from '@/types/database';
import { SeriesCard } from './SeriesCard';
import { NativeAd } from '../ads/NativeAd';

interface CategoryRowProps {
  title: string;
  series: Series[];
  showNativeAd?: boolean;
}

export function CategoryRow({ title, series, showNativeAd = false }: CategoryRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (series.length === 0) return null;

  return (
    <section className="relative group/row">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 px-4 sm:px-6 lg:px-8">
        {title}
      </h2>

      <div className="relative">
        {/* Scroll Buttons */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-surface-900 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-surface-900 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Scrollable Row */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {series.map((item, i) => (
            <React.Fragment key={item.id}>
              {/* Insert native ad before 5th item */}
              {showNativeAd && i === 4 && (
                <div className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px]">
                  <NativeAd />
                </div>
              )}
              <div className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px]">
                <SeriesCard series={item} index={i} />
              </div>
            </React.Fragment>
          ))}
          {showNativeAd && series.length <= 4 && (
            <div className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px]">
              <NativeAd />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
