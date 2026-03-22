'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ClarityScript() {
  const pathname = usePathname();

  useEffect(() => {
    // Não carregar Clarity em rotas admin para evitar gravar sessões sensíveis
    if (pathname.startsWith('/admin')) return;

    const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
    if (!clarityId) return;

    // Sanitize: only allow alphanumeric characters
    if (!/^[a-zA-Z0-9]+$/.test(clarityId)) return;

    // Verificar se já foi carregado
    if (document.querySelector(`script[src*="clarity.ms/tag/${clarityId}"]`)) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${clarityId}`;
    document.head.appendChild(script);
  }, [pathname]);

  return null;
}
