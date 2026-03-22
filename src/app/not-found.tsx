import Link from 'next/link';
import { SiteShell } from '@/components/ui/SiteShell';

export default function NotFound() {
  return (
    <SiteShell>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-6xl font-extrabold text-gradient mb-4">404</h1>
          <p className="text-gray-400 text-lg mb-8">Página não encontrada</p>
          <Link href="/" className="btn-primary">
            Voltar para Home
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
