'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--surface-900)' }}>
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-extrabold text-gradient mb-4">Erro</h1>
        <p className="text-gray-400 text-lg mb-2">Algo deu errado ao carregar esta página.</p>
        <p className="text-gray-500 text-sm mb-8">
          {error.digest ? `Código: ${error.digest}` : 'Tente novamente ou volte para a página inicial.'}
        </p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={reset} className="btn-primary">
            Tentar novamente
          </button>
          <Link href="/" className="btn-secondary">
            Voltar para Home
          </Link>
        </div>
      </div>
    </div>
  );
}
