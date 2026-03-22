# SiteWhiteLabelDownload

Plataforma white-label de streaming e download de videos de alta performance, com painel administrativo completo, monetizacao via anuncios e design Dark/Light Mode inspirado em Apple TV+ / Netflix.

O nome, tagline e descricao do site sao 100% configuraveis via variaveis de ambiente — basta trocar as env vars para ter um site com sua propria marca.

---

## Indice

- [Demonstracao](#demonstracao)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnologica](#stack-tecnologica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configuracao Rapida](#configuracao-rapida)
- [Variaveis de Ambiente](#variaveis-de-ambiente)
- [Banco de Dados](#banco-de-dados)
- [White-Label](#white-label)
- [Monetizacao (Anuncios)](#monetizacao-anuncios)
- [Seguranca](#seguranca)
- [SEO e Performance](#seo-e-performance)
- [Observabilidade](#observabilidade)
- [CI/CD](#cicd)
- [Deploy em Producao](#deploy-em-producao)
- [Comandos](#comandos)
- [Arquitetura](#arquitetura)
- [Solucao de Problemas](#solucao-de-problemas)
- [Licenca](#licenca)

---

## Demonstracao

| Pagina                    | Rota                       |
| ------------------------- | -------------------------- |
| Home (hero + lancamentos) | `/`                        |
| Categorias (filtros)      | `/categorias`              |
| Pagina da serie           | `/serie/[slug]`            |
| Painel admin              | `/admin`                   |
| Login admin               | `/admin/login`             |
| Criar serie               | `/admin/series/new`        |
| Editar serie              | `/admin/series/[id]/edit`  |
| Termos de Uso             | `/termos`                  |
| Politica de Privacidade   | `/privacidade`             |
| DMCA                      | `/dmca`                    |

---

## Funcionalidades

### Interface Publica

- **Hero Carousel** — Carrossel automatico de series em destaque com backdrop em tela cheia, gradiente e botoes de navegacao
- **Grids por Categoria** — Series organizadas por categoria com scroll horizontal, botoes de navegacao e efeitos de hover com zoom
- **Pagina de Categorias** — Grid com busca avancada (titulo, genero), filtros (genero, range de ano), ordenacao (titulo, ano, rating) e paginacao
- **Sistema de Favoritos** — Botao de favoritar em cada card, persistido em localStorage, filtro de favoritos na pagina de categorias
- **Live Search** — Busca em tempo real no header (desktop e mobile) com debounce de 300ms, resultados com poster e metadados
- **Pagina da Serie** — Backdrop imersivo, poster, sinopse, metadados (ano, genero, nota), abas de temporadas, trailer embed e lista de episodios com download
- **Video Embed** — Suporte a YouTube, Twitch e Kick com lazy loading, poster e sandbox de seguranca
- **Tema Claro/Escuro** — Toggle no header com persistencia em localStorage via CSS variables
- **Design Responsivo** — Mobile-first com breakpoints para sm, md, lg e xl
- **Image Fallbacks** — Fallback gracioso para imagens quebradas em cards e pagina de detalhe
- **Paginas Legais** — Termos de Uso, Politica de Privacidade e DMCA com conteudo completo
- **PWA** — Progressive Web App com manifest.json para instalacao no dispositivo

### Monetizacao

- **Google AdSense** — Integracao real com AdSense configuravel via env vars (placeholder visual em dev, anuncios reais em producao)
- **Banner Topo (2x 728x90)** — Dois banners lado a lado fixos no header, visiveis em desktop
- **Banners Laterais (160x600)** — Fixos nas laterais esquerda e direita da tela, visiveis em telas xl+ (1280px+)
- **Banners Rodape (2x 728x90)** — Fixos na parte inferior da tela (sticky bottom), sempre visiveis ao scrollar
- **Native Ads** — Anuncios entre as fileiras de series na Home
- **Banner Sidebar (300x600)** — Sidebar na pagina da serie (desktop)
- **Download Timer** — Botao de download com timer de 10 segundos e anuncio 300x250 durante a espera
- **Anti-AdBlock** — Deteccao de bloqueadores com modal persistente

### Painel Administrativo (`/admin`)

- **Login** — Autenticacao via Supabase Auth com verificacao de role admin
- **Dashboard** — Estatisticas (total de series, episodios e destaques) e listagem completa
- **CRUD de Series** — Titulo, slug (auto-gerado), sinopse, ano, genero, nota, categoria e destaque
- **Upload de Imagens** — Upload direto para Supabase Storage com validacao (MIME, magic bytes, 5MB) ou via URL externa
- **Gestao de Temporadas** — Adicionar/remover temporadas com nome editavel, trailer e accordion
- **Gestao de Episodios** — Numero, titulo, URL de download, tamanho do arquivo e qualidade (480p-4K)
- **Upsert Inteligente** — Ao editar, atualiza registros existentes (preservando IDs) em vez de deletar e recriar
- **Audit Logging** — Todas as acoes admin (login, logout, create, update, delete) sao registradas na tabela `admin_audit_log`

### SEO e Performance

- **ISR (Incremental Static Regeneration)** — Home e categorias regeneram a cada 5 min, serie a cada 1 hora
- **JSON-LD** — Structured data (TVSeries schema.org) em cada pagina de serie
- **Twitter Cards** — `summary_large_image` em todas as paginas
- **Meta OG** — Title, description, og:image para cada serie
- **Sitemap.xml** — Gerado dinamicamente com todas as series do banco
- **robots.txt** — Gerado via App Router, bloqueia `/admin/` e `/api/`
- **Otimizacao de Imagens** — AVIF + WebP via Next.js Image, lazy loading, sizes responsivos, cache de 30 dias
- **React.memo** — Cards otimizados com memo e animacao CSS (sem runtime JS para animacao)
- **Loading Skeletons** — Telas de carregamento para admin, categorias e serie

### Seguranca

- **Middleware** — Protege rotas `/admin/*` verificando autenticacao E role admin
- **Security Headers** — CSP, HSTS, X-Frame-Options: DENY, nosniff, Referrer-Policy, Permissions-Policy
- **Rate Limiting** — 10 req/min por IP no endpoint `/api/verify-turnstile`
- **RLS (Row Level Security)** — Leitura publica, escrita restrita a admins
- **Defense-in-depth** — REVOKE de INSERT/UPDATE/DELETE no role `anon`
- **Cloudflare Turnstile** — CAPTCHA anti-bot antes de liberar download
- **Upload Validado** — MIME type, magic bytes (JPEG/PNG/WebP), limite 5MB
- **Download URLs Validadas** — Apenas http/https permitidos
- **Video Embed Whitelist** — Apenas YouTube, Twitch e Kick + sandbox no iframe
- **Service Role Stateless** — Sem cookies, usa createClient direto
- **Clarity Excluido do Admin** — Nao grava sessoes em `/admin/*`

### Observabilidade

- **Sentry** — Error tracking (client, server, edge) com DSN configuravel
- **Web Vitals** — CLS, INP, LCP, FCP, TTFB enviados para GA4
- **Google Analytics 4** — Page views automaticos, excluindo admin
- **Microsoft Clarity** — Heatmaps e session recording

---

## Stack Tecnologica

| Camada         | Tecnologia                             | Versao |
| -------------- | -------------------------------------- | ------ |
| Framework      | Next.js (App Router)                   | 14.2   |
| Linguagem      | TypeScript                             | 5.5+   |
| Estilizacao    | Tailwind CSS                           | 3.4    |
| Animacoes      | Framer Motion + CSS animations         | 11.3   |
| Icones         | Lucide React                           | 0.400  |
| Backend/Auth   | Supabase (PostgreSQL + Auth + Storage) | 2.45   |
| Anti-bot       | Cloudflare Turnstile                   | -      |
| Error Tracking | Sentry                                 | 10.x   |
| Analytics      | Google Analytics 4 + Microsoft Clarity | -      |
| Web Vitals     | web-vitals                             | 5.x    |
| Anuncios       | Google AdSense                         | -      |
| CI/CD          | GitHub Actions                         | -      |
| Hospedagem     | Vercel                                 | -      |

---

## Estrutura do Projeto

```text
src/
├── app/
│   ├── layout.tsx                 # Layout global (scripts, PWA, meta tags)
│   ├── page.tsx                   # Home (Hero + Lancamentos + Categorias) [ISR 5min]
│   ├── error.tsx                  # Error boundary global
│   ├── categorias/
│   │   ├── page.tsx               # Categorias com filtros avancados [ISR 5min]
│   │   └── loading.tsx            # Loading skeleton
│   ├── serie/[slug]/
│   │   ├── page.tsx               # Pagina da serie (SEO + JSON-LD) [ISR 1h]
│   │   └── loading.tsx            # Loading skeleton
│   ├── admin/
│   │   ├── layout.tsx             # Layout admin (noindex)
│   │   ├── page.tsx               # Dashboard admin
│   │   ├── error.tsx              # Error boundary admin
│   │   ├── loading.tsx            # Loading skeleton admin
│   │   ├── login/page.tsx         # Login admin (com audit log)
│   │   └── series/...             # CRUD de series
│   └── api/
│       └── verify-turnstile/      # API Turnstile (rate limited)
├── components/
│   ├── ui/
│   │   ├── SiteShell.tsx          # Shell publico (Header + Footer + ads)
│   │   ├── Header.tsx             # Header com busca e tema
│   │   ├── CategoryBrowser.tsx    # Filtros avancados + favoritos + paginacao
│   │   ├── SeriesCard.tsx         # Card otimizado (memo + favorito + fallback)
│   │   ├── SeriesDetail.tsx       # Pagina da serie (fallback de imagens)
│   │   ├── VideoEmbed.tsx         # Embed YouTube/Twitch/Kick (sandbox)
│   │   ├── Analytics.tsx          # Google Analytics 4
│   │   ├── WebVitals.tsx          # Core Web Vitals tracking
│   │   ├── ClarityScript.tsx      # Microsoft Clarity (excl. admin)
│   │   └── TurnstileScript.tsx    # Cloudflare Turnstile loader
│   ├── ads/                       # Componentes de anuncio
│   └── admin/                     # Dashboard + SeriesForm (com audit log)
├── hooks/
│   └── useFavorites.ts            # Hook de favoritos (localStorage + sync)
├── lib/
│   ├── env.ts                     # Validacao de env vars
│   ├── site-config.ts             # Configuracao white-label
│   ├── brand.ts                   # Helper para split do nome no logo
│   ├── validation.ts              # Validacao de URLs e upload de imagens
│   ├── audit-log.ts               # Registro de acoes admin
│   └── supabase/
│       ├── client.ts              # Cliente Supabase (browser)
│       ├── server.ts              # Cliente Supabase (server/SSR)
│       ├── admin.ts               # Helper requireAdmin()
│       ├── schema.sql             # Schema SQL principal
│       ├── audit-log-migration.sql # Tabela de audit log
│       └── security-hardening.sql # Hardening SQL (RLS, REVOKE)
├── types/
│   └── database.ts                # Tipos TypeScript
├── middleware.ts                   # Protecao de rotas admin + session refresh
├── sentry.client.config.ts        # Sentry client-side
├── sentry.server.config.ts        # Sentry server-side
└── sentry.edge.config.ts          # Sentry edge runtime
```

---

## Configuracao Rapida

### Pre-requisitos

| Software | Versao minima           | Download                            |
| -------- | ----------------------- | ----------------------------------- |
| Node.js  | 18 (recomendado 20 LTS) | [nodejs.org](https://nodejs.org)    |
| npm      | 9+ (vem com Node.js)    | -                                   |
| Git      | 2.x                     | [git-scm.com](https://git-scm.com) |

### 1. Clonar o repositorio

```bash
git clone https://github.com/rodolfot/SiteWhiteLabelDownload.git
cd SiteWhiteLabelDownload
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Criar projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com) e crie um novo projeto
1. Escolha nome, senha do banco e regiao (South America se disponivel)
1. Aguarde a criacao (~2 minutos)

### 4. Executar o schema SQL

1. No painel Supabase, va em **SQL Editor** > **New query**
1. Cole o conteudo de `src/lib/supabase/schema.sql`
1. Clique em **Run**
1. Repita com `src/lib/supabase/audit-log-migration.sql` para criar a tabela de audit log

### 5. Criar usuario admin

1. Va em **Authentication** > **Users** > **Add user** > **Create new user**
1. Preencha email e senha (minimo 12 caracteres), marque **Auto Confirm User**
1. Clique em **Create user**
1. Copie o **UUID** do usuario criado
1. Va em **SQL Editor** e execute:

```sql
INSERT INTO admin_users (id, email)
VALUES ('COLE_O_UUID_AQUI', 'seu-email@exemplo.com');
```

### 6. Configurar variaveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` e preencha as **2 variaveis obrigatorias**:

```ini
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> As chaves estao em **Project Settings** > **API** no painel Supabase.

### 7. Rodar o projeto

```bash
npm run dev -- -p 3002
```

Acesse:

- **Site**: `http://localhost:3002`
- **Admin**: `http://localhost:3002/admin` (use o email/senha criados no passo 5)

---

## Variaveis de Ambiente

### Obrigatorias

| Variavel                        | Descricao               | Onde obter                              |
| ------------------------------- | ----------------------- | --------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL do projeto Supabase | Supabase > Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave publica anon      | Supabase > Settings > API > anon public |

> O build **falha** se essas variaveis nao estiverem configuradas.

### Opcionais — Funcionalidade

| Variavel                             | Descricao                                    | Padrao                            |
| ------------------------------------ | -------------------------------------------- | --------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY`          | Chave service_role (operacoes privilegiadas)  | -                                 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`     | Site key do Cloudflare Turnstile              | - (skip no dev, erro 503 em prod) |
| `TURNSTILE_SECRET_KEY`               | Secret key do Turnstile                       | -                                 |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID`     | ID do projeto Microsoft Clarity               | -                                 |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID`      | Client ID do Google AdSense (`ca-pub-xxx`)    | - (mostra placeholder)            |
| `NEXT_PUBLIC_ADSENSE_SLOT_ID`        | Slot ID do anuncio padrao (fallback)          | -                                 |
| `NEXT_PUBLIC_ADSENSE_SLOT_DOWNLOAD`  | Slot ID do modal de download (300x250)        | -                                 |
| `NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR`   | Slot ID da sidebar/laterais (300x600, 160x600)| -                                |
| `NEXT_PUBLIC_ADSENSE_SLOT_HEADER`    | Slot ID do header/rodape (728x90)             | -                                 |
| `NEXT_PUBLIC_ADSENSE_NATIVE_SLOT_ID` | Slot ID do anuncio nativo (entre cards)       | -                                 |

### Opcionais — Observabilidade

| Variavel                         | Descricao                        | Padrao |
| -------------------------------- | -------------------------------- | ------ |
| `NEXT_PUBLIC_SENTRY_DSN`         | DSN do projeto Sentry            | -      |
| `SENTRY_ORG`                     | Organizacao no Sentry            | -      |
| `SENTRY_PROJECT`                 | Projeto no Sentry                | -      |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`  | ID de medicao do Google Analytics| -      |

### Opcionais — White-Label

| Variavel                       | Descricao                  | Padrao                                         |
| ------------------------------ | -------------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_SITE_NAME`        | Nome do site               | `DownDoor`                                     |
| `NEXT_PUBLIC_SITE_TAGLINE`     | Tagline/subtitulo          | `Seu Portal para Videos e Downloads Gratuitos` |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | Descricao para SEO         | `Portal premium para streaming...`             |
| `NEXT_PUBLIC_SITE_URL`         | URL publica (para sitemap) | `https://example.com`                          |
| `NEXT_PUBLIC_CONTACT_EMAIL`    | Email exibido na pagina DMCA | `contato@exemplo.com`                        |

---

## Banco de Dados

### Diagrama ER

```text
┌──────────────┐
│ admin_users   │
│──────────────│
│ id (UUID/PK) │──→ auth.users
│ email         │
│ created_at    │
└──────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  series       │──1:N──│  seasons      │──1:N──│  episodes     │
│──────────────│       │──────────────│       │──────────────│
│ id (UUID/PK) │       │ id (UUID/PK) │       │ id (UUID/PK) │
│ title         │       │ series_id(FK)│       │ season_id(FK)│
│ slug (unique) │       │ number       │       │ number       │
│ synopsis      │       │ title        │       │ title        │
│ poster_url    │       │ trailer_url  │       │ download_url │
│ backdrop_url  │       │ created_at   │       │ file_size    │
│ year          │       └──────────────┘       │ quality      │
│ genre         │                               │ created_at   │
│ rating        │                               └──────────────┘
│ category      │
│ featured      │       ┌──────────────────┐
│ created_at    │       │ admin_audit_log   │
│ updated_at    │       │──────────────────│
└──────────────┘       │ id (UUID/PK)     │
                        │ admin_id (UUID)  │
                        │ admin_email      │
                        │ action           │
                        │ entity           │
                        │ entity_id        │
                        │ details          │
                        │ created_at       │
                        └──────────────────┘
```

### Politicas RLS

| Tabela            | SELECT                 | INSERT/UPDATE/DELETE |
| ----------------- | ---------------------- | -------------------- |
| `series`          | Publico                | Apenas `is_admin()`  |
| `seasons`         | Publico                | Apenas `is_admin()`  |
| `episodes`        | Publico                | Apenas `is_admin()`  |
| `admin_users`     | Apenas o proprio admin | -                    |
| `admin_audit_log` | Apenas admins          | admin_id = auth.uid()|
| `storage` (media) | Publico                | Apenas `is_admin()`  |

### Funcao is_admin()

Funcao SQL `SECURITY DEFINER` que verifica se o `auth.uid()` atual existe na tabela `admin_users`. Usada em todas as policies RLS de escrita.

---

## White-Label

O site e 100% white-label. Para usar com sua propria marca, basta definir as variaveis de ambiente:

```ini
NEXT_PUBLIC_SITE_NAME=MeuSite
NEXT_PUBLIC_SITE_TAGLINE=A melhor plataforma de downloads
NEXT_PUBLIC_SITE_DESCRIPTION=Descricao para SEO e meta tags
NEXT_PUBLIC_CONTACT_EMAIL=contato@meusite.com
NEXT_PUBLIC_SITE_URL=https://meusite.com
```

O logo e gerado automaticamente dividindo o nome ao meio: a primeira metade fica branca e a segunda metade recebe o gradiente neon (azul para roxo). Exemplos:

| NEXT_PUBLIC_SITE_NAME | Resultado          |
| --------------------- | ------------------ |
| `DownDoor`            | **Down** + *Door*  |
| `MegaFlix`            | **Mega** + *Flix*  |
| `StreamHub`           | **Stre** + *amHub* |

---

## Monetizacao (Anuncios)

### Google AdSense

Configure as variaveis para ativar anuncios reais:

```ini
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-1234567890
NEXT_PUBLIC_ADSENSE_SLOT_ID=1234567890
NEXT_PUBLIC_ADSENSE_SLOT_DOWNLOAD=1111111111
NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=2222222222
NEXT_PUBLIC_ADSENSE_SLOT_HEADER=3333333333
NEXT_PUBLIC_ADSENSE_NATIVE_SLOT_ID=4444444444
```

Sem configurar, os espacos de anuncio mostram placeholders visuais em dev. Em producao no dominio aprovado pelo AdSense, os anuncios reais sao exibidos.

### Espacos de Anuncio

| Local                   | Tamanho      | Env var                  | Visibilidade  |
| ----------------------- | ------------ | ------------------------ | ------------- |
| Header (2 banners)      | 728x90       | `ADSENSE_SLOT_HEADER`    | Desktop (lg+) |
| Lateral esquerda        | 160x600      | `ADSENSE_SLOT_SIDEBAR`   | Desktop (xl+) |
| Lateral direita         | 160x600      | `ADSENSE_SLOT_SIDEBAR`   | Desktop (xl+) |
| Rodape fixo (2 banners) | 728x90       | `ADSENSE_SLOT_HEADER`    | Sempre        |
| Home (entre cards)      | Nativo/Fluid | `ADSENSE_NATIVE_SLOT_ID` | Todos         |
| Serie (sidebar)         | 300x600      | `ADSENSE_SLOT_SIDEBAR`   | Desktop (lg+) |
| Modal de download       | 300x250      | `ADSENSE_SLOT_DOWNLOAD`  | Todos         |

---

## Seguranca

### Checklist de Producao

- [ ] Variavel `TURNSTILE_SECRET_KEY` configurada (obrigatoria em prod — retorna erro 503 sem ela)
- [ ] Variavel `NEXT_PUBLIC_TURNSTILE_SITE_KEY` configurada
- [ ] Usuario admin criado e registrado na tabela `admin_users`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada (nunca no frontend)
- [ ] Dominio adicionado ao Cloudflare Turnstile
- [ ] `NEXT_PUBLIC_SITE_URL` definida com o dominio real (para sitemap e JSON-LD)
- [ ] Se usar imagens de CDN externo, adicionar hostname em `next.config.mjs`
- [ ] Verificar `npm audit` e manter dependencias atualizadas
- [ ] Supabase: signup publico desabilitado, email confirmation habilitado
- [ ] Supabase: password min length = 12, JWT expiry = 3600, refresh token rotation

### Fluxo de Autenticacao Admin

```text
Browser → /admin → Middleware verifica auth.getUser()
                  → Middleware verifica admin_users.id == user.id
                  → Se nao: redirect /admin/login
                  → Se sim: renderiza dashboard
                  → Acao registrada no audit log
```

---

## SEO e Performance

### Gerado Automaticamente

| Recurso       | Rota           | Descricao                                    |
| ------------- | -------------- | -------------------------------------------- |
| `robots.txt`  | `/robots.txt`  | Permite `/`, bloqueia `/admin/` e `/api/`    |
| `sitemap.xml` | `/sitemap.xml` | Paginas estaticas + todas as series do banco |
| Favicon       | `/favicon.svg` | SVG com gradiente e inicial do nome do site  |
| Meta OG       | Cada pagina    | Title, description, og:image para cada serie |
| Twitter Cards | Cada pagina    | summary_large_image com poster/backdrop      |
| JSON-LD       | `/serie/*`     | TVSeries schema.org structured data          |
| Manifest      | `/manifest.json` | PWA manifest para instalacao                |

### ISR (Incremental Static Regeneration)

| Pagina       | Revalidacao | Motivo                            |
| ------------ | ----------- | --------------------------------- |
| Home         | 5 minutos   | Conteudo muda com frequencia      |
| Categorias   | 5 minutos   | Mesmo dataset da home             |
| Serie detail | 1 hora      | Conteudo muda raramente           |
| Sitemap      | Dinamico    | Sempre atualizado                 |

---

## Observabilidade

### Sentry (Error Tracking)

Configure `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG` e `SENTRY_PROJECT` para ativar. Captura erros em client, server e edge runtime com sample rate de 10%.

### Google Analytics 4

Configure `NEXT_PUBLIC_GA_MEASUREMENT_ID` para ativar. Envia page views automaticamente em cada navegacao (exceto rotas `/admin/*`). Web Vitals (CLS, INP, LCP, FCP, TTFB) sao enviados como eventos.

### Microsoft Clarity

Configure `NEXT_PUBLIC_CLARITY_PROJECT_ID` para heatmaps e session recording. Automaticamente excluido de rotas admin.

### Audit Log

Todas as acoes admin sao registradas na tabela `admin_audit_log`:

| Acao   | Entidade | Quando                      |
| ------ | -------- | --------------------------- |
| login  | auth     | Admin faz login             |
| logout | auth     | Admin faz logout            |
| create | series   | Nova serie criada           |
| update | series   | Serie editada               |
| delete | series   | Serie excluida              |

---

## CI/CD

O projeto inclui 3 workflows GitHub Actions em `.github/workflows/`:

### 1. CI (ci.yml)

Roda em **push** e **pull requests** para `main`/`master`:

- Checkout + cache de dependencias
- `npm ci` (install)
- `npm run lint` (ESLint)
- `npx tsc --noEmit` (type check)
- `npm run build` (build de producao)

### 2. Deploy Preview (deploy-preview.yml)

Roda em **pull requests**: faz build e deploy preview no Vercel, comenta na PR com a URL de preview.

### 3. Deploy Production (deploy-production.yml)

Roda em **push para main/master** (apos CI passar): faz build e deploy de producao no Vercel.

### 4. E2E Tests (e2e.yml)

Roda em **push** e **pull requests** para `main`/`master`:

- Instala browsers Playwright (chromium, firefox, webkit)
- Roda testes E2E em matriz paralela (3 browsers)
- Upload de report como artifact em caso de falha

#### Testes incluidos

| Arquivo              | O que testa                                          |
| -------------------- | ---------------------------------------------------- |
| `e2e/home.spec.ts`   | Home carrega, header, footer, navegacao              |
| `e2e/categorias.spec.ts` | Filtros, busca, painel avancado                  |
| `e2e/serie.spec.ts`  | 404 para slug inexistente                            |
| `e2e/admin.spec.ts`  | Redirect sem auth, login, credenciais invalidas      |
| `e2e/seo.spec.ts`    | robots.txt, sitemap.xml, meta tags, manifest.json    |
| `e2e/legal.spec.ts`  | Termos, privacidade, DMCA carregam com conteudo      |

#### Rodar localmente

```bash
npx playwright install          # instalar browsers (primeira vez)
npm run test:e2e                # rodar todos os testes
npm run test:e2e:ui             # rodar com interface visual
```

### Configurar Vercel no GitHub Actions

1. Instale o Vercel CLI: `npm i -g vercel`
1. Rode `vercel link` na raiz do projeto para vincular
1. No GitHub, va em **Settings** > **Secrets and variables** > **Actions**
1. Adicione os seguintes **secrets**:

| Secret         | Onde obter                                                     |
| -------------- | -------------------------------------------------------------- |
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID`| Arquivo `.vercel/project.json` apos `vercel link`              |

1. Adicione a seguinte **variable** (nao secret):

| Variable           | Onde obter                                        |
| ------------------ | ------------------------------------------------- |
| `VERCEL_PROJECT_ID`| Arquivo `.vercel/project.json` apos `vercel link` |

> Se nao configurar `VERCEL_PROJECT_ID`, os workflows de deploy sao silenciosamente ignorados e apenas o CI (lint + build) roda.

---

## Deploy em Producao

> Para o guia completo de configuracao de servicos externos (Sentry, GA4, dominio, CDN), veja [`docs/SETUP-GUIDE.md`](docs/SETUP-GUIDE.md).

### Opcao 1 — Vercel (Recomendado)

1. Acesse [vercel.com](https://vercel.com) e faca login com GitHub
1. Clique em **Add New... > Project**
1. Selecione o repositorio `SiteWhiteLabelDownload`
1. Em **Environment Variables**, adicione todas as variaveis do `.env.local`
1. Clique em **Deploy**
1. Apos ~2 min, o site estara no ar em `https://seu-projeto.vercel.app`

### Opcao 2 — Self-hosted

```bash
npm run build
npm start
```

O servidor roda na porta 3000 por padrao. Use um reverse proxy (Nginx, Caddy) para HTTPS.

---

## Comandos

| Comando                       | Descricao                                   |
| ----------------------------- | ------------------------------------------- |
| `npm run dev -- -p 3002`      | Servidor de desenvolvimento (porta 3002)    |
| `npm run build`               | Compilar para producao                      |
| `npm start`                   | Iniciar servidor de producao (apos build)   |
| `npm run lint`                | Verificar erros de codigo com ESLint        |
| `npx tsc --noEmit`           | Verificar tipos TypeScript sem compilar     |
| `npm audit`                   | Verificar vulnerabilidades em dependencias  |
| `npm run test:e2e`            | Rodar testes E2E com Playwright             |
| `npm run test:e2e:ui`         | Rodar testes E2E com interface visual       |

---

## Arquitetura

### Fluxo de Dados

```text
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────→│  Next.js SSR │────→│   Supabase   │
│  (React)     │←────│  (Server)    │←────│ (PostgreSQL) │
└─────────────┘     └──────────────┘     └──────────────┘
       │                    │                     │
       │                    │                     │
  Tailwind CSS          Middleware            RLS Policies
  Web Vitals         ISR + Session           is_admin()
  Sentry Client      Sentry Server         Storage (media)
  AdSense/Clarity    Turnstile API          Audit Log
```

### Paginas Server vs Client

| Tipo                 | Paginas                                                                            | Motivo                            |
| -------------------- | ---------------------------------------------------------------------------------- | --------------------------------- |
| **Server Component** | Home, Categorias, Serie, Admin (page), Termos, Privacidade, DMCA                   | Fetch de dados no servidor, SEO   |
| **Client Component** | Header, CategoryBrowser, HeroCarousel, SeriesDetail, SeriesCard, SeriesForm, Ads   | Interatividade, estado, animacoes |

### Middleware

O `middleware.ts` roda em todas as rotas (exceto assets estaticos). Funcoes:
1. Refresh da sessao Supabase para manter o usuario logado
2. Verificacao de autenticacao + role admin em rotas `/admin/*`
3. Redirect para `/admin/login` se nao autorizado

---

## Solucao de Problemas

### Missing required environment variables

O build falha se `NEXT_PUBLIC_SUPABASE_URL` ou `NEXT_PUBLIC_SUPABASE_ANON_KEY` nao estiverem definidas. Verifique seu `.env.local`.

### O site abre mas aparece em branco

- Verifique se o `.env.local` foi criado (nao e `.env.local.example`)
- Verifique se as chaves do Supabase estao corretas (sem espacos extras)
- Reinicie o servidor (`Ctrl+C` e `npm run dev -- -p 3002`)

### Nao consigo fazer login no admin

- Verifique se criou o usuario no Supabase Auth e marcou "Auto Confirm User"
- Verifique se inseriu o UUID na tabela `admin_users` (passo 5 da configuracao)
- A senha deve ter no minimo 12 caracteres

### As series nao aparecem na Home

- Faca login no admin e cadastre pelo menos uma serie
- Marque a serie como "Destaque" para aparecer no carrossel

### Imagens nao carregam

- Por seguranca, apenas imagens de `*.supabase.co` e `*.supabase.in` sao permitidas
- Para usar outro CDN, adicione o hostname em `next.config.mjs` > `remotePatterns`
- Se a imagem original estiver fora do ar, o card mostra um fallback com o titulo

### Erro 503 no download (producao)

- O Cloudflare Turnstile e **obrigatorio** em producao
- Configure `NEXT_PUBLIC_TURNSTILE_SITE_KEY` e `TURNSTILE_SECRET_KEY`
- Em desenvolvimento, o Turnstile e automaticamente ignorado

### CI falha no GitHub Actions

- O workflow CI usa variaveis placeholder para build — nao precisa de secrets
- Verifique se `npm run lint` e `npx tsc --noEmit` passam localmente

---

## Licenca

Projeto proprietario. Todos os direitos reservados.
