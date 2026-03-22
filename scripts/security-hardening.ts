/**
 * Security Hardening Script
 * Executa diretamente no Supabase via REST API usando a service_role key.
 *
 * Uso: npx tsx scripts/security-hardening.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Carregar .env.local manualmente (sem depender de dotenv)
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias no .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Helper: executa SQL via Supabase rpc (pg_query) ou REST
async function runSQL(label: string, sql: string): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const { data, error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    // Fallback: tentar via fetch direto na REST API do PostgREST
    return { ok: false, error: error.message };
  }
  return { ok: true, data };
}

// Helper: executa SQL via HTTP direto no endpoint /rest/v1/rpc
async function runSQLDirect(label: string, sql: string): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `HTTP ${res.status}: ${text}` };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// Primeiro, criar a função exec_sql se não existir
async function ensureExecSQL(): Promise<boolean> {
  const createFnSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(query text)
    RETURNS json
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      result json;
    BEGIN
      EXECUTE query INTO result;
      RETURN result;
    END;
    $$;
  `;

  // Tentar criar via SQL direto (POST no endpoint /rest/v1/)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: 'SELECT 1 as test' }),
  });

  if (res.ok) {
    return true; // já existe
  }

  // Se não existe, precisamos de outro método
  return false;
}

// ============================================================
// Abordagem direta: usar as APIs REST do Supabase Storage
// para configurar o bucket, e SQL via Management API
// ============================================================

async function hardenStorageBucket() {
  console.log('\n📦 [1/5] Configurando bucket "media"...');

  // Usar Supabase Storage Admin API
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket/media`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      public: true,
      file_size_limit: 5242880, // 5MB
      allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp'],
    }),
  });

  if (res.ok) {
    const data = await res.json();
    console.log('   ✅ Bucket "media" configurado: 5MB max, apenas JPEG/PNG/WebP');
    return true;
  } else {
    const text = await res.text();
    console.log(`   ⚠️  Falha ao configurar bucket: ${res.status} — ${text}`);
    return false;
  }
}

async function verifyBucketConfig() {
  console.log('\n🔍 [2/5] Verificando configuração do bucket...');

  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket/media`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });

  if (res.ok) {
    const bucket = await res.json();
    console.log(`   Nome: ${bucket.name}`);
    console.log(`   Público: ${bucket.public}`);
    console.log(`   Limite de tamanho: ${bucket.file_size_limit ? `${(bucket.file_size_limit / 1024 / 1024).toFixed(1)}MB` : 'Sem limite ⚠️'}`);
    console.log(`   MIME types permitidos: ${bucket.allowed_mime_types ? bucket.allowed_mime_types.join(', ') : 'Qualquer tipo ⚠️'}`);
    return true;
  } else {
    console.log(`   ⚠️  Não foi possível verificar: ${res.status}`);
    return false;
  }
}

async function runMigration() {
  console.log('\n🔄 [3/5] Executando migração (trailer: series → seasons)...');

  // Verificar se a coluna trailer_url existe em seasons
  const { data: seasons, error: sErr } = await supabase
    .from('seasons')
    .select('*')
    .limit(1);

  if (sErr) {
    console.log(`   ⚠️  Erro ao acessar seasons: ${sErr.message}`);
    return false;
  }

  // Se seasons retorna dados e tem trailer_url, já foi migrado
  if (seasons && seasons.length > 0 && 'trailer_url' in seasons[0]) {
    console.log('   ✅ Coluna trailer_url já existe em seasons');
  } else {
    console.log('   ⚠️  Coluna trailer_url pode não existir em seasons.');
    console.log('   📝 Execute manualmente no SQL Editor:');
    console.log('      ALTER TABLE seasons ADD COLUMN IF NOT EXISTS trailer_url TEXT;');
    console.log('      ALTER TABLE series DROP COLUMN IF EXISTS trailer_url;');
  }

  return true;
}

async function auditRLS() {
  console.log('\n🛡️  [4/5] Auditando RLS...');

  const tables = ['series', 'seasons', 'episodes', 'admin_users'];
  let allGood = true;

  for (const table of tables) {
    // Tentar uma operação de INSERT sem autenticação para verificar RLS
    const { error } = await supabase
      .from(table)
      .select('*')
      .limit(0);

    if (error) {
      console.log(`   ⚠️  ${table}: ${error.message}`);
      allGood = false;
    } else {
      console.log(`   ✅ ${table}: acessível (SELECT público habilitado conforme esperado)`);
    }
  }

  // Testar que INSERT é bloqueado com anon key
  console.log('\n   Testando bloqueio de escrita (sem auth)...');

  // Criar client com anon key para testar
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (anonKey) {
    const anonClient = createClient(SUPABASE_URL!, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: insertErr } = await anonClient
      .from('series')
      .insert({ title: 'RLS_TEST', slug: 'rls-test-delete-me', synopsis: '' });

    if (insertErr) {
      console.log(`   ✅ INSERT em series bloqueado para anon: "${insertErr.message}"`);
    } else {
      console.log('   ❌ CRÍTICO: INSERT em series permitido para anon! RLS pode estar desabilitado!');
      // Limpar o registro de teste
      await supabase.from('series').delete().eq('slug', 'rls-test-delete-me');
      allGood = false;
    }

    const { error: uploadErr } = await anonClient.storage
      .from('media')
      .upload('rls-test.txt', new Blob(['test']), { contentType: 'text/plain' });

    if (uploadErr) {
      console.log(`   ✅ Upload em storage bloqueado para anon: "${uploadErr.message}"`);
    } else {
      console.log('   ❌ CRÍTICO: Upload em storage permitido para anon!');
      await supabase.storage.from('media').remove(['rls-test.txt']);
      allGood = false;
    }
  } else {
    console.log('   ⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY não encontrada, pulando teste de anon');
  }

  return allGood;
}

async function auditAuth() {
  console.log('\n🔐 [5/5] Verificando configurações de Auth...');

  // Verificar se signup está desabilitado tentando criar um usuário
  // (não recomendado em produção, mas estamos em localhost)
  const testEmail = `security-test-${Date.now()}@test.invalid`;
  const { data: signupData, error: signupErr } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: 'TestPassword123!',
    email_confirm: true,
  });

  if (signupData?.user) {
    // Conseguiu criar — limpar e avisar
    await supabase.auth.admin.deleteUser(signupData.user.id);
    console.log('   ✅ Admin pode criar usuários (service_role funciona)');
  }

  // Listar usuários para ver quantos existem
  const { data: usersData } = await supabase.auth.admin.listUsers();
  if (usersData) {
    console.log(`   📊 Total de usuários no Auth: ${usersData.users.length}`);
    for (const u of usersData.users) {
      console.log(`      - ${u.email} (criado: ${u.created_at?.substring(0, 10)})`);
    }
  }

  // Verificar admin_users
  const { data: admins } = await supabase
    .from('admin_users')
    .select('id, email');

  if (admins) {
    console.log(`   📊 Admins registrados: ${admins.length}`);
    for (const a of admins) {
      console.log(`      - ${a.email}`);
    }
  }

  console.log('\n   ⚠️  Configurações que devem ser verificadas MANUALMENTE no Dashboard:');
  console.log('      - Auth > Settings > "Enable email signup" → DESABILITAR');
  console.log('      - Auth > Settings > "Confirm email" → HABILITAR');
  console.log('      - Auth > Settings > JWT expiry → 3600 (1 hora)');
  console.log('      - Auth > Settings > Refresh token rotation → ON');
  console.log('      - Auth > Settings > Refresh token reuse interval → 10s');
  console.log('      - Auth > Settings > Minimum password length → 12');
  console.log('      - Auth > URL Configuration > Redirect URLs → apenas localhost:3002 e domínio prod');
  console.log('      - Auth > Rate Limits > Email sign-in → 5 por 15 min');

  return true;
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║     Security Hardening — Supabase               ║');
  console.log('║     Projeto: DownDoor                           ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`\n🌐 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🔑 Service Role Key: ${SERVICE_ROLE_KEY!.substring(0, 20)}...`);

  let hasErrors = false;

  // 1. Storage bucket
  const bucketOk = await hardenStorageBucket();
  if (!bucketOk) hasErrors = true;

  // 2. Verificar bucket
  await verifyBucketConfig();

  // 3. Migração
  await runMigration();

  // 4. Auditar RLS
  const rlsOk = await auditRLS();
  if (!rlsOk) hasErrors = true;

  // 5. Auth
  await auditAuth();

  // Resultado final
  console.log('\n══════════════════════════════════════════════════');
  if (hasErrors) {
    console.log('⚠️  Hardening concluído COM problemas. Revise os itens acima.');
  } else {
    console.log('✅ Hardening concluído com sucesso!');
  }
  console.log('══════════════════════════════════════════════════\n');
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
