import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { getBrandParts } from '@/lib/brand';

export function Footer() {
  const [brandFirst, brandSecond] = getBrandParts();
  return (
    <footer className="bg-surface-800 border-t border-surface-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">
              <span className="text-white">{brandFirst}</span>
              <span className="text-gradient">{brandSecond}</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {siteConfig.tagline}. Conteudo atualizado diariamente com a melhor qualidade.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-neon-blue transition-colors text-sm">Home</Link></li>
              <li><Link href="/#categorias" className="text-gray-400 hover:text-neon-blue transition-colors text-sm">Categorias</Link></li>
              <li><Link href="/#lancamentos" className="text-gray-400 hover:text-neon-blue transition-colors text-sm">Lançamentos</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/termos" className="text-gray-400 hover:text-neon-blue transition-colors text-sm">Termos de Uso</Link></li>
              <li><Link href="/privacidade" className="text-gray-400 hover:text-neon-blue transition-colors text-sm">Politica de Privacidade</Link></li>
              <li><Link href="/dmca" className="text-gray-400 hover:text-neon-blue transition-colors text-sm">DMCA</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-surface-600 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
