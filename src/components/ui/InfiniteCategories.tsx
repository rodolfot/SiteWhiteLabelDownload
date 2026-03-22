'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Series } from '@/types/database';
import { CategoryRow } from './CategoryRow';

interface InfiniteCategoriesProps {
  /** Initial categories already rendered server-side */
  initialCategories: [string, Series[]][];
  /** Remaining categories to lazy-load */
  remainingCategories: [string, Series[]][];
  /** How many categories to load per batch */
  batchSize?: number;
}

export function InfiniteCategories({
  initialCategories,
  remainingCategories,
  batchSize = 3,
}: InfiniteCategoriesProps) {
  const [visible, setVisible] = useState<[string, Series[]][]>(initialCategories);
  const [remaining, setRemaining] = useState<[string, Series[]][]>(remainingCategories);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (remaining.length === 0 || loading) return;
    setLoading(true);
    // Simulate slight delay for smooth transition
    requestAnimationFrame(() => {
      const next = remaining.slice(0, batchSize);
      setVisible((prev) => [...prev, ...next]);
      setRemaining((prev) => prev.slice(batchSize));
      setLoading(false);
    });
  }, [remaining, loading, batchSize]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="space-y-10">
      {visible.map(([category, seriesList], i) => (
        <CategoryRow
          key={category}
          title={category}
          series={seriesList}
          showNativeAd={i % 2 === 0}
        />
      ))}

      {/* Sentinel for intersection observer */}
      {remaining.length > 0 && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          {loading && (
            <Loader2 className="h-6 w-6 text-neon-blue animate-spin" />
          )}
        </div>
      )}
    </div>
  );
}
