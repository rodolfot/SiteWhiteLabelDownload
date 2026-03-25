import { Locale } from './i18n/dictionaries';
import { Series, Movie } from '@/types/database';

type TranslationMap = Partial<Record<Exclude<Locale, 'pt-BR'>, string>>;

const genreMap: Record<string, TranslationMap> = {
  'Ficção Científica': { en: 'Sci-Fi', es: 'Ciencia Ficción' },
  'Ficção cientifica': { en: 'Sci-Fi', es: 'Ciencia Ficción' },
  'adulto': { en: 'Adult', es: 'Adulto' },
  'Adulto': { en: 'Adult', es: 'Adulto' },
  'Ação': { en: 'Action', es: 'Acción' },
  'Aventura': { en: 'Adventure', es: 'Aventura' },
  'Animação': { en: 'Animation', es: 'Animación' },
  'Comédia': { en: 'Comedy', es: 'Comedia' },
  'Crime': { en: 'Crime', es: 'Crimen' },
  'Documentário': { en: 'Documentary', es: 'Documental' },
  'Drama': { en: 'Drama', es: 'Drama' },
  'Fantasia': { en: 'Fantasy', es: 'Fantasía' },
  'Horror': { en: 'Horror', es: 'Terror' },
  'Mistério': { en: 'Mystery', es: 'Misterio' },
  'Romance': { en: 'Romance', es: 'Romance' },
  'Suspense': { en: 'Thriller', es: 'Suspenso' },
  'Terror': { en: 'Horror', es: 'Terror' },
  'Infantil': { en: 'Kids', es: 'Infantil' },
  'Anime': { en: 'Anime', es: 'Anime' },
  'Geral': { en: 'General', es: 'General' },
  'Thriller': { en: 'Thriller', es: 'Suspenso' },
  'Western': { en: 'Western', es: 'Western' },
  'Biografia': { en: 'Biography', es: 'Biografía' },
  'Musical': { en: 'Musical', es: 'Musical' },
  'Guerra': { en: 'War', es: 'Guerra' },
  'Esporte': { en: 'Sport', es: 'Deporte' },
  'Reality': { en: 'Reality', es: 'Reality' },
};

/**
 * Translates a genre string (or comma-separated list) to the given locale.
 * Falls back to the original string if no translation is found.
 */
export function translateGenre(genre: string, locale: Locale): string {
  if (locale === 'pt-BR') return genre;
  return genre
    .split(',')
    .map((g) => {
      const trimmed = g.trim();
      return genreMap[trimmed]?.[locale] ?? trimmed;
    })
    .join(', ');
}

/**
 * Returns the localized title for a series, falling back to the PT-BR title.
 */
export function getLocalizedTitle(series: Series, locale: Locale): string {
  if (locale === 'en') return series.title_en || series.title;
  if (locale === 'es') return series.title_es || series.title;
  return series.title;
}

/**
 * Returns the localized synopsis for a series, falling back to the PT-BR synopsis.
 */
export function getLocalizedSynopsis(series: Series, locale: Locale): string {
  if (locale === 'en') return series.synopsis_en || series.synopsis || '';
  if (locale === 'es') return series.synopsis_es || series.synopsis || '';
  return series.synopsis || '';
}

/**
 * Returns the localized title for a movie, falling back to the PT-BR title.
 */
export function getLocalizedMovieTitle(movie: Movie, locale: Locale): string {
  if (locale === 'en') return movie.title_en || movie.title;
  if (locale === 'es') return movie.title_es || movie.title;
  return movie.title;
}

/**
 * Returns the localized synopsis for a movie, falling back to the PT-BR synopsis.
 */
export function getLocalizedMovieSynopsis(movie: Movie, locale: Locale): string {
  if (locale === 'en') return movie.synopsis_en || movie.synopsis || '';
  if (locale === 'es') return movie.synopsis_es || movie.synopsis || '';
  return movie.synopsis || '';
}
