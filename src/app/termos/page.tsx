import { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import Link from 'next/link';

export function generateMetadata(): Metadata {
  return {
    title: `Termos de Uso - ${siteConfig.name}`,
  };
}

export default function TermosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-3xl font-bold text-white mb-8">Termos de Uso</h1>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-300">
        <p className="text-gray-400 text-sm">
          Ultima atualizacao: {new Date().toLocaleDateString('pt-BR')}
        </p>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">1. Aceitacao dos Termos</h2>
          <p>
            Ao acessar e utilizar o {siteConfig.name}, voce concorda com estes Termos de Uso.
            Caso nao concorde com algum dos termos, nao utilize o site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">2. Descricao do Servico</h2>
          <p>
            O {siteConfig.name} e uma plataforma que disponibiliza links para download de conteudo.
            O site atua como agregador de links e nao hospeda nenhum arquivo diretamente em seus servidores.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">3. Uso Permitido</h2>
          <p>Voce se compromete a:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Utilizar o site de forma legal e etica</li>
            <li>Nao tentar burlar mecanismos de seguranca do site</li>
            <li>Nao utilizar bots ou automacoes para acessar o conteudo</li>
            <li>Nao redistribuir o conteudo comercialmente</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">4. Propriedade Intelectual</h2>
          <p>
            Todo o conteudo do site (layout, design, codigo) e propriedade do {siteConfig.name}.
            Os conteudos disponibilizados para download pertencem a seus respectivos detentores de direitos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">5. Anuncios</h2>
          <p>
            O {siteConfig.name} e um servico gratuito mantido por anuncios. O uso de bloqueadores
            de anuncios pode restringir o acesso ao site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">6. Isencao de Responsabilidade</h2>
          <p>
            O {siteConfig.name} nao se responsabiliza pelo conteudo dos links de terceiros,
            nem por eventuais danos decorrentes do uso dos arquivos baixados.
            O uso e por conta e risco do usuario.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">7. Alteracoes nos Termos</h2>
          <p>
            Reservamo-nos o direito de modificar estes termos a qualquer momento.
            As alteracoes entram em vigor imediatamente apos a publicacao no site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">8. Contato</h2>
          <p>
            Para duvidas sobre estes termos, entre em contato atraves da pagina de{' '}
            <Link href="/dmca" className="text-neon-blue hover:underline">DMCA</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
