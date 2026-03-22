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

export interface EpisodeLink {
  id: string;
  episode_id: string;
  language: string;
  download_url: string;
  file_size: string;
  quality: string;
  created_at: string;
}

export interface EpisodeWithLinks extends Episode {
  episode_links: EpisodeLink[];
}

export interface SeasonWithEpisodes extends Season {
  episodes: (Episode | EpisodeWithLinks)[];
}

export interface SeriesWithSeasons extends Series {
  seasons: SeasonWithEpisodes[];
}

export interface Comment {
  id: string;
  series_id: string;
  nickname: string;
  content: string;
  approved: boolean;
  created_at: string;
}

export interface SeriesRequest {
  id: string;
  title: string;
  description: string;
  nickname: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  admin_notes: string;
  votes: number;
  created_at: string;
}

export interface PageView {
  id: string;
  page_path: string;
  series_id: string | null;
  referrer: string;
  user_agent: string;
  ip_hash: string;
  created_at: string;
}
