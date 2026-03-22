-- ============================================================
-- Security Hardening — Execute no Supabase SQL Editor
-- Data: 2026-03-22
-- ============================================================

-- 1. Restringir tipos de arquivo e tamanho máximo no bucket 'media'
UPDATE storage.buckets
SET
  file_size_limit = 5242880,  -- 5MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'media';

-- 2. Migração pendente: mover trailer de series para seasons
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS trailer_url TEXT;
ALTER TABLE series DROP COLUMN IF EXISTS trailer_url;

-- 3. Defense-in-depth: revogar escrita do role anon (RLS já bloqueia, mas dupla proteção)
-- ✅ EXECUTADO em 2026-03-22
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON admin_users, series, seasons, episodes FROM anon;

-- 4. Auditar: listar tabelas SEM RLS habilitado (deve retornar 0 linhas)
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false;

-- 4. Auditar: listar funções SECURITY DEFINER no schema public
SELECT proname, proowner::regrole, prosrc
FROM pg_proc
WHERE prosecdef = true
  AND pronamespace = 'public'::regnamespace;

-- 5. Auditar: verificar permissões do role 'anon'
SELECT grantee, table_name, privilege_type
FROM information_schema.table_privileges
WHERE grantee = 'anon' AND table_schema = 'public';

-- 6. Auditar: verificar todas as políticas RLS
SELECT
  schemaname, tablename, policyname,
  permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- 7. Auditar: verificar configuração do bucket
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets;

-- ============================================================
-- Configurações do Dashboard Supabase (fazer manualmente):
-- ============================================================
-- Auth > Settings:
--   [ ] Desabilitar "Enable email signup" (só admin cria contas)
--   [x] Habilitar "Confirm email"
--   JWT expiry = 3600 (1 hora)
--   [x] Refresh token rotation = ON
--   Refresh token reuse interval = 10 segundos
--   Minimum password length = 12
--
-- Auth > URL Configuration:
--   Redirect URLs = apenas http://localhost:3002/** e domínio de produção
--
-- Auth > Rate Limits:
--   Email sign-in = 5 por 15 minutos
--
-- Auth > Providers:
--   Manter apenas Email habilitado
--   Desabilitar Google, GitHub, etc. se não usar
-- ============================================================
