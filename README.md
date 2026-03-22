# SiteWhiteLabelDownload

Plataforma white-label de streaming e download de videos de alta performance, com painel administrativo completo, monetizacao via anuncios e design Dark/Light Mode inspirado em Apple TV+ / Netflix.

O nome, tagline e descricao do site sao 100% configuraveis via variaveis de ambiente — basta trocar as env vars para ter um site com sua propria marca.

---

## Indice

- [Demonstracao](#demonstracao)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnologica](#stack-tecnologica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Guia Completo para Testar o Site](#guia-completo-para-testar-o-site-passo-a-passo-para-iniciantes)
- [Configuracao Rapida (referencia tecnica)](#configuracao-rapida-referencia-tecnica)
- [Variaveis de Ambiente](#variaveis-de-ambiente)
- [Banco de Dados](#banco-de-dados)
- [White-Label](#white-label)
- [Monetizacao (Anuncios)](#monetizacao-anuncios)
- [Seguranca](#seguranca)
- [SEO e Performance](#seo-e-performance)
- [Observabilidade](#observabilidade)
- [CI/CD](#cicd)
- [Testes Unitarios e E2E](#testes-unitarios-e-e2e)
- [Storybook (Documentacao Visual)](#storybook-documentacao-visual)
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
| Pedir uma serie           | `/requisicoes`             |
| Painel admin              | `/admin`                   |
| Login admin               | `/admin/login`             |
| Analytics admin           | `/admin/analytics`         |
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
- **Comentarios** — Sistema de comentarios anonimos por serie com nickname, validacao e moderacao pelo admin
- **Requisicao de Series** — Pagina publica (`/requisicoes`) para pedir series, com sistema de votos e gestao pelo admin
- **Multi-idioma (i18n)** — Suporte a Portugues, Ingles e Espanhol com deteccao automatica do navegador e seletor no header
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
- **Analytics Interno** — Dashboard em `/admin/analytics` com views totais, top paginas, series mais vistas, moderacao de comentarios e gestao de requisicoes

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
| Framework      | Next.js (App Router)                   | 16.2   |
| Runtime        | React                                  | 19.2   |
| Linguagem      | TypeScript                             | 5.5+   |
| Estilizacao    | Tailwind CSS                           | 3.4    |
| Animacoes      | Framer Motion + CSS animations         | 11.3   |
| Icones         | Lucide React                           | 0.400  |
| Backend/Auth   | Supabase (PostgreSQL + Auth + Storage) | 2.45   |
| Anti-bot       | Cloudflare Turnstile                   | -      |
| Testes         | Vitest + Testing Library               | 3.x    |
| Storybook      | Storybook (React Vite)                 | 10.x   |
| Error Tracking | Sentry                                 | 10.x   |
| Analytics      | Google Analytics 4 + Microsoft Clarity | -      |
| Web Vitals     | web-vitals                             | 5.x    |
| Linting        | ESLint                                 | 10.x   |
| Anuncios       | Google AdSense                         | -      |
| Container      | Docker + Kubernetes                    | -      |
| CI/CD          | GitHub Actions                         | -      |
| Hospedagem     | Vercel / Docker / Kubernetes           | -      |

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
│   │   ├── Comments.tsx           # Comentarios anonimos por serie
│   │   ├── SeriesRequests.tsx     # Requisicao de series + votos
│   │   ├── PageViewTracker.tsx    # Tracker de page views (analytics)
│   │   ├── LanguageSwitcher.tsx   # Seletor de idioma (pt-BR/en/es)
│   │   ├── Analytics.tsx          # Google Analytics 4
│   │   ├── WebVitals.tsx          # Core Web Vitals tracking
│   │   ├── ClarityScript.tsx      # Microsoft Clarity (excl. admin)
│   │   └── TurnstileScript.tsx    # Cloudflare Turnstile loader
│   ├── ads/                       # Componentes de anuncio
│   └── admin/
│       ├── AdminDashboard.tsx     # Dashboard + link analytics
│       ├── AnalyticsDashboard.tsx # Analytics + moderacao + requisicoes
│       └── SeriesForm.tsx         # CRUD de series (com audit log)
├── hooks/
│   └── useFavorites.ts            # Hook de favoritos (localStorage + sync)
├── lib/
│   ├── env.ts                     # Validacao de env vars
│   ├── site-config.ts             # Configuracao white-label
│   ├── brand.ts                   # Helper para split do nome no logo
│   ├── validation.ts              # Validacao de URLs e upload de imagens
│   ├── audit-log.ts               # Registro de acoes admin
│   ├── i18n/
│   │   ├── dictionaries.ts        # Dicionarios pt-BR, en, es
│   │   └── context.tsx            # Provider + hook useI18n()
│   └── supabase/
│       ├── client.ts              # Cliente Supabase (browser)
│       ├── server.ts              # Cliente Supabase (server/SSR)
│       ├── admin.ts               # Helper requireAdmin()
│       ├── schema.sql             # Schema SQL principal
│       ├── audit-log-migration.sql # Tabela de audit log
│       ├── comments-migration.sql # Tabelas comments, requests, page_views
│       └── security-hardening.sql # Hardening SQL (RLS, REVOKE)
├── __tests__/
│   └── setup.ts                   # Setup do Vitest + jest-dom
├── types/
│   └── database.ts                # Tipos TypeScript
├── middleware.ts                   # Protecao de rotas admin + session refresh
├── sentry.client.config.ts        # Sentry client-side
├── sentry.server.config.ts        # Sentry server-side
└── sentry.edge.config.ts          # Sentry edge runtime
```

---

## Guia Completo para Testar o Site (passo a passo para iniciantes)

Este guia assume que voce **nunca programou** e quer testar o site no seu computador. Siga cada passo na ordem — ao final, o site estara rodando no seu navegador.

### Passo 1 — Instalar o Node.js (programa que roda o site)

1. Abra o navegador e acesse: **https://nodejs.org**
2. Clique no botao verde **"LTS"** (versao recomendada) para baixar o instalador
3. Abra o arquivo baixado (ex: `node-v20.x.x.msi` no Windows)
4. Clique em **Next** em todas as telas e depois em **Install**
5. Aguarde a instalacao terminar e clique em **Finish**

**Como verificar se deu certo:**
- Abra o **Prompt de Comando** (no Windows: tecle `Win + R`, digite `cmd` e aperte Enter)
- Digite `node --version` e aperte Enter
- Deve aparecer algo como `v20.12.0` — se apareceu, esta instalado

### Passo 2 — Instalar o Git (programa que baixa o codigo)

1. Acesse: **https://git-scm.com**
2. Clique em **"Download for Windows"** (ou Mac/Linux conforme seu sistema)
3. Abra o instalador e clique **Next** em todas as telas, depois **Install**
4. Aguarde e clique em **Finish**

**Como verificar:**
- No Prompt de Comando, digite `git --version` e aperte Enter
- Deve aparecer algo como `git version 2.44.0`

### Passo 3 — Baixar o codigo do projeto

1. Abra o **Prompt de Comando**
2. Escolha onde quer salvar o projeto. Por exemplo, para salvar na pasta Documentos:
   ```
   cd %USERPROFILE%\Documents
   ```
3. Baixe o projeto com este comando (copie e cole):
   ```
   git clone https://github.com/rodolfot/SiteWhiteLabelDownload.git
   ```
4. Entre na pasta do projeto:
   ```
   cd SiteWhiteLabelDownload
   ```

### Passo 4 — Instalar as dependencias do projeto

Ainda no Prompt de Comando (dentro da pasta do projeto), digite:

```
npm install
```

Vai aparecer muita coisa na tela — e normal. Aguarde ate voltar a aparecer o cursor piscando (pode levar 1-2 minutos).

### Passo 5 — Criar o banco de dados no Supabase (gratuito)

O Supabase e o banco de dados do site. Voce precisa criar uma conta gratuita:

1. Abra o navegador e acesse: **https://supabase.com**
2. Clique em **"Start your project"** (botao verde)
3. Faca login com sua conta do **GitHub** ou crie uma conta com email
4. Apos o login, clique em **"New Project"**
5. Preencha:
   - **Name**: qualquer nome (ex: `meu-site-teste`)
   - **Database Password**: crie uma senha forte e **anote ela** (voce nao vai precisar dela depois, mas e bom guardar)
   - **Region**: escolha **South America (Sao Paulo)** se disponivel
6. Clique em **"Create new project"**
7. **Aguarde 2-3 minutos** ate o projeto ficar pronto (a tela vai mostrar o progresso)

### Passo 6 — Copiar as chaves do Supabase

Quando o projeto estiver pronto:

1. No painel do Supabase, clique em **"Project Settings"** (icone de engrenagem no menu lateral esquerdo, la embaixo)
2. Clique em **"API"** no submenu
3. Voce vai ver duas informacoes importantes:
   - **Project URL**: algo como `https://abcdefgh.supabase.co` — **copie e guarde**
   - **anon public** (em "Project API keys"): uma chave longa comecando com `eyJ...` — **copie e guarde**

> Dica: abra um Bloco de Notas e cole as duas informacoes la para nao perder.

### Passo 7 — Criar as tabelas do banco de dados

1. No painel do Supabase, clique em **"SQL Editor"** no menu lateral esquerdo
2. Clique em **"New query"** (botao verde no canto superior)
3. Agora voce precisa colar o conteudo de um arquivo do projeto. Para abrir o arquivo:
   - Volte ao **Prompt de Comando** e digite:
     ```
     notepad src\lib\supabase\schema.sql
     ```
   - Isso abre o arquivo no Bloco de Notas
   - Selecione **todo o conteudo** (`Ctrl + A`) e copie (`Ctrl + C`)
4. Volte ao Supabase, cole o conteudo na area de texto (`Ctrl + V`)
5. Clique no botao **"Run"** (botao verde, ou `Ctrl + Enter`)
6. Deve aparecer **"Success"** embaixo

Agora repita o processo para a tabela de auditoria:

7. Clique em **"New query"** novamente
8. No Prompt de Comando, digite:
   ```
   notepad src\lib\supabase\audit-log-migration.sql
   ```
9. Copie todo o conteudo, cole no Supabase e clique em **"Run"**
10. Deve aparecer **"Success"** novamente

### Passo 8 — Criar seu usuario administrador

1. No painel do Supabase, clique em **"Authentication"** no menu lateral
2. Clique na aba **"Users"**
3. Clique em **"Add user"** > **"Create new user"**
4. Preencha:
   - **Email**: coloque um email qualquer (ex: `admin@teste.com`)
   - **Password**: crie uma senha com **pelo menos 12 caracteres** (ex: `MinhaSenha123!`)
   - Marque a opcao **"Auto Confirm User"**
5. Clique em **"Create user"**
6. O usuario vai aparecer na lista. **Copie o UUID** dele — e o codigo longo na primeira coluna (algo como `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

Agora registre esse usuario como admin:

7. Va em **"SQL Editor"** > **"New query"**
8. Cole este comando, **substituindo os valores**:
   ```sql
   INSERT INTO admin_users (id, email)
   VALUES ('COLE_O_UUID_AQUI', 'admin@teste.com');
   ```
   - Substitua `COLE_O_UUID_AQUI` pelo UUID que voce copiou (mantenha as aspas simples)
   - Substitua `admin@teste.com` pelo email que voce usou
9. Clique em **"Run"**
10. Deve aparecer **"Success"**

### Passo 9 — Configurar o arquivo de ambiente

1. Volte ao **Prompt de Comando** (na pasta do projeto)
2. Crie o arquivo de configuracao copiando o exemplo:
   ```
   copy .env.local.example .env.local
   ```
3. Abra o arquivo para editar:
   ```
   notepad .env.local
   ```
4. Encontre estas duas linhas e substitua pelos valores que voce copiou no **Passo 6**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   - Na primeira linha, cole a **Project URL** do Supabase
   - Na segunda linha, cole a **chave anon public** do Supabase
5. Salve o arquivo (`Ctrl + S`) e feche o Bloco de Notas

### Passo 10 — Rodar o site

1. No Prompt de Comando (na pasta do projeto), digite:
   ```
   npm run dev -- -p 3002
   ```
2. Aguarde ate aparecer algo como:
   ```
   ✓ Ready in 3.2s
   - Local: http://localhost:3002
   ```
3. **Nao feche o Prompt de Comando** — ele precisa ficar aberto enquanto o site estiver rodando

### Passo 11 — Abrir o site no navegador

1. Abra o navegador (Chrome, Edge, Firefox, etc.)
2. Na barra de endereco, digite: **http://localhost:3002** e aperte Enter
3. O site vai abrir! Na primeira vez vai estar vazio porque nao tem series cadastradas ainda

### Passo 12 — Cadastrar sua primeira serie (testar o admin)

1. No navegador, acesse: **http://localhost:3002/admin**
2. Voce sera redirecionado para a tela de login
3. Digite o **email** e **senha** que voce criou no Passo 8
4. Clique em **Entrar**
5. Voce esta no painel admin! Clique em **"Nova Serie"** para cadastrar
6. Preencha os campos:
   - **Titulo**: nome da serie (ex: `Breaking Bad`)
   - **Sinopse**: uma descricao qualquer
   - **Ano**: `2008`
   - **Genero**: `Drama`
   - **Categoria**: escolha uma (ex: `Lancamentos`)
   - **Destaque**: marque para aparecer no carrossel da home
   - **Poster**: cole a URL de uma imagem (ex: busque "breaking bad poster" no Google Images, clique com botao direito na imagem > "Copiar endereco da imagem")
7. Clique em **"Salvar"**
8. Volte para **http://localhost:3002** — sua serie deve aparecer na home!

### Passo 13 — Parar o site

Quando terminar de testar:

1. Va no Prompt de Comando onde o site esta rodando
2. Aperte **Ctrl + C**
3. Se perguntar algo, digite **S** e aperte Enter

Para rodar o site novamente mais tarde, basta repetir o **Passo 10**.

---

### Resumo rapido (para quem ja sabe o que esta fazendo)

```bash
git clone https://github.com/rodolfot/SiteWhiteLabelDownload.git
cd SiteWhiteLabelDownload
npm install
cp .env.local.example .env.local    # editar com URL e chave do Supabase
npm run dev -- -p 3002              # abrir http://localhost:3002
```

---

## Configuracao Rapida (referencia tecnica)

### Pre-requisitos

| Software | Versao minima           | Download                            |
| -------- | ----------------------- | ----------------------------------- |
| Node.js  | 18 (recomendado 20 LTS) | [nodejs.org](https://nodejs.org)    |
| npm      | 9+ (vem com Node.js)    | -                                   |
| Git      | 2.x                     | [git-scm.com](https://git-scm.com) |

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

┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ comments          │   │ series_requests   │   │ page_views        │
│──────────────────│   │──────────────────│   │──────────────────│
│ id (UUID/PK)     │   │ id (UUID/PK)     │   │ id (UUID/PK)     │
│ series_id (FK)   │   │ title            │   │ page_path        │
│ nickname         │   │ description      │   │ series_id (FK)   │
│ content          │   │ nickname         │   │ referrer         │
│ approved         │   │ status           │   │ user_agent       │
│ created_at       │   │ admin_notes      │   │ ip_hash          │
└──────────────────┘   │ votes            │   │ created_at       │
                        │ created_at       │   └──────────────────┘
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
| `comments`        | Aprovados (publico)    | INSERT anonimo, moderacao admin |
| `series_requests` | Publico                | INSERT anonimo, gestao admin    |
| `page_views`      | Apenas admins          | INSERT anonimo                  |
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

### Analytics Interno

Dashboard em `/admin/analytics` com:
- Total de page views
- Top paginas mais acessadas (30 dias)
- Series mais vistas (30 dias)
- Moderacao de comentarios (aprovar/reprovar/excluir)
- Gestao de requisicoes (aprovar/rejeitar/concluir)

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

## Testes Unitarios e E2E

### Vitest (Unitarios)

O projeto usa **Vitest** com **Testing Library** para testes unitarios. Atualmente possui **25 testes** cobrindo:

| Arquivo                          | Testes | O que testa                                      |
| -------------------------------- | ------ | ------------------------------------------------ |
| `src/lib/validation.test.ts`     | 14     | Validacao de URLs de download e trailer           |
| `src/lib/i18n/dictionaries.test.ts` | 7   | Locales, getDictionary, consistencia de chaves    |
| `src/lib/site-config.test.ts`    | 3      | Propriedades do siteConfig                        |
| `src/lib/brand.test.ts`          | 1      | Split do nome para o logo                         |

```bash
npm test              # rodar todos os testes
npm run test:watch    # modo watch (re-roda ao salvar)
npm run test:coverage # rodar com relatorio de cobertura
```

### Testes E2E (Playwright)

6 arquivos de teste cobrindo home, categorias, serie, admin, SEO e paginas legais em 3 browsers (Chromium, Firefox, WebKit).

```bash
npx playwright install   # instalar browsers (primeira vez)
npm run test:e2e         # rodar todos os testes
npm run test:e2e:ui      # rodar com interface visual
```

---

## Storybook (Documentacao Visual)

Documentacao visual de componentes com **Storybook 10** (React Vite).

### Stories disponiveis

| Componente        | Variantes                         |
| ----------------- | --------------------------------- |
| `ThemeToggle`     | Default                           |
| `LanguageSwitcher`| Default (com I18nProvider)        |
| `SeriesCard`      | Default, Featured, NoImage        |

### Comandos

```bash
npm run storybook        # abrir Storybook em http://localhost:6006
npm run build-storybook  # build estatico do Storybook
```

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

### Opcao 2 — Docker

```bash
# Build da imagem
docker build -t downdoor \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... \
  .

# Rodar o container
docker run -p 3000:3000 --env-file .env.local downdoor
```

Ou com Docker Compose (recomendado):

```bash
# Copie .env.local para o diretorio e rode:
docker-compose up -d
```

O `docker-compose.yml` ja inclui health check, restart policy e todas as env vars.

### Opcao 3 — Kubernetes

```bash
# 1. Criar os secrets (copie e preencha o exemplo)
cp k8s/secrets.yaml.example k8s/secrets.yaml
# Edite k8s/secrets.yaml com seus valores em base64:
#   echo -n "valor" | base64

# 2. Aplicar os manifests
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployment.yaml

# 3. Verificar o deploy
kubectl get pods -l app=downdoor
kubectl get svc downdoor
```

Os manifests incluem:
- **Deployment** com 2 replicas, readiness/liveness probes e limites de recursos
- **Service** (ClusterIP) na porta 80 → 3000
- **Ingress** (nginx) com TLS — edite `downdoor.example.com` para seu dominio
- **HPA** (Horizontal Pod Autoscaler) — escala de 2 a 10 pods com base em CPU (70%)

### Opcao 4 — Self-hosted

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
| `npm run build`               | Compilar para producao (standalone output)  |
| `npm start`                   | Iniciar servidor de producao (apos build)   |
| `npm run lint`                | Verificar erros de codigo com ESLint 10     |
| `npx tsc --noEmit`            | Verificar tipos TypeScript sem compilar     |
| `npm test`                    | Rodar testes unitarios com Vitest           |
| `npm run test:watch`          | Testes unitarios em modo watch              |
| `npm run test:coverage`       | Testes unitarios com relatorio de cobertura |
| `npm run test:e2e`            | Rodar testes E2E com Playwright             |
| `npm run test:e2e:ui`         | Rodar testes E2E com interface visual       |
| `npm run storybook`           | Abrir Storybook em localhost:6006           |
| `npm run build-storybook`     | Build estatico do Storybook                 |
| `npm audit`                   | Verificar vulnerabilidades (0 atualmente)   |
| `docker-compose up -d`        | Rodar com Docker Compose                    |
| `kubectl apply -f k8s/`       | Deploy no Kubernetes                        |

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
