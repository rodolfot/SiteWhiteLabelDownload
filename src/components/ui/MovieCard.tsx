'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock, Heart } from 'lucide-react';
import { Movie } from '@/types/database';
import { useFavorites } from '@/hooks/useFavorites';
import { useI18n } from '@/lib/i18n/context';
import { translateGenre, getLocalizedMovieTitle } from '@/lib/genreTranslations';

interface MovieCardProps {
  movie: Movie;
  index?: number;
}

export const MovieCard = memo(function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(movie.id);
  const [imgError, setImgError] = useState(false);
  const { t, locale } = useI18n();
  const localizedTitle = getLocalizedMovieTitle(movie, locale);
  const localizedGenre = movie.genre ? translateGenre(movie.genre, locale) : '';

  return (
    <div
      className="animate-fadeIn"
      style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
    >
      <div className="relative">
        <Link href={`/filmes/${movie.slug}`} className="group block">
          <div className="relative aspect-[2/3] rounded-xl overflow-hidden card-hover">
            {imgError ? (
              <div className="absolute inset-0 bg-surface-700 flex items-center justify-center">
                <span className="text-gray-500 text-xs text-center px-2">{movie.title}</span>
              </div>
            ) : (
              <Image
                src={movie.poster_url || '/images/placeholder.svg'}
                alt={localizedTitle}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            )}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to top, color-mix(in srgb, var(--surface-900-hex) 80%, transparent), transparent)' }} />
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-white font-semibold text-sm truncate">{localizedTitle}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-300 text-xs">{movie.year}</span>
                {movie.rating > 0 && (
                  <span className="flex items-center gap-1 text-yellow-400 text-xs">
                    <Star className="h-3 w-3 fill-current" />
                    {movie.rating}
                  </span>
                )}
                {movie.duration && (
                  <span className="flex items-center gap-1 text-gray-300 text-xs">
                    <Clock className="h-3 w-3" />
                    {movie.duration} {t.movies.minutes}
                  </span>
                )}
              </div>
            </div>
            {movie.featured && (
              <div className="absolute top-2 left-2 bg-neon-blue/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {t.series.featured}
              </div>
            )}
          </div>
        </Link>
        {/* Favorite button — outside Link to prevent navigation */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(movie.id); }}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all"
          aria-label={favorited ? t.common.removeFavorite : t.common.addFavorite}
        >
          <Heart className={`h-4 w-4 transition-colors ${favorited ? 'fill-red-500 text-red-500' : 'text-white/70 hover:text-red-400'}`} />
        </button>
      </div>
      <div className="mt-2">
        <h3 className="text-white font-medium text-sm truncate">{localizedTitle}</h3>
        <p className="text-gray-400 text-xs mt-0.5">{localizedGenre}</p>
      </div>
    </div>
  );
});
