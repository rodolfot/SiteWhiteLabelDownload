'use client';

import { useEffect } from 'react';

export function AdSenseScript() {
  useEffect(() => {
    const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
    if (!adClient) return;

    if (document.getElementById('adsense-script')) return;

    const script = document.createElement('script');
    script.id = 'adsense-script';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }, []);

  return null;
}
