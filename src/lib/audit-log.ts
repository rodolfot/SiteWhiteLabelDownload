import { createClient } from '@/lib/supabase/client';

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout';
export type AuditEntity = 'series' | 'season' | 'episode' | 'auth';

interface AuditLogEntry {
  action: AuditAction;
  entity: AuditEntity;
  entity_id?: string;
  details?: string;
}

/**
 * Registra uma ação do admin no audit log.
 * Falha silenciosamente se a tabela não existir (para não bloquear operações).
 */
export async function logAdminAction({ action, entity, entity_id, details }: AuditLogEntry) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('admin_audit_log').insert({
      admin_id: user.id,
      admin_email: user.email,
      action,
      entity,
      entity_id: entity_id || null,
      details: details || null,
    });
  } catch {
    // Falha silenciosa — audit log não deve bloquear operações
    console.warn('[Audit] Falha ao registrar ação:', action, entity);
  }
}
