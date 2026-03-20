# DownDoor

**Seu Portal para Vídeos e Downloads Gratuitos**

Plataforma de streaming e download de vídeos de alta performance, focada em conversão de anúncios e experiência premium. Design Dark Mode inspirado em Apple TV+ / Netflix.

---

## Funcionalidades

### Interface Pública

- **Hero Carousel** — Carrossel automático de séries em destaque com transições suaves (Framer Motion), backdrop em tela cheia com gradiente e botões de navegação
- **Grids por Categoria** — Séries organizadas por categoria com scroll horizontal, botões de navegação e efeitos de hover com zoom
- **Live Search** — Busca inteligente em tempo real no header com debounce de 300ms, resultados com poster e metadados
- **Página da Série** — Backdrop imersivo em tela cheia, poster, sinopse, metadados (ano, gênero, nota), abas de temporadas e lista de episódios
- **Design Responsivo** — Mobile-First com breakpoints para sm, md e lg
- **Micro-animações** — Fade-in de cards, transições de página e hover effects via Framer Motion

### Monetização e Ad-Placement

- **Banner Topo (728x90)** — Fixo no header, visível apenas em desktop
- **Native Ads** — Anúncios camuflados entre as fileiras de séries na Home
- **Banner Lateral (300x600)** — Sidebar na página da série (desktop)
- **Download Timer** — Botão de download com timer de 10 segundos e anúncio 300x250 durante a espera
- **Anti-AdBlock** — Detecção de bloqueadores de anúncios com modal persistente que impede o uso do site

### Painel Administrativo (`/admin`)

- **Login** — Autenticação via Supabase Auth com proteção por sessão
- **Dashboard** — Estatísticas (total de séries, episódios e destaques) e listagem completa
- **CRUD de Séries** — Título, slug (auto-gerado), sinopse, ano, gênero, nota, categoria e destaque
- **Upload de Imagens** — Upload de poster e backdrop direto para Supabase Storage ou via URL externa
- **Gestão de Temporadas** — Adicionar/remover temporadas com nome editável e accordion expansível
- **Gestão de Episódios** — Número, título, URL de download, tamanho do arquivo e qualidade (480p–4K)

### SEO e Performance

- **SEO Dinâmico** — Meta tags (OG:Image, Title, Description) geradas automaticamente para cada série
- **Otimização de Imagens** — Formato WebP via Next.js Image, lazy loading e sizes responsivos
- **SSR/SSG** — Páginas renderizadas no servidor para SEO e performance

### Segurança e Analytics

- **Cloudflare Turnstile** — Verificação anti-bot antes de liberar o link de download
- **Microsoft Clarity** — Heatmap e rastreamento de comportamento do usuário
- **RLS (Row Level Security)** — Leitura pública, escrita restrita a usuários autenticados

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS 3.4 |
| Animações | Framer Motion |
| Ícones | Lucide React |
| Backend/Auth | Supabase (PostgreSQL + Auth + Storage) |
| Anti-bot | Cloudflare Turnstile |
| Analytics | Microsoft Clarity |

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── layout.tsx              # Layout global (Header, Footer, AdBlock, Clarity, Turnstile)
│   ├── page.tsx                # Home (Hero + Categorias + Lançamentos)
│   ├── loading.tsx             # Loading spinner global
│   ├── not-found.tsx           # Página 404
│   ├── globals.css             # Estilos globais e tema dark
│   ├── serie/[slug]/page.tsx   # Página da série (SEO dinâmico)
│   ├── admin/
│   │   ├── layout.tsx          # Layout admin (noindex)
│   │   ├── page.tsx            # Dashboard admin
│   │   ├── login/page.tsx      # Login admin
│   │   ├── series/new/page.tsx # Criar série
│   │   └── series/[id]/edit/page.tsx # Editar série
│   └── api/
│       └── verify-turnstile/route.ts # API de verificação Turnstile
├── components/
│   ├── ui/
│   │   ├── Header.tsx          # Header fixo com busca e navegação
│   │   ├── Footer.tsx          # Footer com links
│   │   ├── HeroCarousel.tsx    # Carrossel hero com auto-play
│   │   ├── SeriesCard.tsx      # Card de série com hover animado
│   │   ├── CategoryRow.tsx     # Linha horizontal de cards por categoria
│   │   ├── SeriesDetail.tsx    # Página completa da série
│   │   ├── ClarityScript.tsx   # Integração Microsoft Clarity
│   │   └── TurnstileScript.tsx # Loader do Cloudflare Turnstile
│   ├── ads/
│   │   ├── AdBlockDetector.tsx # Modal anti-adblock
│   │   ├── AdSlot.tsx          # Componente genérico de espaço de anúncio
│   │   ├── NativeAd.tsx        # Anúncio nativo entre cards
│   │   └── DownloadTimer.tsx   # Timer 10s + Turnstile + download
│   └── admin/
│       ├── AdminDashboard.tsx  # Dashboard com stats e listagem
│       └── SeriesForm.tsx      # Formulário CRUD completo
├── lib/
│   └── supabase/
│       ├── client.ts           # Cliente Supabase (browser)
│       ├── server.ts           # Cliente Supabase (server/SSR)
│       └── schema.sql          # Schema SQL completo do banco
├── types/
│   └── database.ts             # Tipos TypeScript (Series, Season, Episode)
└── middleware.ts                # Refresh de sessão Supabase
```

---

## Passo a Passo — Instalação

### 1. Pré-requisitos

- Node.js 18+ instalado
- Conta no [Supabase](https://supabase.com) (gratuita)
- (Opcional) Conta no [Cloudflare](https://dash.cloudflare.com) para Turnstile
- (Opcional) Conta no [Microsoft Clarity](https://clarity.microsoft.com)

### 2. Clonar o repositório

```bash
git clone https://github.com/rodolfot/SiteWhiteLabelDownload.git
cd SiteWhiteLabelDownload
```

### 3. Instalar dependências

```bash
npm install
```

### 4. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite o `.env.local` com suas credenciais:

```env
# Supabase (obrigatório)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Cloudflare Turnstile (opcional)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=sua-site-key
TURNSTILE_SECRET_KEY=sua-secret-key

# Microsoft Clarity (opcional)
NEXT_PUBLIC_CLARITY_PROJECT_ID=seu-clarity-id
```

### 5. Configurar o banco de dados

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Crie um novo projeto
3. Vá em **SQL Editor**
4. Cole e execute o conteúdo de `src/lib/supabase/schema.sql`

Isso criará:
- Tabelas: `series`, `seasons`, `episodes`
- Índices de performance
- Trigger de `updated_at` automático
- Políticas RLS (leitura pública, escrita autenticada)
- Bucket de storage `media` para imagens

### 6. Criar usuário admin

No Supabase Dashboard:
1. Vá em **Authentication > Users**
2. Clique em **Add User > Create New User**
3. Defina email e senha para o admin

### 7. Rodar o projeto

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

Acesse:
- **Site público:** http://localhost:3000
- **Painel admin:** http://localhost:3000/admin

### 8. (Opcional) Configurar Cloudflare Turnstile

1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Vá em **Turnstile > Add Site**
3. Copie a **Site Key** e **Secret Key** para o `.env.local`

### 9. (Opcional) Configurar Microsoft Clarity

1. Acesse [clarity.microsoft.com](https://clarity.microsoft.com)
2. Crie um novo projeto
3. Copie o **Project ID** para o `.env.local`

---

## Estrutura do Banco de Dados

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│  series   │──1:N──│ seasons  │──1:N──│ episodes │
└──────────┘       └──────────┘       └──────────┘
│ id (UUID)        │ id (UUID)        │ id (UUID)
│ title            │ series_id (FK)   │ season_id (FK)
│ slug (unique)    │ number           │ number
│ synopsis         │ title            │ title
│ poster_url       │ created_at       │ download_url
│ backdrop_url     └──────────┘       │ file_size
│ year                                │ quality
│ genre                               │ created_at
│ rating                              └──────────┘
│ category
│ featured
│ created_at
│ updated_at
└──────────┘
```

---

## Espaços de Anúncios

| Local | Tamanho | Componente |
|-------|---------|-----------|
| Header (desktop) | 728x90 | Inline no `Header.tsx` |
| Home (entre cards) | Native | `NativeAd.tsx` |
| Série (sidebar desktop) | 300x600 | `AdSlot.tsx` |
| Modal de download | 300x250 | Inline no `DownloadTimer.tsx` |

Para integrar sua rede de anúncios, substitua os placeholders nos componentes de anúncio pelo script da sua rede (Google AdSense, PropellerAds, etc.).

---

## Deploy

### Vercel (recomendado)

1. Faça push do projeto para o GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. Configure as variáveis de ambiente no dashboard da Vercel
4. Deploy automático a cada push

### Outros

O projeto é compatível com qualquer plataforma que suporte Next.js: Netlify, Railway, Docker, etc.

---

## Licença

Projeto proprietário. Todos os direitos reservados.
