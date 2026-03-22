import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { getBrandParts } from '@/lib/brand';

export function Footer() {
  const [brandFirst, brandSecond] = getBrandParts();
  return (
    <footer className="bg-surface-800 border-t border-surface-600 mt-10 mb-[100px] xl:mx-[176px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/" className="text-base font-bold shrink-0">
            <span className="text-white">{brandFirst}</span>
            <span className="text-gradient">{brandSecond}</span>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-400">
            <Link href="/" className="hover:text-neon-blue transition-colors">Home</Link>
            <Link href="/categorias" className="hover:text-neon-blue transition-colors">Categorias</Link>
            <Link href="/#lancamentos" className="hover:text-neon-blue transition-colors">Lançamentos</Link>
            <span className="text-surface-600">|</span>
            <Link href="/termos" className="hover:text-neon-blue transition-colors">Termos</Link>
            <Link href="/privacidade" className="hover:text-neon-blue transition-colors">Privacidade</Link>
            <Link href="/dmca" className="hover:text-neon-blue transition-colors">DMCA</Link>
          </nav>

          <p className="text-gray-500 text-xs shrink-0">
            &copy; {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
