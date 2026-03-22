export interface Series {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  poster_url: string;
  backdrop_url: string;
  year: number;
  genre: string;
  rating: number;
  category: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Season {
  id: string;
  series_id: string;
  number: number;
  title: string;
  trailer_url: string;
  created_at: string;
}

export interface Episode {
  id: string;
  season_id: string;
  number: number;
  title: string;
  download_url: string;
  file_size: string;
  quality: string;
  created_at: string;
}

export interface SeasonWithEpisodes extends Season {
  episodes: Episode[];
}

export interface SeriesWithSeasons extends Series {
  seasons: SeasonWithEpisodes[];
}
