# SiteWhiteLabelDownload

Plataforma white-label de streaming e download de videos de alta performance, com painel administrativo completo, monetizacao via anuncios e design Dark Mode inspirado em Apple TV+ / Netflix.

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
- [SEO](#seo)
- [CI/CD](#cicd)
- [Deploy em Producao](#deploy-em-producao)
- [Comandos](#comandos)
- [Arquitetura](#arquitetura)
- [Solucao de Problemas](#solucao-de-problemas)
- [Licenca](#licenca)

---

## Demonstracao

| Pagina                  | Rota                     |
| ----------------------- | ------------------------ |
| Home (hero + categorias) | `/`                     |
| Pagina da serie         | `/serie/[slug]`          |
| Painel admin            | `/admin`                 |
| Login admin             | `/admin/login`           |
| Criar serie             | `/admin/series/new`      |
| Editar serie            | `/admin/series/[id]/edit` |
| Termos de Uso           | `/termos`                |
| Politica de Privacidade | `/privacidade`           |
| DMCA                    | `/dmca`                  |

---

## Funcionalidades

### Interface Publica

- **Hero Carousel** — Carrossel automatico de series em destaque com transicoes suaves (Framer Motion), backdrop em tela cheia com gradiente e botoes de navegacao
- **Grids por Categoria** — Series organizadas por categoria com scroll horizontal, botoes de navegacao e efeitos de hover com zoom
- **Live Search** — Busca em tempo real no header (desktop e mobile) com debounce de 300ms, resultados com poster e metadados
- **Pagina da Serie** — Backdrop imersivo, poster, sinopse, metadados (ano, genero, nota), abas de temporadas e lista de episodios com download
- **Design Responsivo** — Mobile-first com breakpoints para sm, md e lg
- **Micro-animacoes** — Fade-in de cards, transicoes de pagina e hover effects via Framer Motion
- **Paginas Legais** — Termos de Uso, Politica de Privacidade e DMCA com conteudo completo

### Monetizacao

- **Google AdSense** — Integracao real com AdSense configuravel via env vars (fallback para placeholder quando nao configurado)
- **Banner Topo (728x90)** — Fixo no header, visivel apenas em desktop
- **Native Ads** — Anuncios entre as fileiras de series na Home
- **Banner Lateral (300x600)** — Sidebar na pagina da serie (desktop)
- **Download Timer** — Botao de download com timer de 10 segundos e anuncio 300x250 durante a espera
- **Anti-AdBlock** — Deteccao de bloqueadores com modal persistente

### Painel Administrativo (`/admin`)

- **Login** — Autenticacao via Supabase Auth com verificacao de role admin
- **Dashboard** — Estatisticas (total de series, episodios e destaques) e listagem completa
- **CRUD de Series** — Titulo, slug (auto-gerado), sinopse, ano, genero, nota, categoria e destaque
- **Upload de Imagens** — Upload direto para Supabase Storage ou via URL externa
- **Gestao de Temporadas** — Adicionar/remover temporadas com nome editavel e accordion
- **Gestao de Episodios** — Numero, titulo, URL de download, tamanho do arquivo e qualidade (480p-4K)
- **Upsert Inteligente** — Ao editar, atualiza registros existentes (preservando IDs) em vez de deletar e recriar

### SEO e Performance

- **SEO Dinamico** — Meta tags (OG:Image, Title, Description) geradas automaticamente para cada serie
- **Sitemap.xml** — Gerado dinamicamente com todas as series do banco
- **robots.txt** — Gerado via App Router, bloqueia `/admin/` e `/api/`
- **Favicon** — SVG com gradiente gerado automaticamente
- **Otimizacao de Imagens** — Formato WebP via Next.js Image, lazy loading e sizes responsivos
- **SSR/SSG** — Paginas renderizadas no servidor para SEO e performance

### Seguranca

- **Roles de Admin** — Tabela `admin_users` + funcao `is_admin()` no PostgreSQL; apenas admins registrados podem acessar o painel e modificar dados
- **RLS (Row Level Security)** — Leitura publica, escrita restrita a admins via `is_admin()`
- **Cloudflare Turnstile** — Verificacao anti-bot antes de liberar o link de download (obrigatorio em producao)
- **Validacao de Env** — Build falha se variaveis obrigatorias nao estiverem configuradas
- **Hostnames Restritos** — Next.js Image aceita apenas imagens de `*.supabase.co` e `*.supabase.in`
- **Clarity Sanitizado** — ID do Microsoft Clarity validado com regex antes de injetar no DOM
- **Microsoft Clarity** — Heatmap e rastreamento de comportamento

---

## Stack Tecnologica

| Camada       | Tecnologia                               | Versao |
| ------------ | ---------------------------------------- | ------ |
| Framework    | Next.js (App Router)                     | 14.2   |
| Linguagem    | TypeScript                               | 5.5+   |
| Estilizacao  | Tailwind CSS                             | 3.4    |
| Animacoes    | Framer Motion                            | 11.3   |
| Icones       | Lucide React                             | 0.400  |
| Backend/Auth | Supabase (PostgreSQL + Auth + Storage)   | 2.45   |
| Anti-bot     | Cloudflare Turnstile                     | -      |
| Analytics    | Microsoft Clarity                        | -      |
| Anuncios     | Google AdSense                           | -      |
| CI/CD        | GitHub Actions                           | -      |
| Hospedagem   | Vercel                                   | -      |

---

## Estrutura do Projeto

```text
src/
├── app/
│   ├── layout.tsx                 # Layout global (Header, Footer, scripts)
│   ├── page.tsx                   # Home (Hero + Categorias + Lancamentos)
│   ├── loading.tsx                # Loading spinner global
│   ├── not-found.tsx              # Pagina 404
│   ├── globals.css                # Estilos globais e tema dark
│   ├── robots.ts                  # robots.txt dinamico
│   ├── sitemap.ts                 # sitemap.xml dinamico
│   ├── serie/[slug]/page.tsx      # Pagina da serie (SEO dinamico)
│   ├── termos/page.tsx            # Termos de Uso
│   ├── privacidade/page.tsx       # Politica de Privacidade
│   ├── dmca/page.tsx              # DMCA
│   ├── admin/
│   │   ├── layout.tsx             # Layout admin (noindex)
│   │   ├── page.tsx               # Dashboard admin (requer admin)
│   │   ├── login/page.tsx         # Login admin
│   │   ├── series/new/page.tsx    # Criar serie (requer admin)
│   │   └── series/[id]/edit/page.tsx # Editar serie (requer admin)
│   └── api/
│       └── verify-turnstile/route.ts # API de verificacao Turnstile
├── components/
│   ├── ui/
│   │   ├── Header.tsx             # Header fixo com busca e navegacao
│   │   ├── Footer.tsx             # Footer com links legais
│   │   ├── HeroCarousel.tsx       # Carrossel hero com auto-play
│   │   ├── SeriesCard.tsx         # Card de serie com hover animado
│   │   ├── CategoryRow.tsx        # Linha horizontal de cards por categoria
│   │   ├── SeriesDetail.tsx       # Pagina completa da serie
│   │   ├── ClarityScript.tsx      # Integracao Microsoft Clarity (sanitizado)
│   │   └── TurnstileScript.tsx    # Loader do Cloudflare Turnstile
│   ├── ads/
│   │   ├── AdBlockDetector.tsx    # Modal anti-adblock
│   │   ├── AdSenseScript.tsx      # Loader do Google AdSense
│   │   ├── AdSlot.tsx             # Componente de anuncio (AdSense ou placeholder)
│   │   ├── NativeAd.tsx           # Anuncio nativo entre cards
│   │   └── DownloadTimer.tsx      # Timer 10s + Turnstile + anuncio + download
│   └── admin/
│       ├── AdminDashboard.tsx     # Dashboard com stats e listagem
│       └── SeriesForm.tsx         # Formulario CRUD com upsert inteligente
├── lib/
│   ├── env.ts                     # Validacao de variaveis de ambiente
│   ├── site-config.ts             # Configuracao white-label do site
│   ├── brand.ts                   # Helper para split do nome no logo
│   └── supabase/
│       ├── client.ts              # Cliente Supabase (browser)
│       ├── server.ts              # Cliente Supabase (server/SSR)
│       ├── admin.ts               # Helper requireAdmin() com verificacao de role
│       └── schema.sql             # Schema SQL completo do banco
├── types/
│   └── database.ts                # Tipos TypeScript (Series, Season, Episode)
└── middleware.ts                   # Refresh de sessao Supabase
```

---

## Configuracao Rapida

### Pre-requisitos

| Software | Versao minima            | Download                              |
| -------- | ------------------------ | ------------------------------------- |
| Node.js  | 18 (recomendado 20 LTS) | [nodejs.org](https://nodejs.org)      |
| npm      | 9+ (vem com Node.js)    | -                                     |
| Git      | 2.x                     | [git-scm.com](https://git-scm.com)   |

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
1. Deve aparecer "Success. No rows returned."

### 5. Criar usuario admin

1. Va em **Authentication** > **Users** > **Add user** > **Create new user**
1. Preencha email e senha, marque **Auto Confirm User**
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
npm run dev
```

Acesse:

- **Site**: `http://localhost:3000`
- **Admin**: `http://localhost:3000/admin` (use o email/senha criados no passo 5)

---

## Variaveis de Ambiente

### Obrigatorias

| Variavel                         | Descricao               | Onde obter                                   |
| -------------------------------- | ----------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | URL do projeto Supabase | Supabase > Settings > API > Project URL      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Chave publica anon      | Supabase > Settings > API > anon public      |

> O build **falha** se essas variaveis nao estiverem configuradas.

### Opcionais — Funcionalidade

| Variavel                              | Descricao                                            | Padrao                            |
| ------------------------------------- | ---------------------------------------------------- | --------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY`           | Chave service_role (operacoes privilegiadas)          | -                                 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`      | Site key do Cloudflare Turnstile                     | - (skip no dev, erro 503 em prod) |
| `TURNSTILE_SECRET_KEY`               | Secret key do Turnstile                              | -                                 |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID`      | ID do projeto Microsoft Clarity                      | -                                 |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID`       | Client ID do Google AdSense (`ca-pub-xxx`)           | - (mostra placeholder)            |
| `NEXT_PUBLIC_ADSENSE_SLOT_ID`         | Slot ID do anuncio padrao                            | -                                 |
| `NEXT_PUBLIC_ADSENSE_NATIVE_SLOT_ID`  | Slot ID do anuncio nativo (entre cards)              | -                                 |

### Opcionais — White-Label

| Variavel                       | Descricao                    | Padrao                                              |
| ------------------------------ | ---------------------------- | --------------------------------------------------- |
| `NEXT_PUBLIC_SITE_NAME`        | Nome do site                 | `DownDoor`                                          |
| `NEXT_PUBLIC_SITE_TAGLINE`     | Tagline/subtitulo            | `Seu Portal para Videos e Downloads Gratuitos`      |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | Descricao para SEO           | `Portal premium para streaming...`                  |
| `NEXT_PUBLIC_SITE_URL`         | URL publica (para sitemap)   | `https://example.com`                               |
| `NEXT_PUBLIC_CONTACT_EMAIL`    | Email exibido na pagina DMCA | `contato@exemplo.com`                               |

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
│ poster_url    │       │ created_at   │       │ download_url │
│ backdrop_url  │       └──────────────┘       │ file_size    │
│ year          │                               │ quality      │
│ genre         │                               │ created_at   │
│ rating        │                               └──────────────┘
│ category      │
│ featured      │
│ created_at    │
│ updated_at    │
└──────────────┘
```

### Politicas RLS

| Tabela                    | SELECT                   | INSERT/UPDATE/DELETE  |
| ------------------------- | ------------------------ | -------------------- |
| `series`                  | Publico                  | Apenas `is_admin()`  |
| `seasons`                 | Publico                  | Apenas `is_admin()`  |
| `episodes`                | Publico                  | Apenas `is_admin()`  |
| `admin_users`             | Apenas o proprio admin   | -                    |
| `storage.objects` (media) | Publico                  | Apenas `is_admin()`  |

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

| NEXT_PUBLIC_SITE_NAME | Resultado              |
| --------------------- | ---------------------- |
| `DownDoor`            | **Down** + *Door*      |
| `MegaFlix`            | **Mega** + *Flix*      |
| `StreamHub`           | **Stre** + *amHub*     |

---

## Monetizacao (Anuncios)

### Google AdSense

Configure as 3 variaveis para ativar anuncios reais:

```ini
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-1234567890
NEXT_PUBLIC_ADSENSE_SLOT_ID=1234567890
NEXT_PUBLIC_ADSENSE_NATIVE_SLOT_ID=0987654321
```

Sem configurar, os espacos de anuncio mostram placeholders visuais.

### Espacos de Anuncio

| Local              | Tamanho       | Componente | Visibilidade |
| ------------------ | ------------- | ---------- | ------------ |
| Header             | 728x90        | `AdSlot`   | Desktop      |
| Home (entre cards) | Nativo/Fluid  | `NativeAd` | Todos        |
| Serie (sidebar)    | 300x600       | `AdSlot`   | Desktop      |
| Modal de download  | 300x250       | `AdSlot`   | Todos        |

### Outras Redes

Para usar outra rede (PropellerAds, etc.), modifique os componentes em `src/components/ads/`.

---

## Seguranca

### Checklist de Producao

- [ ] Variavel `TURNSTILE_SECRET_KEY` configurada (obrigatoria em prod — retorna erro 503 sem ela)
- [ ] Variavel `NEXT_PUBLIC_TURNSTILE_SITE_KEY` configurada
- [ ] Usuario admin criado e registrado na tabela `admin_users`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada (nunca no frontend)
- [ ] Dominio adicionado ao Cloudflare Turnstile
- [ ] `NEXT_PUBLIC_SITE_URL` definida com o dominio real (para sitemap)
- [ ] Se usar imagens de CDN externo, adicionar hostname em `next.config.mjs`

### Fluxo de Autenticacao Admin

```text
Browser → /admin → Server verifica auth.getUser()
                  → Server verifica admin_users.id == user.id
                  → Se nao: redirect /admin/login
                  → Se sim: renderiza dashboard
```

---

## SEO

### Gerado Automaticamente

| Recurso        | Rota            | Descricao                                        |
| -------------- | --------------- | ------------------------------------------------ |
| `robots.txt`   | `/robots.txt`   | Permite `/`, bloqueia `/admin/` e `/api/`        |
| `sitemap.xml`  | `/sitemap.xml`  | Paginas estaticas + todas as series do banco     |
| Favicon        | `/favicon.svg`  | SVG com gradiente e inicial do nome do site      |
| Meta OG        | Cada pagina     | Title, description, og:image para cada serie     |

### SEO por Serie

Cada pagina `/serie/[slug]` gera automaticamente:

- Title com o nome da serie
- Meta description com a sinopse
- og:image com o backdrop ou poster
- og:type como `video.tv_show`

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

Roda em **pull requests**:

- Faz build e deploy preview no Vercel
- Comenta na PR com a URL de preview
- So roda se `VERCEL_PROJECT_ID` estiver configurado

### 3. Deploy Production (deploy-production.yml)

Roda em **push para main/master** (apos CI passar):

- Faz build e deploy de producao no Vercel
- So roda se `VERCEL_PROJECT_ID` estiver configurado

### Configurar Vercel no GitHub Actions

1. Instale o Vercel CLI: `npm i -g vercel`
1. Rode `vercel link` na raiz do projeto para vincular
1. No GitHub, va em **Settings** > **Secrets and variables** > **Actions**
1. Adicione os seguintes **secrets**:

| Secret           | Onde obter                                                         |
| ---------------- | ------------------------------------------------------------------ |
| `VERCEL_TOKEN`   | [vercel.com/account/tokens](https://vercel.com/account/tokens)     |
| `VERCEL_ORG_ID`  | Arquivo `.vercel/project.json` apos `vercel link`                  |

1. Adicione a seguinte **variable** (nao secret):

| Variable            | Onde obter                                        |
| ------------------- | ------------------------------------------------- |
| `VERCEL_PROJECT_ID` | Arquivo `.vercel/project.json` apos `vercel link` |

1. Configure as env vars do Supabase no painel do Vercel em **Settings** > **Environment Variables** — adicione todas as variaveis do `.env.local`

> Se nao configurar `VERCEL_PROJECT_ID`, os workflows de deploy sao silenciosamente ignorados e apenas o CI (lint + build) roda.

---

## Deploy em Producao

### Opcao 1 — Vercel (Recomendado)

1. Acesse [vercel.com](https://vercel.com) e faca login com GitHub
1. Clique em **Add New... > Project**
1. Selecione o repositorio `SiteWhiteLabelDownload`
1. Em **Environment Variables**, adicione:

| Variavel                         | Valor                                       |
| -------------------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | sua URL do Supabase                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | sua anon key                                |
| `SUPABASE_SERVICE_ROLE_KEY`      | sua service role key                        |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | sua site key                                |
| `TURNSTILE_SECRET_KEY`           | sua secret key                              |
| `NEXT_PUBLIC_SITE_URL`           | URL final do site (ex: `https://meusite.com`) |

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

| Comando            | Descricao                                      |
| ------------------ | ---------------------------------------------- |
| `npm run dev`      | Servidor de desenvolvimento (localhost:3000)    |
| `npm run build`    | Compilar para producao                         |
| `npm start`        | Iniciar servidor de producao (apos build)      |
| `npm run lint`     | Verificar erros de codigo com ESLint           |
| `npx tsc --noEmit` | Verificar tipos TypeScript sem compilar        |

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
  Framer Motion        Middleware            RLS Policies
  Tailwind CSS      Session Refresh         is_admin()
  AdSense/Clarity    Turnstile API          Storage (media)
```

### Paginas Server vs Client

| Tipo                 | Paginas                                                                       | Motivo                              |
| -------------------- | ----------------------------------------------------------------------------- | ----------------------------------- |
| **Server Component** | Home, Serie, Admin (page), Termos, Privacidade, DMCA                          | Fetch de dados no servidor, SEO     |
| **Client Component** | Header, Footer, HeroCarousel, SeriesDetail, SeriesForm, AdminDashboard, Ads   | Interatividade, estado, animacoes   |

### Middleware

O `middleware.ts` roda em todas as rotas (exceto assets estaticos) e faz refresh da sessao Supabase para manter o usuario logado.

---

## Solucao de Problemas

### Missing required environment variables

O build falha se `NEXT_PUBLIC_SUPABASE_URL` ou `NEXT_PUBLIC_SUPABASE_ANON_KEY` nao estiverem definidas. Verifique seu `.env.local`.

### O site abre mas aparece em branco

- Verifique se o `.env.local` foi criado (nao e `.env.local.example`)
- Verifique se as chaves do Supabase estao corretas (sem espacos extras)
- Reinicie o servidor (`Ctrl+C` e `npm run dev`)

### Nao consigo fazer login no admin

- Verifique se criou o usuario no Supabase Auth e marcou "Auto Confirm User"
- Verifique se inseriu o UUID na tabela `admin_users` (passo 5 da configuracao)
- O email e senha devem ser os mesmos do Supabase Auth

### As series nao aparecem na Home

- Faca login no admin e cadastre pelo menos uma serie
- Marque a serie como "Destaque" para aparecer no carrossel

### Imagens nao carregam

- Por seguranca, apenas imagens de `*.supabase.co` e `*.supabase.in` sao permitidas
- Para usar outro CDN, adicione o hostname em `next.config.mjs` > `remotePatterns`

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
