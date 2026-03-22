'use client';

import { useEffect } from 'react';

export function ClarityScript() {
  useEffect(() => {
    const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
    if (!clarityId) return;

    // Sanitize: only allow alphanumeric characters
    if (!/^[a-zA-Z0-9]+$/.test(clarityId)) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${clarityId}`;
    document.head.appendChild(script);
  }, []);

  return null;
}
