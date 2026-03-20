'use client';

import { useEffect } from 'react';

export function TurnstileScript() {
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) return;

    // Don't load twice
    if (document.getElementById('cf-turnstile-script')) return;

    const script = document.createElement('script');
    script.id = 'cf-turnstile-script';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  return null;
}
