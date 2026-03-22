'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function Analytics() {
  const pathname = usePathname();
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (!gaId) return;

    // Não carregar em rotas admin
    if (pathname.startsWith('/admin')) return;

    // Carregar script GA4 uma vez
    if (!document.querySelector(`script[src*="googletagmanager.com/gtag"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      const initScript = document.createElement('script');
      initScript.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}', { send_page_view: false });
      `;
      document.head.appendChild(initScript);
    }

    // Enviar page view a cada navegação
    if ('gtag' in window) {
      (window as Record<string, unknown>['gtag'] as Function)('event', 'page_view', {
        page_path: pathname,
      });
    }
  }, [pathname, gaId]);

  return null;
}
