-- Migration: Donate-gated resolutions

-- 1. Add donor_only column to download_links
ALTER TABLE download_links ADD COLUMN IF NOT EXISTS donor_only BOOLEAN DEFAULT FALSE;

-- 2. Create user_donations table (admin marks users as donors)
CREATE TABLE IF NOT EXISTS user_donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2),
  method TEXT, -- 'pix', 'paypal', 'crypto', 'manual'
  active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE -- NULL = lifetime
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_donations_user_id ON user_donations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_donations_active ON user_donations(active);

-- RLS
ALTER TABLE user_donations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own donation status
CREATE POLICY "Users can view own donations" ON user_donations
  FOR SELECT USING (auth.uid() = user_id);

-- Only admins can insert/update/delete donations
CREATE POLICY "Admins can manage donations" ON user_donations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );
