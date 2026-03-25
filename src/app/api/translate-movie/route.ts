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

async function translateMovie(movieId: string): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: movie, error } = await supabase
    .from('movies')
    .select('id, title, synopsis')
    .eq('id', movieId)
    .single();

  if (error || !movie) {
    console.error(`[translate-movie] Movie not found: ${movieId}`);
    return;
  }

  try {
    const title_en = await translateText(movie.title, 'en-US');
    await delay(500);
    const title_es = await translateText(movie.title, 'es');
    await delay(500);

    let synopsis_en: string | null = null;
    let synopsis_es: string | null = null;

    if (movie.synopsis) {
      synopsis_en = await translateText(movie.synopsis, 'en-US');
      await delay(500);
      synopsis_es = await translateText(movie.synopsis, 'es');
      await delay(500);
    }

    const { error: updateError } = await supabase
      .from('movies')
      .update({ title_en, title_es, synopsis_en, synopsis_es })
      .eq('id', movieId);

    if (updateError) {
      console.error(`[translate-movie] Error saving "${movie.title}": ${updateError.message}`);
    } else {
      console.log(`[translate-movie] ✓ Movie: ${movie.title}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[translate-movie] ✗ Failed to translate "${movie.title}": ${msg}`);
  }
}

export async function POST(request: NextRequest) {
  const authorized = await isAuthorized(request);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let movieId: string | undefined;
  try {
    const body = await request.json();
    movieId = body?.movieId;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!movieId || typeof movieId !== 'string') {
    return NextResponse.json({ error: 'movieId is required' }, { status: 400 });
  }

  if (!process.env.DEEPL_API_KEY) {
    return NextResponse.json({ error: 'DEEPL_API_KEY not configured' }, { status: 500 });
  }

  // Fire and forget — respond 202 immediately, translate in background
  translateMovie(movieId).catch((err) =>
    console.error('[translate-movie] Unhandled error:', err)
  );

  return NextResponse.json({ ok: true, movieId, message: 'Translation started' }, { status: 202 });
}
