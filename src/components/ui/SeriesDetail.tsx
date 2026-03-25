'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, Calendar, Film, Download, Globe, ChevronDown } from 'lucide-react';
import { Series, SeasonWithEpisodes, EpisodeLink } from '@/types/database';
import { DownloadTimer } from '@/components/ads/DownloadTimer';
import { AdSlot } from '@/components/ads/AdSlot';
import { VideoEmbed } from './VideoEmbed';
import { Comments } from './Comments';
import { StarRating } from './StarRating';
import { useI18n } from '@/lib/i18n/context';
import { translateGenre, getLocalizedTitle, getLocalizedSynopsis } from '@/lib/genreTranslations';

interface SeriesDetailProps {
  series: Series;
  seasons: SeasonWithEpisodes[];
}

/**
 * Returns a localised season label.
 * Priority: DB translated column → strip PT-BR prefix + translated word.
 * e.g. DB "Temporada 1 - O Alvo" with title_en="Season 1 - The Target"
 *      → "Season 1 - The Target" (EN) | "Temporada 1 - El objetivo" (ES)
 */
function buildSeasonLabel(
  season: { title?: string | null; title_en?: string | null; title_es?: string | null; number: number },
  word: string,
  locale: string
): string {
  if (locale === 'en' && season.title_en) return season.title_en;
  if (locale === 'es' && season.title_es) return season.title_es;
  // Fallback: strip any "Word N - " PT-BR prefix and reconstruct
  if (!season.title) return `${word} ${season.number}`;
  const subtitle = season.title.replace(/^\D+\d+\s*[-–]\s*/, '').trim() || season.title;
  return `${word} ${season.number} - ${subtitle}`;
}

function EpisodeRow({ episode, series, seasonLabel }: {
  episode: SeasonWithEpisodes['episodes'][number];
  series: Series;
  seasonLabel: string;
}) {
  const [showLinks, setShowLinks] = useState(false);
  const { t, locale } = useI18n();
  const links: EpisodeLink[] = ('episode_links' in episode && Array.isArray(episode.episode_links))
    ? episode.episode_links
    : [];
  const hasLinks = links.length > 0;
  const seriesTitle = getLocalizedTitle(series, locale);
  // Use DB translated field when available; fallback strips PT-BR prefix and adds translated word
  const localizedEpisodeTitle =
    (locale === 'en' && episode.title_en) ? episode.title_en :
    (locale === 'es' && episode.title_es) ? episode.title_es :
    `${t.series.episode} ${episode.number} — ${episode.title.replace(/^\D+\d+\s*[-–]\s*/, '').trim() || episode.title}`;
  const episodeTitle = `${seriesTitle} - ${seasonLabel} E${String(episode.number).padStart(2, '0')} - ${localizedEpisodeTitle}`;

  return (
    <div className="bg-surface-700/50 border border-surface-600 rounded-lg hover:bg-surface-700 transition-colors group">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4 min-w-0">
          <span className="text-neon-blue font-bold text-lg w-8 text-center shrink-0">
            {String(episode.number).padStart(2, '0')}
          </span>
          <div className="min-w-0">
            <h4 className="text-white text-sm font-medium truncate">
              {localizedEpisodeTitle}
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
              {hasLinks && (
                <span className="text-xs text-gray-500">
                  {links.length} {links.length === 1 ? t.series.language : t.series.languages}
                </span>
              )}
            </div>
          </div>
        </div>

        {hasLinks ? (
          <button
            onClick={() => setShowLinks(!showLinks)}
            className="flex items-center gap-2 bg-surface-700 hover:bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-sm text-white transition-all hover:border-neon-blue group"
          >
            <Globe className="h-4 w-4 text-neon-blue" />
            {t.series.download}
            <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${showLinks ? 'rotate-180' : ''}`} />
          </button>
        ) : (
          <DownloadTimer
            downloadUrl={episode.download_url}
            episodeTitle={episodeTitle}
          />
        )}
      </div>

      {/* Language links dropdown */}
      {hasLinks && showLinks && (
        <div className="px-4 pb-4 pt-1 border-t border-surface-600/50">
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <div key={link.id} className="flex items-center justify-between bg-surface-800/70 rounded-lg px-3 py-2 gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Globe className="h-3.5 w-3.5 text-neon-purple shrink-0" />
                  <span className="text-sm text-white">{link.language}</span>
                  {link.quality && (
                    <span className="text-xs text-neon-blue bg-neon-blue/10 px-1.5 py-0.5 rounded">
                      {link.quality}
                    </span>
                  )}
                  {link.file_size && (
                    <span className="text-xs text-gray-500">{link.file_size}</span>
                  )}
                </div>
                <div className="shrink-0">
                  <DownloadTimer
                    downloadUrl={link.download_url}
                    episodeTitle={`${episodeTitle} [${link.language}]`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SeriesDetail({ series, seasons }: SeriesDetailProps) {
  const [activeSeason, setActiveSeason] = useState(0);
  const [backdropError, setBackdropError] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const { t, locale } = useI18n();
  const localizedTitle = getLocalizedTitle(series, locale);
  const localizedSynopsis = getLocalizedSynopsis(series, locale);
  const localizedGenre = series.genre ? translateGenre(series.genre, locale) : '';

  return (
    <div className="min-h-screen">
      {/* Backdrop Hero */}
      <div className="relative h-[60vh] min-h-[400px]">
        {backdropError ? (
          <div className="absolute inset-0 bg-surface-800" />
        ) : (
          <Image
            src={series.backdrop_url || series.poster_url || '/images/placeholder.svg'}
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
                {localizedTitle}
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
                    {localizedGenre}
                  </span>
                )}
                {series.rating > 0 && (
                  <span className="flex items-center gap-1.5 text-yellow-400 text-sm">
                    <Star className="h-4 w-4 fill-current" />
                    {series.rating}/10
                  </span>
                )}
              </div>

              <div className="mb-4">
                <StarRating seriesId={series.id} initialRating={series.rating} />
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                {localizedSynopsis}
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
                        {buildSeasonLabel(season, t.series.season, locale)}
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
                    title={`${series.title} - ${buildSeasonLabel(seasons[activeSeason], t.series.season, locale)}`}
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
                    <EpisodeRow
                      key={episode.id}
                      episode={episode}
                      series={series}
                      seasonLabel={buildSeasonLabel(seasons[activeSeason], t.series.season, locale)}
                    />
                  ))}
                </motion.div>
              )}

              {seasons.length === 0 && (
                <div className="bg-surface-700/50 border border-surface-600 rounded-lg p-8 text-center">
                  <Download className="h-8 w-8 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">{t.series.noEpisodes}</p>
                </div>
              )}

              {/* Comentários */}
              <Comments seriesId={series.id} />
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
