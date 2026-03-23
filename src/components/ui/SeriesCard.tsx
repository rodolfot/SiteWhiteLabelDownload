'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Heart } from 'lucide-react';
import { Series } from '@/types/database';
import { useFavorites } from '@/hooks/useFavorites';
import { useI18n } from '@/lib/i18n/context';

interface SeriesCardProps {
  series: Series;
  index?: number;
}

export const SeriesCard = memo(function SeriesCard({ series, index = 0 }: SeriesCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(series.id);
  const [imgError, setImgError] = useState(false);
  const { t } = useI18n();

  return (
    <div
      className="animate-fadeIn"
      style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
    >
      <div className="relative">
        <Link href={`/serie/${series.slug}`} className="group block">
          <div className="relative aspect-[2/3] rounded-xl overflow-hidden card-hover">
            {imgError ? (
              <div className="absolute inset-0 bg-surface-700 flex items-center justify-center">
                <span className="text-gray-500 text-xs text-center px-2">{series.title}</span>
              </div>
            ) : (
              <Image
                src={series.poster_url || '/images/placeholder.svg'}
                alt={series.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            )}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to top, color-mix(in srgb, var(--surface-900-hex) 80%, transparent), transparent)' }} />
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-white font-semibold text-sm truncate">{series.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-300 text-xs">{series.year}</span>
                {series.rating > 0 && (
                  <span className="flex items-center gap-1 text-yellow-400 text-xs">
                    <Star className="h-3 w-3 fill-current" />
                    {series.rating}
                  </span>
                )}
              </div>
            </div>
            {series.featured && (
              <div className="absolute top-2 left-2 bg-neon-blue/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Destaque
              </div>
            )}
          </div>
        </Link>
        {/* Favorite button — outside Link to prevent navigation */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(series.id); }}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all"
          aria-label={favorited ? t.common.removeFavorite : t.common.addFavorite}
        >
          <Heart className={`h-4 w-4 transition-colors ${favorited ? 'fill-red-500 text-red-500' : 'text-white/70 hover:text-red-400'}`} />
        </button>
      </div>
      <div className="mt-2">
        <h3 className="text-white font-medium text-sm truncate">{series.title}</h3>
        <p className="text-gray-400 text-xs mt-0.5">{series.genre}</p>
      </div>
    </div>
  );
});
