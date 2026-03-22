import { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

export function generateMetadata(): Metadata {
  return {
    title: `DMCA - ${siteConfig.name}`,
  };
}

export default function DmcaPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contato@exemplo.com';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-3xl font-bold text-white mb-8">DMCA — Politica de Remocao de Conteudo</h1>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-300">
        <p className="text-gray-400 text-sm">
          Ultima atualizacao: {new Date().toLocaleDateString('pt-BR')}
        </p>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">Aviso Importante</h2>
          <p>
            O {siteConfig.name} respeita os direitos autorais e a propriedade intelectual de terceiros.
            Nao hospedamos nenhum arquivo em nossos servidores — nosso site disponibiliza apenas
            links para conteudo hospedado em servicos de terceiros.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">Como Solicitar Remocao</h2>
          <p>
            Se voce e o detentor dos direitos autorais ou um representante autorizado e acredita
            que algum conteudo listado em nosso site infringe seus direitos, envie uma
            notificacao para o email abaixo contendo:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Identificacao do material protegido por direitos autorais</li>
            <li>URL(s) do conteudo infrator em nosso site</li>
            <li>Seus dados de contato (nome, email, telefone)</li>
            <li>Declaracao de boa-fe de que o uso nao e autorizado pelo detentor dos direitos</li>
            <li>Declaracao de que as informacoes na notificacao sao precisas</li>
            <li>Assinatura fisica ou eletronica do detentor dos direitos ou representante autorizado</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">Contato</h2>
          <div className="bg-surface-800 border border-surface-600 rounded-xl p-6">
            <p className="text-white font-medium mb-2">Email para notificacoes DMCA:</p>
            <a
              href={`mailto:${contactEmail}`}
              className="text-neon-blue hover:underline text-lg"
            >
              {contactEmail}
            </a>
            <p className="text-gray-400 text-sm mt-3">
              Responderemos a todas as notificacoes validas em ate 48 horas uteis.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">Prazo de Resposta</h2>
          <p>
            Apos receber uma notificacao DMCA valida, nos comprometemos a:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-3">
            <li>Analisar a solicitacao em ate 48 horas uteis</li>
            <li>Remover o conteudo infrator, se confirmada a violacao</li>
            <li>Notificar o solicitante sobre a acao tomada</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">Contra-Notificacao</h2>
          <p>
            Se voce acredita que seu conteudo foi removido indevidamente, pode enviar uma
            contra-notificacao com as mesmas informacoes exigidas acima, alem de uma
            justificativa para a reinsercao do conteudo.
          </p>
        </section>
      </div>
    </div>
  );
}
