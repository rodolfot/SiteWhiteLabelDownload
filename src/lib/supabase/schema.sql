-- DownDoor Database Schema
-- Execute this SQL in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Series table
CREATE TABLE series (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  synopsis TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  year INTEGER,
  genre VARCHAR(100),
  rating DECIMAL(3,1) DEFAULT 0,
  category VARCHAR(100) DEFAULT 'Geral',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seasons table
CREATE TABLE seasons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE NOT NULL,
  number INTEGER NOT NULL,
  title VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(series_id, number)
);

-- Episodes table
CREATE TABLE episodes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE NOT NULL,
  number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  download_url TEXT NOT NULL,
  file_size VARCHAR(50),
  quality VARCHAR(20) DEFAULT '1080p',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(season_id, number)
);

-- Indexes for performance
CREATE INDEX idx_series_slug ON series(slug);
CREATE INDEX idx_series_category ON series(category);
CREATE INDEX idx_series_featured ON series(featured);
CREATE INDEX idx_seasons_series_id ON seasons(series_id);
CREATE INDEX idx_episodes_season_id ON episodes(season_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_series_updated_at
  BEFORE UPDATE ON series
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access for series" ON series FOR SELECT USING (true);
CREATE POLICY "Public read access for seasons" ON seasons FOR SELECT USING (true);
CREATE POLICY "Public read access for episodes" ON episodes FOR SELECT USING (true);

-- Admin write access (authenticated users)
CREATE POLICY "Admin insert series" ON series FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update series" ON series FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete series" ON series FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert seasons" ON seasons FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update seasons" ON seasons FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete seasons" ON seasons FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert episodes" ON episodes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update episodes" ON episodes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete episodes" ON episodes FOR DELETE USING (auth.role() = 'authenticated');

-- Storage bucket for posters and backdrops
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

CREATE POLICY "Public read media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Admin upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
CREATE POLICY "Admin update media" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND auth.role() = 'authenticated');
CREATE POLICY "Admin delete media" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');
