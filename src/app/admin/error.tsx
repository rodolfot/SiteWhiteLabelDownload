'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Admin Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface-900">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-white mb-4">Erro no Admin</h1>
        <p className="text-gray-400 mb-2">Ocorreu um erro ao carregar o painel.</p>
        <p className="text-gray-500 text-sm mb-8">
          {error.digest ? `Código: ${error.digest}` : 'Verifique sua conexão e tente novamente.'}
        </p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={reset} className="btn-primary">
            Tentar novamente
          </button>
          <Link href="/admin" className="btn-secondary">
            Voltar ao painel
          </Link>
        </div>
      </div>
    </div>
  );
}
