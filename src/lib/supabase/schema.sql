-- Database Schema
-- Execute this SQL in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Admin roles table
-- ============================================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can read the admin list
CREATE POLICY "Admins can read admin_users"
  ON admin_users FOR SELECT
  USING (auth.uid() = id);

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Series table
-- ============================================================
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
  trailer_url TEXT,
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

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX idx_series_slug ON series(slug);
CREATE INDEX idx_series_category ON series(category);
CREATE INDEX idx_series_featured ON series(featured);
CREATE INDEX idx_seasons_series_id ON seasons(series_id);
CREATE INDEX idx_episodes_season_id ON episodes(season_id);

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
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

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access for series" ON series FOR SELECT USING (true);
CREATE POLICY "Public read access for seasons" ON seasons FOR SELECT USING (true);
CREATE POLICY "Public read access for episodes" ON episodes FOR SELECT USING (true);

-- Admin-only write access (uses is_admin() function)
CREATE POLICY "Admin insert series" ON series FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update series" ON series FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete series" ON series FOR DELETE USING (public.is_admin());

CREATE POLICY "Admin insert seasons" ON seasons FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update seasons" ON seasons FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete seasons" ON seasons FOR DELETE USING (public.is_admin());

CREATE POLICY "Admin insert episodes" ON episodes FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update episodes" ON episodes FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete episodes" ON episodes FOR DELETE USING (public.is_admin());

-- ============================================================
-- Storage bucket for posters and backdrops
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

CREATE POLICY "Public read media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Admin upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "Admin update media" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "Admin delete media" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND public.is_admin());

-- ============================================================
-- Seed: insert initial admin user after creating them in Supabase Auth
-- Replace 'YOUR_USER_UUID' with the UUID from Supabase Auth > Users
-- ============================================================
-- INSERT INTO admin_users (id, email) VALUES ('YOUR_USER_UUID', 'admin@example.com');
