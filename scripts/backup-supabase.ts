/**
 * Backup automático do Supabase — exporta todas as tabelas para JSON.
 *
 * Uso:
 *   npx tsx scripts/backup-supabase.ts
 *
 * Requer:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *
 * Cria backup em: backups/YYYY-MM-DD_HH-mm-ss/
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Erro: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const TABLES = [
  'series',
  'seasons',
  'episodes',
  'episode_links',
  'admin_users',
  'admin_audit_log',
  'comments',
  'series_requests',
  'page_views',
  'user_ratings',
  'categories',
];

async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupDir = path.join(process.cwd(), 'backups', timestamp);
  fs.mkdirSync(backupDir, { recursive: true });

  console.log(`\n📦 Backup Supabase → ${backupDir}\n`);

  const summary: { table: string; rows: number; status: string }[] = [];

  for (const table of TABLES) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(50000);

      if (error) {
        // Tabela pode não existir ainda
        console.log(`  ⚠ ${table}: ${error.message}`);
        summary.push({ table, rows: 0, status: `error: ${error.message}` });
        continue;
      }

      const filePath = path.join(backupDir, `${table}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`  ✅ ${table}: ${data.length} registros`);
      summary.push({ table, rows: data.length, status: 'ok' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  ❌ ${table}: ${msg}`);
      summary.push({ table, rows: 0, status: `failed: ${msg}` });
    }
  }

  // Salvar resumo
  const summaryPath = path.join(backupDir, '_summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    supabase_url: SUPABASE_URL,
    tables: summary,
    total_rows: summary.reduce((acc, s) => acc + s.rows, 0),
  }, null, 2));

  console.log(`\n✅ Backup concluído: ${summary.reduce((acc, s) => acc + s.rows, 0)} registros totais`);
  console.log(`   Diretório: ${backupDir}\n`);
}

backup().catch((err) => {
  console.error('Erro no backup:', err);
  process.exit(1);
});
