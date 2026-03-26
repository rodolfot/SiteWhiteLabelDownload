'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, Calendar, Gamepad2, Download, Cpu, Monitor, Lock } from 'lucide-react';
import { Game, DownloadLink } from '@/types/database';
import { DownloadTimer } from '@/components/ads/DownloadTimer';
import { AdSlot } from '@/components/ads/AdSlot';
import { StarRating } from './StarRating';
import { Comments } from './Comments';
import { useI18n } from '@/lib/i18n/context';
import { translateGenre, getLocalizedGameTitle, getLocalizedGameSynopsis } from '@/lib/genreTranslations';
import { useDonorStatus } from '@/hooks/useDonorStatus';

interface GameDetailProps {
  game: Game;
  downloadLinks?: DownloadLink[];
}

export function GameDetail({ game, downloadLinks = [] }: GameDetailProps) {
  const [backdropError, setBackdropError] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const { t, locale } = useI18n();
  const localizedTitle = getLocalizedGameTitle(game, locale);
  const localizedSynopsis = getLocalizedGameSynopsis(game, locale);
  const localizedGenre = game.genre ? translateGenre(game.genre, locale) : '';
  const { isDonor } = useDonorStatus();

  return (
    <div className="min-h-screen">
      {/* Backdrop Hero */}
      <div className="relative h-[60vh] min-h-[400px]">
        {backdropError ? (
          <div className="absolute inset-0 bg-surface-800" />
        ) : (
          <Image
            src={game.backdrop_url || game.poster_url || '/images/placeholder.svg'}
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
          <div className="flex flex-col sm:flex-row gap-6 lg:w-2/3">
            {/* Poster */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="shrink-0">
              <div className="relative w-48 h-72 rounded-xl overflow-hidden shadow-2xl shadow-black/50 mx-auto sm:mx-0">
                {posterError ? (
                  <div className="absolute inset-0 bg-surface-700 flex items-center justify-center">
                    <span className="text-gray-500 text-xs text-center px-2">{game.title}</span>
                  </div>
                ) : (
                  <Image
                    src={game.poster_url || '/images/placeholder.svg'}
                    alt={game.title}
                    fill
                    className="object-cover"
                    onError={() => setPosterError(true)}
                  />
                )}
              </div>
            </motion.div>

            {/* Metadata */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">{localizedTitle}</h1>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                {game.year && (
                  <span className="flex items-center gap-1.5 text-gray-300 text-sm">
                    <Calendar className="h-4 w-4" />
                    {game.year}
                  </span>
                )}
                {game.platform && (
                  <span className="flex items-center gap-1.5 text-gray-300 text-sm">
                    <Gamepad2 className="h-4 w-4" />
                    {game.platform}
                  </span>
                )}
                {game.genre && (
                  <span className="flex items-center gap-1.5 text-gray-300 text-sm">
                    {localizedGenre}
                  </span>
                )}
                {game.rating > 0 && (
                  <span className="flex items-center gap-1.5 text-yellow-400 text-sm">
                    <Star className="h-4 w-4 fill-current" />
                    {game.rating}/10
                  </span>
                )}
              </div>

              {game.developer && (
                <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-1">
                  <Cpu className="h-4 w-4" />
                  {t.games.developer}: {game.developer}
                </div>
              )}
              {game.publisher && (
                <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-4">
                  <Monitor className="h-4 w-4" />
                  {t.games.publisher}: {game.publisher}
                </div>
              )}

              <div className="mb-4">
                <StarRating seriesId={game.id} initialRating={game.rating} />
              </div>

              {localizedSynopsis && (
                <p className="text-gray-300 text-sm leading-relaxed mb-6">{localizedSynopsis}</p>
              )}

              {/* Requirements */}
              {(game.min_requirements || game.rec_requirements) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {game.min_requirements && (
                    <div className="bg-surface-700/50 border border-surface-600 rounded-lg p-3">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">{t.games.minRequirements}</h3>
                      <p className="text-gray-300 text-xs whitespace-pre-line">{game.min_requirements}</p>
                    </div>
                  )}
                  {game.rec_requirements && (
                    <div className="bg-surface-700/50 border border-surface-600 rounded-lg p-3">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">{t.games.recRequirements}</h3>
                      <p className="text-gray-300 text-xs whitespace-pre-line">{game.rec_requirements}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Download */}
              {(game.download_url || downloadLinks.length > 0) ? (
                <div className="space-y-2">
                  {game.download_url && (
                    <div className="bg-surface-700/50 border border-surface-600 rounded-lg p-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <Download className="h-5 w-5 text-neon-blue shrink-0" />
                          <div>
                            <p className="text-white text-sm font-medium">{localizedTitle}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {game.file_size && <span className="text-xs text-gray-500">{game.file_size}</span>}
                            </div>
                          </div>
                        </div>
                        <DownloadTimer downloadUrl={game.download_url} episodeTitle={localizedTitle} contentType="game" contentId={game.id} />
                      </div>
                    </div>
                  )}
                  {downloadLinks.map((link) => (
                    <div key={link.id} className="bg-surface-700/50 border border-surface-600 rounded-lg p-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <Download className="h-5 w-5 text-neon-blue shrink-0" />
                          <div>
                            <p className="text-white text-sm font-medium flex items-center gap-1.5">
                              {link.label || localizedTitle}
                              {link.donor_only && <Lock className="h-3 w-3 text-yellow-500" />}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {link.quality && <span className="text-xs text-neon-blue bg-neon-blue/10 px-1.5 py-0.5 rounded">{link.quality}</span>}
                              {link.file_size && <span className="text-xs text-gray-500">{link.file_size}</span>}
                              {link.donor_only && <span className="text-xs text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">{t.donate.navTitle}</span>}
                            </div>
                          </div>
                        </div>
                        <DownloadTimer downloadUrl={link.download_url} episodeTitle={`${localizedTitle} - ${link.label || link.quality}`} contentType="game" contentId={game.id} quality={link.quality} donorOnly={link.donor_only} isDonor={isDonor} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-surface-700/50 border border-surface-600 rounded-lg p-8 text-center">
                  <Download className="h-8 w-8 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">{t.games.noGames}</p>
                </div>
              )}

              {/* Comments */}
              <Comments gameId={game.id} />
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
