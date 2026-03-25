'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, Calendar, Film, Download, Clock } from 'lucide-react';
import { Movie } from '@/types/database';
import { DownloadTimer } from '@/components/ads/DownloadTimer';
import { AdSlot } from '@/components/ads/AdSlot';
import { StarRating } from './StarRating';
import { useI18n } from '@/lib/i18n/context';
import { translateGenre, getLocalizedMovieTitle, getLocalizedMovieSynopsis } from '@/lib/genreTranslations';

interface MovieDetailProps {
  movie: Movie;
}

export function MovieDetail({ movie }: MovieDetailProps) {
  const [backdropError, setBackdropError] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const { t, locale } = useI18n();
  const localizedTitle = getLocalizedMovieTitle(movie, locale);
  const localizedSynopsis = getLocalizedMovieSynopsis(movie, locale);
  const localizedGenre = movie.genre ? translateGenre(movie.genre, locale) : '';

  return (
    <div className="min-h-screen">
      {/* Backdrop Hero */}
      <div className="relative h-[60vh] min-h-[400px]">
        {backdropError ? (
          <div className="absolute inset-0 bg-surface-800" />
        ) : (
          <Image
            src={movie.backdrop_url || movie.poster_url || '/images/placeholder.svg'}
            alt={localizedTitle}
            fill
            className="object-cover"
            priority
            onError={() => setBackdropError(true)}
          />
        )}
        <div className="absolute inset-0 gradient-overlay" />
        <div className="absolute inset-0 gradient-overlay-left w-1/2" />
      </div>

      {/* Content */}
      <div className="relative -mt-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Poster + Info */}
          <div className="flex flex-col sm:flex-row gap-6 lg:w-2/3">
            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="shrink-0"
            >
              <div className="relative w-48 h-72 rounded-xl overflow-hidden shadow-2xl shadow-black/50 mx-auto sm:mx-0">
                {posterError ? (
                  <div className="absolute inset-0 bg-surface-700 flex items-center justify-center">
                    <span className="text-gray-500 text-xs text-center px-2">{movie.title}</span>
                  </div>
                ) : (
                  <Image
                    src={movie.poster_url || '/images/placeholder.svg'}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    onError={() => setPosterError(true)}
                  />
                )}
              </div>
            </motion.div>

            {/* Metadata */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1"
            >
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                {localizedTitle}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                {movie.year && (
                  <span className="flex items-center gap-1.5 text-gray-300 text-sm">
                    <Calendar className="h-4 w-4" />
                    {movie.year}
                  </span>
                )}
                {movie.duration && (
                  <span className="flex items-center gap-1.5 text-gray-300 text-sm">
                    <Clock className="h-4 w-4" />
                    {movie.duration} {t.movies.minutes}
                  </span>
                )}
                {movie.genre && (
                  <span className="flex items-center gap-1.5 text-gray-300 text-sm">
                    <Film className="h-4 w-4" />
                    {localizedGenre}
                  </span>
                )}
                {movie.rating > 0 && (
                  <span className="flex items-center gap-1.5 text-yellow-400 text-sm">
                    <Star className="h-4 w-4 fill-current" />
                    {movie.rating}/10
                  </span>
                )}
                {movie.quality && (
                  <span className="text-xs text-neon-blue bg-neon-blue/10 px-2 py-0.5 rounded">
                    {movie.quality}
                  </span>
                )}
              </div>

              <div className="mb-4">
                <StarRating seriesId={movie.id} initialRating={movie.rating} />
              </div>

              {localizedSynopsis && (
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  {localizedSynopsis}
                </p>
              )}

              {/* Download */}
              {movie.download_url ? (
                <div className="bg-surface-700/50 border border-surface-600 rounded-lg p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Download className="h-5 w-5 text-neon-blue shrink-0" />
                      <div>
                        <p className="text-white text-sm font-medium">{localizedTitle}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {movie.quality && (
                            <span className="text-xs text-neon-blue bg-neon-blue/10 px-1.5 py-0.5 rounded">
                              {movie.quality}
                            </span>
                          )}
                          {movie.file_size && (
                            <span className="text-xs text-gray-500">{movie.file_size}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <DownloadTimer
                      downloadUrl={movie.download_url}
                      episodeTitle={localizedTitle}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-surface-700/50 border border-surface-600 rounded-lg p-8 text-center">
                  <Download className="h-8 w-8 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">{t.movies.noMovies}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar Ad */}
          <div className="hidden lg:block lg:w-1/3">
            <div className="sticky top-[180px] space-y-6">
              <AdSlot width={300} height={600} slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
