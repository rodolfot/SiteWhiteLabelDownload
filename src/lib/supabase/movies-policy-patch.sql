-- Patch: add write policy for authenticated users on movies table
-- Run this in Supabase SQL Editor if you already ran movies-migration.sql

CREATE POLICY "movies_admin_write" ON movies
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
