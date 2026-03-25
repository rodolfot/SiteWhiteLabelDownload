import { NextRequest, NextResponse } from 'next/server';
import * as deepl from 'deepl-node';
import { createClient } from '@supabase/supabase-js';

const translator = new deepl.Translator(process.env.DEEPL_API_KEY!);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Dual-auth: accepts either
 *  (a) WEBHOOK_SECRET — for server-to-server calls (scripts, cron jobs)
 *  (b) a valid Supabase admin JWT — for calls from the admin browser session
 */
async function isAuthorized(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7);

  // (a) Static WEBHOOK_SECRET
  if (process.env.WEBHOOK_SECRET && token === process.env.WEBHOOK_SECRET) {
    return true;
  }

  // (b) Supabase admin JWT
  try {
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user } } = await anonClient.auth.getUser(token);
    if (!user) return false;

    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: adminRecord } = await serviceClient
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single();
    return !!adminRecord;
  } catch {
    return false;
  }
}

async function translateText(text: string, targetLang: deepl.TargetLanguageCode): Promise<string> {
  const result = await translator.translateText(text, 'pt', targetLang);
  return result.text;
}

async function translateSeasons(seriesId: string): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: seasons } = await supabase
    .from('seasons')
    .select('id, title')
    .eq('series_id', seriesId)
    .is('title_en', null);

  if (!seasons || seasons.length === 0) return;

  for (const season of seasons as { id: string; title: string }[]) {
    try {
      const title_en = await translateText(season.title, 'en-US');
      await delay(500);
      const title_es = await translateText(season.title, 'es');
      await delay(500);

      const { error } = await supabase
        .from('seasons')
        .update({ title_en, title_es })
        .eq('id', season.id);

      if (error) {
        console.error(`[translate-series] ✗ Season "${season.title}": ${error.message}`);
      } else {
        console.log(`[translate-series] ✓ Season: ${season.title} → ${title_en}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[translate-series] ✗ Season "${season.title}": ${msg}`);
    }
  }
}

async function translateEpisodes(seriesId: string): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: seasons } = await supabase
    .from('seasons')
    .select('id')
    .eq('series_id', seriesId);

  if (!seasons || seasons.length === 0) return;

  const seasonIds = (seasons as { id: string }[]).map((s) => s.id);

  const { data: episodes } = await supabase
    .from('episodes')
    .select('id, title')
    .in('season_id', seasonIds)
    .is('title_en', null);

  if (!episodes || episodes.length === 0) return;

  for (const episode of episodes as { id: string; title: string }[]) {
    try {
      const title_en = await translateText(episode.title, 'en-US');
      await delay(500);
      const title_es = await translateText(episode.title, 'es');
      await delay(500);

      const { error } = await supabase
        .from('episodes')
        .update({ title_en, title_es })
        .eq('id', episode.id);

      if (error) {
        console.error(`[translate-series] ✗ Episode "${episode.title}": ${error.message}`);
      } else {
        console.log(`[translate-series] ✓ Episode: ${episode.title} → ${title_en}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[translate-series] ✗ Episode "${episode.title}": ${msg}`);
    }
  }
}

async function translateSeries(seriesId: string): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: series, error } = await supabase
    .from('series')
    .select('id, title, synopsis')
    .eq('id', seriesId)
    .single();

  if (error || !series) {
    console.error(`[translate-series] Series not found: ${seriesId}`);
    return;
  }

  try {
    const title_en = await translateText(series.title, 'en-US');
    await delay(500);
    const title_es = await translateText(series.title, 'es');
    await delay(500);

    let synopsis_en: string | null = null;
    let synopsis_es: string | null = null;

    if (series.synopsis) {
      synopsis_en = await translateText(series.synopsis, 'en-US');
      await delay(500);
      synopsis_es = await translateText(series.synopsis, 'es');
      await delay(500);
    }

    const { error: updateError } = await supabase
      .from('series')
      .update({ title_en, title_es, synopsis_en, synopsis_es })
      .eq('id', seriesId);

    if (updateError) {
      console.error(`[translate-series] Error saving "${series.title}": ${updateError.message}`);
    } else {
      console.log(`[translate-series] ✓ Series: ${series.title}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[translate-series] ✗ Failed to translate "${series.title}": ${msg}`);
  }

  await translateSeasons(seriesId);
  await translateEpisodes(seriesId);
}

export async function POST(request: NextRequest) {
  const authorized = await isAuthorized(request);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let seriesId: string | undefined;
  try {
    const body = await request.json();
    seriesId = body?.seriesId;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!seriesId || typeof seriesId !== 'string') {
    return NextResponse.json({ error: 'seriesId is required' }, { status: 400 });
  }

  if (!process.env.DEEPL_API_KEY) {
    return NextResponse.json({ error: 'DEEPL_API_KEY not configured' }, { status: 500 });
  }

  // Fire and forget — respond 202 immediately, translate in background
  translateSeries(seriesId).catch((err) =>
    console.error('[translate-series] Unhandled error:', err)
  );

  return NextResponse.json({ ok: true, seriesId, message: 'Translation started' }, { status: 202 });
}
