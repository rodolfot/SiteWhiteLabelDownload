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
- Vídeo embed suporta YouTube, Twitch e Kick (whitelist de domínios)

## Funcionalidades Implementadas
- CRUD completo de séries/temporadas/episódios (admin)
- Download com timer de 10s + Cloudflare Turnstile (CAPTCHA)
- Ads: header (2x 728x90), laterais (160x600), rodapé fixo (2x 728x90)
- Página de categorias com filtro e busca
- Tema claro/escuro com persistência em localStorage
- Video embed (YouTube, Twitch, Kick) lazy-loaded com poster + sandbox
- SEO: sitemap dinâmico, robots.txt, meta tags
- Páginas legais: termos, privacidade, DMCA

## Credenciais e Chaves (.env.local)
- Supabase URL + anon key + service role key
- Cloudflare Turnstile (site key + secret key)
- Google AdSense (client ID + 5 slot IDs por localização)
- Microsoft Clarity (project ID)
- Todas as chaves estão em `.env.local` (gitignored)

## Segurança — Correções Aplicadas (2026-03-22)

### Código
- ✅ **Next.js atualizado** 14.2.5 → 14.2.35 (eliminou CVE crítica + 12 altas)
- ✅ **Middleware protege rotas admin** — redirect para /admin/login se não autenticado/não admin
- ✅ **Security headers** — CSP, HSTS, X-Frame-Options: DENY, nosniff, Referrer-Policy, Permissions-Policy
- ✅ **VideoEmbed whitelist** — só YouTube/Twitch/Kick, rejeita URLs genéricas + sandbox no iframe
- ✅ **Upload validado** — MIME type, magic bytes (JPEG/PNG/WebP), limite 5MB
- ✅ **Download URLs validadas** — só http/https no form e no DownloadTimer
- ✅ **Service Role Client** — stateless (sem cookies), usa createClient direto
- ✅ **Rate limiting** — 10 req/min por IP no endpoint /api/verify-turnstile
- ✅ **Turnstile bypass** — restrito apenas a NODE_ENV=development com log explícito
- ✅ **Clarity excluído do admin** — não grava sessões em /admin/*
- ✅ **Lib de validação** — `src/lib/validation.ts` com isValidDownloadUrl() e validateImageFile()

### Supabase (banco + dashboard)
- ✅ **RLS** habilitado em todas as tabelas com políticas corretas
- ✅ **GRANT anon** — revogado INSERT/UPDATE/DELETE/TRUNCATE (defense-in-depth)
- ✅ **Storage bucket** — 5MB max, apenas JPEG/PNG/WebP
- ✅ **Signup público** — desabilitado
- ✅ **Email confirmation** — habilitado
- ✅ **JWT expiry** — 3600 (1 hora)
- ✅ **Refresh token rotation** — habilitado (reuse interval: 10s)
- ✅ **Password min length** — 12 caracteres
- ✅ **Redirect URLs** — apenas localhost:3002
- ✅ **Rate limits Auth** — 5 sign-in por 15 min
- ✅ **Migração trailer_url** — movido de series para seasons

### Vulnerabilidades Restantes (4 high no npm audit)
- 3x Next.js (requerem Next.js 16 — breaking change, migrar quando possível)
- 1x glob via eslint-config-next (dev dependency, não afeta produção)

### Pendências Futuras
- Audit logging de ações admin
- Rotação periódica da Service Role Key
- Migrar para Next.js 15+ quando estável

## Comandos Úteis
```bash
npm run dev -- -p 3002    # Dev server (porta 3002, evitar conflito com Grafana)
npm run build             # Build de produção
npm audit                 # Verificar vulnerabilidades
npx tsx scripts/security-hardening.ts  # Hardening automático do Supabase
npx tsx scripts/run-audit-sql.ts       # Auditoria SQL do Supabase
```

## Preferencias do Usuario
- Idioma: Português (BR)
- Respostas diretas e concisas
- Ao fazer alterações, focar apenas no projeto SiteWhiteLabelDownload
- Não alterar outros projetos no workspace (CarWash, GerenciamentoFinanceiro, etc.)
