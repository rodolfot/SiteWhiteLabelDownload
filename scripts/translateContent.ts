/**
 * Translates series, seasons, and episodes to EN and ES using the DeepL API.
 * Idempotent: only processes rows where title_en IS NULL.
 *
 * Usage:
 *   npx tsx scripts/translateContent.ts
 *
 * Required env vars (in .env.local):
 *   DEEPL_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import * as deepl from 'deepl-node';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const translator = new deepl.Translator(process.env.DEEPL_API_KEY!);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function translate(text: string, targetLang: deepl.TargetLanguageCode): Promise<string> {
  const result = await translator.translateText(text, 'pt', targetLang);
  return result.text;
}

// ─── Series ───────────────────────────────────────────────────────────────────

async function translateSeries(): Promise<{ ok: number; err: number }> {
  const { data, error } = await supabase
    .from('series')
    .select('id, title, synopsis')
    .is('title_en', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[series] Error fetching:', error.message);
    return { ok: 0, err: 0 };
  }
  if (!data || data.length === 0) {
    console.log('[series] All series already translated.');
    return { ok: 0, err: 0 };
  }

  console.log(`[series] ${data.length} to translate...\n`);
  let ok = 0, err = 0;

  for (const item of data) {
    try {
      const title_en = await translate(item.title, 'en-US');
      await delay(500);
      const title_es = await translate(item.title, 'es');
      await delay(500);

      let synopsis_en: string | null = null;
      let synopsis_es: string | null = null;
      if (item.synopsis) {
        synopsis_en = await translate(item.synopsis, 'en-US');
        await delay(500);
        synopsis_es = await translate(item.synopsis, 'es');
        await delay(500);
      }

      const { error: upErr } = await supabase
        .from('series')
        .update({ title_en, title_es, synopsis_en, synopsis_es })
        .eq('id', item.id);

      if (upErr) {
        console.error(`  ✗ Error saving "${item.title}": ${upErr.message}`);
        err++;
      } else {
        console.log(`  ✓ Series translated: ${item.title} → ${title_en}`);
        ok++;
      }
    } catch (e) {
      console.error(`  ✗ Failed "${item.title}": ${e instanceof Error ? e.message : e}`);
      err++;
    }
  }
  return { ok, err };
}

// ─── Seasons ──────────────────────────────────────────────────────────────────

async function translateSeasons(): Promise<{ ok: number; err: number }> {
  const { data, error } = await supabase
    .from('seasons')
    .select('id, title')
    .is('title_en', null)
    .not('title', 'is', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[seasons] Error fetching:', error.message);
    return { ok: 0, err: 0 };
  }
  if (!data || data.length === 0) {
    console.log('[seasons] All seasons already translated.');
    return { ok: 0, err: 0 };
  }

  console.log(`[seasons] ${data.length} to translate...\n`);
  let ok = 0, err = 0;

  for (const item of data) {
    try {
      const title_en = await translate(item.title, 'en-US');
      await delay(500);
      const title_es = await translate(item.title, 'es');
      await delay(500);

      const { error: upErr } = await supabase
        .from('seasons')
        .update({ title_en, title_es })
        .eq('id', item.id);

      if (upErr) {
        console.error(`  ✗ Error saving "${item.title}": ${upErr.message}`);
        err++;
      } else {
        console.log(`  ✓ Season translated: ${item.title} → ${title_en}`);
        ok++;
      }
    } catch (e) {
      console.error(`  ✗ Failed "${item.title}": ${e instanceof Error ? e.message : e}`);
      err++;
    }
  }
  return { ok, err };
}

// ─── Episodes ─────────────────────────────────────────────────────────────────

async function translateEpisodes(): Promise<{ ok: number; err: number }> {
  const { data, error } = await supabase
    .from('episodes')
    .select('id, title')
    .is('title_en', null)
    .not('title', 'is', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[episodes] Error fetching:', error.message);
    return { ok: 0, err: 0 };
  }
  if (!data || data.length === 0) {
    console.log('[episodes] All episodes already translated.');
    return { ok: 0, err: 0 };
  }

  console.log(`[episodes] ${data.length} to translate...\n`);
  let ok = 0, err = 0;

  for (const item of data) {
    try {
      const title_en = await translate(item.title, 'en-US');
      await delay(500);
      const title_es = await translate(item.title, 'es');
      await delay(500);

      const { error: upErr } = await supabase
        .from('episodes')
        .update({ title_en, title_es })
        .eq('id', item.id);

      if (upErr) {
        console.error(`  ✗ Error saving "${item.title}": ${upErr.message}`);
        err++;
      } else {
        console.log(`  ✓ Episode translated: ${item.title} → ${title_en}`);
        ok++;
      }
    } catch (e) {
      console.error(`  ✗ Failed "${item.title}": ${e instanceof Error ? e.message : e}`);
      err++;
    }
  }
  return { ok, err };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.DEEPL_API_KEY) {
    console.error('Error: DEEPL_API_KEY is not set in .env.local');
    process.exit(1);
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: Supabase credentials are not set in .env.local');
    process.exit(1);
  }

  console.log('=== translateContent.ts ===\n');

  const series  = await translateSeries();
  console.log();
  const seasons = await translateSeasons();
  console.log();
  const episodes = await translateEpisodes();

  const total = {
    ok:  series.ok  + seasons.ok  + episodes.ok,
    err: series.err + seasons.err + episodes.err,
  };
  console.log(`\n=== Done! ${total.ok} translated, ${total.err} errors. ===`);
}

main();
