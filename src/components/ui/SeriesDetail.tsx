'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, Calendar, Film, Download } from 'lucide-react';
import { Series, SeasonWithEpisodes } from '@/types/database';
import { DownloadTimer } from '@/components/ads/DownloadTimer';
import { AdSlot } from '@/components/ads/AdSlot';
import { VideoEmbed } from './VideoEmbed';

interface SeriesDetailProps {
  series: Series;
  seasons: SeasonWithEpisodes[];
}

export function SeriesDetail({ series, seasons }: SeriesDetailProps) {
  const [activeSeason, setActiveSeason] = useState(0);
  const [backdropError, setBackdropError] = useState(false);
  const [posterError, setPosterError] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Backdrop Hero */}
      <div className="relative h-[60vh] min-h-[400px]">
        {backdropError ? (
          <div className="absolute inset-0 bg-surface-800" />
        ) : (
          <Image
            src={series.backdrop_url || series.poster_url || '/images/placeholder.svg'}
            alt={series.title}
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
                    <span className="text-gray-500 text-xs text-center px-2">{series.title}</span>
                  </div>
                ) : (
                  <Image
                    src={series.poster_url || '/images/placeholder.svg'}
                    alt={series.title}
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
                {series.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                {series.year && (
                  <span className="flex items-center gap-1.5 text-gray-300 text-sm">
                    <Calendar className="h-4 w-4" />
                    {series.year}
                  </span>
                )}
                {series.genre && (
                  <span className="flex items-center gap-1.5 text-gray-300 text-sm">
                    <Film className="h-4 w-4" />
                    {series.genre}
                  </span>
                )}
                {series.rating > 0 && (
                  <span className="flex items-center gap-1.5 text-yellow-400 text-sm">
                    <Star className="h-4 w-4 fill-current" />
                    {series.rating}/10
                  </span>
                )}
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                {series.synopsis}
              </p>

              {/* Season Tabs */}
              {seasons.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                    {seasons.map((season, i) => (
                      <button
                        key={season.id}
                        onClick={() => setActiveSeason(i)}
                        className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          i === activeSeason
                            ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg shadow-neon-blue/20'
                            : 'bg-surface-700 text-gray-400 hover:text-white hover:bg-surface-600'
                        }`}
                      >
                        {season.title || `Temporada ${season.number}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Season Trailer */}
              {seasons.length > 0 && seasons[activeSeason]?.trailer_url && (
                <div className="mb-6">
                  <VideoEmbed
                    url={seasons[activeSeason].trailer_url}
                    title={`${series.title} - ${seasons[activeSeason].title || `Temporada ${seasons[activeSeason].number}`}`}
                    posterUrl={series.backdrop_url || series.poster_url}
                  />
                </div>
              )}

              {/* Episodes */}
              {seasons.length > 0 && seasons[activeSeason] && (
                <motion.div
                  key={activeSeason}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  {seasons[activeSeason].episodes.map((episode) => (
                    <div
                      key={episode.id}
                      className="flex items-center justify-between bg-surface-700/50 border border-surface-600 rounded-lg p-4 hover:bg-surface-700 transition-colors group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="text-neon-blue font-bold text-lg w-8 text-center shrink-0">
                          {String(episode.number).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-white text-sm font-medium truncate">
                            {episode.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            {episode.quality && (
                              <span className="text-xs text-neon-blue bg-neon-blue/10 px-1.5 py-0.5 rounded">
                                {episode.quality}
                              </span>
                            )}
                            {episode.file_size && (
                              <span className="text-xs text-gray-500">{episode.file_size}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <DownloadTimer
                        downloadUrl={episode.download_url}
                        episodeTitle={`${series.title} - ${seasons[activeSeason].title || `T${seasons[activeSeason].number}`} E${String(episode.number).padStart(2, '0')} - ${episode.title}`}
                      />
                    </div>
                  ))}
                </motion.div>
              )}

              {seasons.length === 0 && (
                <div className="bg-surface-700/50 border border-surface-600 rounded-lg p-8 text-center">
                  <Download className="h-8 w-8 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhum episódio disponível ainda.</p>
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
