/**
 * Executa as queries de auditoria SQL no Supabase
 * Cria uma função temporária exec_sql para rodar queries arbitrárias
 *
 * Uso: npx tsx scripts/run-audit-sql.ts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Carregar .env.local
const envPath = resolve(__dirname, '..', '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  console.error('❌ Não foi possível ler .env.local');
  process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis SUPABASE_URL e SERVICE_ROLE_KEY obrigatórias');
  process.exit(1);
}

async function supabaseSQL(sql: string): Promise<unknown> {
  // Usar a Management API via pg-meta (disponível em /pg/)
  // Fallback: usar a SQL query via HTTP na pg endpoint
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/run_audit_query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql_query: sql }),
  });

  if (res.ok) {
    return await res.json();
  }
  return null;
}

async function createAuditFunction(): Promise<boolean> {
  // Criar função via PostgREST — precisa de um workaround
  // Vamos usar o endpoint /rest/v1/rpc com uma função que já existe (exec_sql)
  // ou criar via a Supabase Management API

  // Tentar via Supabase Management API (requer project ref)
  const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

  const createFnSQL = `
    CREATE OR REPLACE FUNCTION public.run_audit_query(sql_query text)
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    DECLARE
      result jsonb;
    BEGIN
      EXECUTE 'SELECT jsonb_agg(row_to_json(t)) FROM (' || sql_query || ') t' INTO result;
      RETURN COALESCE(result, '[]'::jsonb);
    END;
    $$;
  `;

  // Usar a API de SQL do Supabase (via pg-meta)
  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: createFnSQL }),
  });

  if (res.ok) {
    console.log('✅ Função run_audit_query criada com sucesso');
    // Aguardar o schema cache do PostgREST atualizar
    // Notificar o PostgREST para recarregar
    await fetch(`${SUPABASE_URL}/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: "NOTIFY pgrst, 'reload schema'" }),
    });
    // Esperar um pouco para o PostgREST recarregar
    await new Promise(r => setTimeout(r, 2000));
    return true;
  }

  const text = await res.text();
  console.log(`⚠️  Não foi possível criar função via /pg/query: ${res.status}`);
  console.log(`   Tentando via Management API...`);

  // Fallback: Supabase Management API
  const mgmtRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: createFnSQL }),
  });

  if (mgmtRes.ok) {
    console.log('✅ Função run_audit_query criada via Management API');
    await new Promise(r => setTimeout(r, 2000));
    return true;
  }

  console.log(`⚠️  Management API também falhou: ${mgmtRes.status}`);
  return false;
}

async function runAuditQuery(label: string, sql: string): Promise<void> {
  console.log(`\n📋 ${label}`);

  const data = await supabaseSQL(sql);
  if (data === null) {
    console.log('   ⚠️  Não foi possível executar (função RPC não disponível)');
    return;
  }

  if (Array.isArray(data) && data.length === 0) {
    console.log('   ✅ Nenhum resultado (esperado para verificações de segurança)');
    return;
  }

  if (Array.isArray(data)) {
    console.table(data);
  } else {
    console.log('  ', data);
  }
}

async function dropAuditFunction(): Promise<void> {
  console.log('\n🧹 Removendo função temporária run_audit_query...');

  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: 'DROP FUNCTION IF EXISTS public.run_audit_query(text);' }),
  });

  if (res.ok) {
    console.log('   ✅ Função removida');
    // Notificar PostgREST
    await fetch(`${SUPABASE_URL}/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: "NOTIFY pgrst, 'reload schema'" }),
    });
  } else {
    console.log('   ⚠️  Não foi possível remover (remova manualmente)');
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║     Auditoria SQL — Supabase                    ║');
  console.log('╚══════════════════════════════════════════════════╝');

  // 1. Criar função temporária
  const created = await createAuditFunction();
  if (!created) {
    console.log('\n❌ Não foi possível criar a função de auditoria.');
    console.log('   Copie e execute manualmente no Supabase SQL Editor:\n');
    printManualSQL();
    return;
  }

  // 2. Executar queries de auditoria
  await runAuditQuery(
    'Tabelas SEM RLS habilitado (deve retornar vazio)',
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false"
  );

  await runAuditQuery(
    'Funções SECURITY DEFINER no schema public',
    "SELECT proname as funcao, proowner::regrole as owner FROM pg_proc WHERE prosecdef = true AND pronamespace = 'public'::regnamespace"
  );

  await runAuditQuery(
    'Permissões do role anon',
    "SELECT table_name, string_agg(privilege_type, ', ') as privileges FROM information_schema.table_privileges WHERE grantee = 'anon' AND table_schema = 'public' GROUP BY table_name ORDER BY table_name"
  );

  await runAuditQuery(
    'Políticas RLS por tabela',
    "SELECT tablename as tabela, policyname as politica, cmd as operacao, permissive FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, cmd"
  );

  await runAuditQuery(
    'Configuração dos buckets de Storage',
    "SELECT id, name, public, file_size_limit, allowed_mime_types FROM storage.buckets"
  );

  // 3. Limpar função temporária
  await dropAuditFunction();

  console.log('\n══════════════════════════════════════════════════');
  console.log('✅ Auditoria concluída');
  console.log('══════════════════════════════════════════════════\n');
}

function printManualSQL() {
  console.log(`-- 1. Tabelas sem RLS:
SELECT tablename FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;

-- 2. Funções SECURITY DEFINER:
SELECT proname, proowner::regrole
FROM pg_proc WHERE prosecdef = true AND pronamespace = 'public'::regnamespace;

-- 3. Permissões do anon:
SELECT table_name, privilege_type
FROM information_schema.table_privileges
WHERE grantee = 'anon' AND table_schema = 'public';

-- 4. Políticas RLS:
SELECT tablename, policyname, cmd, permissive
FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, cmd;

-- 5. Buckets:
SELECT id, name, public, file_size_limit, allowed_mime_types FROM storage.buckets;
`);
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
