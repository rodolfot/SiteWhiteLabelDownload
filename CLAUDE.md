# CLAUDE.md — Contexto do Projeto SiteWhiteLabelDownload

## Sobre o Projeto
- **Nome**: DownDoor (white-label configurável via .env)
- **Stack**: Next.js 14 (App Router) + Supabase (PostgreSQL + Auth + Storage) + Tailwind CSS
- **Propósito**: Portal de download de séries/vídeos com monetização via AdSense
- **Ambiente atual**: localhost (ainda não deployado em produção)
- **Porta**: usar porta 3001 ou 3002 (porta 3000 está ocupada pelo Grafana)

## Estrutura Importante
- Layout público usa `SiteShell.tsx` (Header, Footer, ads laterais/fixos)
- Layout admin não tem ads/header público — rotas em `/admin/*`
- Tema claro/escuro via CSS variables (`:root` para dark, `.light` para light)
- Trailers são por temporada (season), não por série
- Vídeo embed suporta YouTube, Twitch e Kick

## Funcionalidades Implementadas
- CRUD completo de séries/temporadas/episódios (admin)
- Download com timer de 10s + Cloudflare Turnstile (CAPTCHA)
- Ads: header (2x 728x90), laterais (160x600), rodapé fixo (2x 728x90)
- Página de categorias com filtro e busca
- Tema claro/escuro com persistência em localStorage
- Video embed (YouTube, Twitch, Kick) lazy-loaded com poster
- SEO: sitemap dinâmico, robots.txt, meta tags
- Páginas legais: termos, privacidade, DMCA

## Credenciais e Chaves (.env.local)
- Supabase URL + anon key + service role key
- Cloudflare Turnstile (site key + secret key)
- Google AdSense (client ID + 5 slot IDs por localização)
- Microsoft Clarity (project ID)
- Todas as chaves estão em `.env.local` (gitignored)

## Migração SQL Pendente
O trailer foi movido de series para seasons. Se ainda não rodou, executar no Supabase SQL Editor:
```sql
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS trailer_url TEXT;
ALTER TABLE series DROP COLUMN IF EXISTS trailer_url;
```

## Análise de Segurança — Correções Pendentes

Análise AppSec completa foi realizada. Abaixo as correções priorizadas por severidade.

### CRÍTICOS (corrigir antes do deploy)

1. **Atualizar Next.js** — versão 14.2.5 tem 16 CVEs (1 crítica, 5 altas)
   - Executar: `npm audit fix --force`
   - CVEs incluem: Authorization Bypass, Cache Poisoning, SSRF, DoS

2. **Middleware não protege rotas admin centralmente** (CWE-862)
   - Arquivo: `src/middleware.ts`
   - Problema: apenas refresha sessão, não bloqueia acesso a `/admin/*`
   - Correção: adicionar redirect para `/admin/login` se `!user` em rotas `/admin/*`

3. **Login admin sem rate limiting** (CWE-307)
   - Supabase Auth (plano gratuito) não tem rate limiting robusto
   - Considerar: adicionar CAPTCHA na tela de login, configurar rate limits no Supabase dashboard

### ALTOS

4. **Security headers ausentes** (CWE-693)
   - Arquivo: `next.config.mjs`
   - Adicionar: CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, HSTS, Referrer-Policy, Permissions-Policy
   - CSP precisa permitir: AdSense, Clarity, Turnstile, Supabase, YouTube/Twitch/Kick embeds

5. **Upload de imagens sem validação server-side** (CWE-434)
   - Arquivo: `src/components/admin/SeriesForm.tsx` → `handleImageUpload`
   - Problema: só verifica extensão do nome, não valida magic bytes nem tamanho
   - Correção: validar MIME type, magic bytes (JPEG/PNG/WebP), limite 5MB

6. **VideoEmbed aceita URLs genéricas** (CWE-601)
   - Arquivo: `src/components/ui/VideoEmbed.tsx`
   - Problema: fallback aceita qualquer URL como iframe
   - Correção: whitelist de domínios (youtube.com, twitch.tv, kick.com)

7. **Download URLs sem validação** (CWE-20)
   - Arquivo: `src/components/admin/SeriesForm.tsx`
   - Problema: campo download_url aceita qualquer string (javascript:, data:, etc.)
   - Correção: validar que URL usa protocolo http: ou https:

8. **Turnstile API endpoint sem rate limiting** (CWE-799)
   - Arquivo: `src/app/api/verify-turnstile/route.ts`

### MEDIOS

9. **Service Role Key** expira em 2036 — sem rotação periódica
10. **Sem audit logging** — nenhum registro de ações do admin
11. **Clarity pode gravar sessões do admin** — verificar se está excluído de `/admin/*`
12. **Verificar .env.local no .gitignore** — confirmar que não está trackeado

### PONTOS POSITIVOS (já implementados)
- RLS habilitado em todas as tabelas com políticas corretas
- Service Role Key usado apenas server-side
- Turnstile protege downloads contra bots
- Validação do Clarity ID com regex
- Cookies gerenciados pelo @supabase/ssr
- TypeScript strict mode
- Dependências mínimas (7 deps de produção)

## Configurações do Supabase para Verificar
- [ ] Desabilitar signup público (só admin gerencia contas)
- [ ] Habilitar email confirmation
- [ ] Definir JWT expiry = 3600 (1 hora)
- [ ] Habilitar refresh token rotation
- [ ] Configurar redirect URLs apenas para domínios autorizados
- [ ] Verificar tamanho máximo de upload no Storage

## Comandos Úteis
```bash
npm run dev -- -p 3002    # Dev server (porta 3002, evitar conflito com Grafana)
npm run build             # Build de produção
npm audit                 # Verificar vulnerabilidades
npm audit fix --force     # Corrigir vulnerabilidades
```

## Preferencias do Usuario
- Idioma: Português (BR)
- Respostas diretas e concisas
- Ao fazer alterações, focar apenas no projeto SiteWhiteLabelDownload
- Não alterar outros projetos no workspace (CarWash, GerenciamentoFinanceiro, etc.)
