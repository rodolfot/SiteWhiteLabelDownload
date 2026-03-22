import { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

export function generateMetadata(): Metadata {
  return {
    title: `Politica de Privacidade - ${siteConfig.name}`,
  };
}

export default function PrivacidadePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-3xl font-bold text-white mb-8">Politica de Privacidade</h1>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-300">
        <p className="text-gray-400 text-sm">
          Ultima atualizacao: {new Date().toLocaleDateString('pt-BR')}
        </p>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">1. Informacoes Coletadas</h2>
          <p>O {siteConfig.name} pode coletar as seguintes informacoes:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Dados de navegacao (paginas visitadas, tempo de permanencia)</li>
            <li>Informacoes do dispositivo (tipo de navegador, sistema operacional)</li>
            <li>Endereco IP</li>
            <li>Cookies essenciais para funcionamento do site</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">2. Uso das Informacoes</h2>
          <p>As informacoes coletadas sao utilizadas para:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Melhorar a experiencia do usuario</li>
            <li>Analisar o trafego e uso do site (via Microsoft Clarity)</li>
            <li>Exibir anuncios relevantes</li>
            <li>Verificacao anti-bot (via Cloudflare Turnstile)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">3. Cookies</h2>
          <p>
            Utilizamos cookies para autenticacao de administradores e para o funcionamento
            de servicos de terceiros (analytics e anuncios). Voce pode desabilitar cookies
            nas configuracoes do seu navegador, mas isso pode afetar o funcionamento do site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">4. Servicos de Terceiros</h2>
          <p>Utilizamos os seguintes servicos que podem coletar dados:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Microsoft Clarity</strong> — analise de comportamento e heatmaps</li>
            <li><strong>Cloudflare Turnstile</strong> — verificacao anti-bot</li>
            <li><strong>Google AdSense</strong> — exibicao de anuncios</li>
            <li><strong>Supabase</strong> — autenticacao e banco de dados</li>
          </ul>
          <p>
            Cada servico possui sua propria politica de privacidade. Recomendamos a leitura
            das politicas de cada um.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">5. Compartilhamento de Dados</h2>
          <p>
            Nao vendemos, alugamos ou compartilhamos suas informacoes pessoais com terceiros,
            exceto conforme exigido por lei ou para os servicos de terceiros mencionados acima.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">6. Seus Direitos</h2>
          <p>De acordo com a LGPD (Lei Geral de Protecao de Dados), voce tem o direito de:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Solicitar acesso aos seus dados pessoais</li>
            <li>Solicitar a correcao de dados incorretos</li>
            <li>Solicitar a exclusao dos seus dados</li>
            <li>Revogar o consentimento para o tratamento dos dados</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">7. Seguranca</h2>
          <p>
            Empregamos medidas de seguranca para proteger suas informacoes, incluindo
            criptografia e controle de acesso. No entanto, nenhum sistema e 100% seguro.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">8. Alteracoes</h2>
          <p>
            Esta politica pode ser atualizada periodicamente. Recomendamos que visite
            esta pagina regularmente para se manter informado.
          </p>
        </section>
      </div>
    </div>
  );
}
