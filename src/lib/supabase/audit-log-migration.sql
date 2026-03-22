-- Tabela de audit log para ações do admin
-- Executar no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  admin_email TEXT,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'login', 'logout')),
  entity TEXT NOT NULL CHECK (entity IN ('series', 'season', 'episode', 'auth')),
  entity_id TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index para busca por data
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON admin_audit_log (created_at DESC);

-- Index para busca por admin
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON admin_audit_log (admin_id);

-- RLS: apenas admins podem ler, inserir via client
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admin pode inserir
CREATE POLICY "Admin can insert audit logs" ON admin_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (admin_id = auth.uid());

-- Admin pode ler
CREATE POLICY "Admin can read audit logs" ON admin_audit_log
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Anon não tem acesso
REVOKE ALL ON admin_audit_log FROM anon;
