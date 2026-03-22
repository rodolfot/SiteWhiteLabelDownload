import { NextRequest, NextResponse } from 'next/server';

// Rate limiting simples em memória (por IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minuto
const RATE_LIMIT_MAX = 10; // máximo 10 requests por minuto por IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }

  return false;
}

// Limpa entradas expiradas periodicamente para evitar memory leak
setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((val, key) => {
    if (now > val.resetAt) rateLimitMap.delete(key);
  });
}, 60_000);

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token required' }, { status: 400 });
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Turnstile] DEV MODE: Secret key not configured, skipping verification');
        return NextResponse.json({ success: true });
      }
      return NextResponse.json(
        { success: false, error: 'Turnstile not configured' },
        { status: 503 }
      );
    }

    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    formData.append('remoteip', ip);

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const outcome = await result.json();

    if (outcome.success) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 403 });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
