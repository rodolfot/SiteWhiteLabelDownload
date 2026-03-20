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

## Guia Completo de Instalação do Zero (Windows)

> Este guia assume que sua máquina está limpa, sem nenhum programa de desenvolvimento instalado.
> Siga cada passo na ordem. Ao final, o site estará rodando na sua máquina.

---

### PARTE 1 — Instalando os Programas Necessários

---

#### Passo 1: Instalar o Visual Studio Code (Editor de Código)

O VS Code é o editor onde você vai abrir e editar os arquivos do projeto.

1. Abra o navegador e acesse: https://code.visualstudio.com
2. Clique no botão grande azul **"Download for Windows"**
3. Quando o download terminar, abra o arquivo `VSCodeUserSetup-x64-X.XX.X.exe`
4. Na tela de instalação:
   - Aceite os termos de licença e clique em **Próximo**
   - Na tela "Selecione Tarefas Adicionais", marque **todas** as opções:
     - `Adicionar ação "Abrir com Code" ao menu de contexto de arquivo`
     - `Adicionar ação "Abrir com Code" ao menu de contexto de diretório`
     - `Registrar Code como um editor para tipos de arquivo suportados`
     - `Adicionar ao PATH`
   - Clique em **Próximo** e depois **Instalar**
5. Ao finalizar, clique em **Concluir**

---

#### Passo 2: Instalar o Node.js (Motor JavaScript)

O Node.js é o que permite rodar JavaScript fora do navegador. Ele vem junto com o **npm**, que é o gerenciador de pacotes (como o Maven é para Java).

1. Abra o navegador e acesse: https://nodejs.org
2. Clique no botão **LTS** (versão recomendada) — é o botão da esquerda
3. Quando o download terminar, abra o arquivo `node-vXX.XX.X-x64.msi`
4. Na tela de instalação:
   - Clique em **Next** em todas as telas
   - Na tela "Tools for Native Modules", **NÃO marque** a checkbox (não precisa instalar Chocolatey)
   - Clique em **Next** e depois **Install**
   - Se pedir permissão de administrador, clique em **Sim**
5. Ao finalizar, clique em **Finish**

**Verificando a instalação:**

1. Pressione `Win + R`, digite `cmd` e pressione Enter
2. No prompt de comando que abrir, digite:

```
node --version
```

Deve aparecer algo como `v20.XX.X` ou `v22.XX.X`. Se aparecer, está instalado.

3. Digite também:

```
npm --version
```

Deve aparecer algo como `10.X.X`. Se aparecer, está tudo certo.

> **Se aparecer "não é reconhecido como comando":** Feche o prompt e abra novamente. Se ainda não funcionar, reinicie o computador e tente de novo.

---

#### Passo 3: Instalar o Git (Controle de Versão)

O Git é o programa que gerencia as versões do código e permite enviar/baixar o projeto do GitHub.

1. Abra o navegador e acesse: https://git-scm.com/download/win
2. O download deve iniciar automaticamente. Se não iniciar, clique em **"Click here to download manually"**
3. Quando o download terminar, abra o arquivo `Git-X.XX.X-64-bit.exe`
4. Na tela de instalação:
   - Clique em **Next** em **todas** as telas (as configurações padrão estão ótimas)
   - São cerca de 10 telas, apenas clique Next em todas
   - Na última, clique em **Install**
5. Ao finalizar, clique em **Finish**

**Verificando a instalação:**

1. Pressione `Win + R`, digite `cmd` e pressione Enter
2. Digite:

```
git --version
```

Deve aparecer algo como `git version 2.XX.X.windows.X`.

**Configurando seu nome e email no Git (obrigatório, faça apenas uma vez):**

Ainda no prompt de comando, digite os dois comandos abaixo (substituindo pelos seus dados):

```
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

> Use o **mesmo email** da sua conta do GitHub.

---

#### Passo 4: Criar uma conta no GitHub (se ainda não tem)

O GitHub é onde o código do projeto fica armazenado na nuvem.

1. Acesse: https://github.com
2. Clique em **Sign up**
3. Siga os passos: escolha um username, coloque seu email e crie uma senha
4. Confirme o email que o GitHub vai enviar para você

---

#### Passo 5: Criar uma conta no Supabase (Banco de Dados Gratuito)

O Supabase é o banco de dados do projeto. Ele guarda todas as séries, temporadas e episódios.

1. Acesse: https://supabase.com
2. Clique em **Start your project** (ou "Sign Up")
3. Clique em **Continue with GitHub** (mais fácil, usa a conta que você acabou de criar)
4. Autorize o Supabase a acessar sua conta do GitHub

---

### PARTE 2 — Baixando e Configurando o Projeto

---

#### Passo 6: Clonar (baixar) o projeto do GitHub

1. Abra o **Prompt de Comando** (Win + R → `cmd` → Enter)
2. Navegue até a pasta onde quer salvar o projeto. Por exemplo, para ir até Documentos:

```
cd %USERPROFILE%\Documents\Projetos
```

> Se a pasta `Projetos` não existir, crie antes:
> ```
> mkdir %USERPROFILE%\Documents\Projetos
> cd %USERPROFILE%\Documents\Projetos
> ```

3. Clone o repositório:

```
git clone https://github.com/rodolfot/SiteWhiteLabelDownload.git
```

4. Entre na pasta do projeto:

```
cd SiteWhiteLabelDownload
```

---

#### Passo 7: Instalar as dependências do projeto

Ainda no prompt de comando, dentro da pasta do projeto, execute:

```
npm install
```

Aguarde terminar (pode levar 1-3 minutos). Vai aparecer uma mensagem como `added XXX packages`.

> **Se der erro:** Feche o prompt, abra novamente, navegue até a pasta do projeto e tente `npm install` de novo.

---

#### Passo 8: Criar o banco de dados no Supabase

##### 8.1 — Criar um novo projeto

1. Acesse: https://app.supabase.com
2. Clique em **New Project**
3. Preencha:
   - **Name:** `downdoor` (ou o nome que quiser)
   - **Database Password:** Crie uma senha forte e **anote ela** (você vai precisar)
   - **Region:** Escolha `South America (São Paulo)` se disponível, ou a mais próxima
4. Clique em **Create new project**
5. Aguarde 1-2 minutos até o projeto ser criado

##### 8.2 — Executar o SQL para criar as tabelas

1. No painel do Supabase, clique em **SQL Editor** no menu lateral esquerdo
2. Clique em **New query**
3. Abra o arquivo `src/lib/supabase/schema.sql` do projeto (pode abrir no VS Code ou Bloco de Notas)
4. **Copie TODO o conteúdo** do arquivo
5. **Cole** no editor SQL do Supabase
6. Clique no botão **Run** (ou pressione `Ctrl + Enter`)
7. Deve aparecer a mensagem **Success. No rows returned** — isso é normal e significa que funcionou

##### 8.3 — Pegar as chaves de API

1. No painel do Supabase, clique em **Project Settings** (ícone de engrenagem no menu lateral)
2. Clique em **API** no submenu
3. Você verá:
   - **Project URL** — Copie este valor (algo como `https://xyzxyz.supabase.co`)
   - **anon public** — Copie este valor (é uma chave longa começando com `eyJ...`)
   - **service_role** — Clique em **Reveal** e copie este valor

> **IMPORTANTE:** A chave `service_role` é secreta. Nunca compartilhe ou coloque em código público.

##### 8.4 — Criar o usuário admin

1. No painel do Supabase, clique em **Authentication** no menu lateral
2. Clique na aba **Users**
3. Clique em **Add user** → **Create new user**
4. Preencha:
   - **Email:** seu email (ex: `admin@downdoor.com`)
   - **Password:** uma senha forte
   - Marque **Auto Confirm User**
5. Clique em **Create user**

> Este email e senha serão usados para fazer login no painel admin do site.

---

#### Passo 9: Configurar as variáveis de ambiente

1. Na pasta do projeto, localize o arquivo `.env.local.example`
2. **Copie** este arquivo e renomeie a cópia para `.env.local`

   No prompt de comando (dentro da pasta do projeto):
   ```
   copy .env.local.example .env.local
   ```

3. Abra o arquivo `.env.local` no VS Code ou Bloco de Notas
4. Substitua os valores com as chaves que você copiou do Supabase:

```env
# Supabase (obrigatório)
NEXT_PUBLIC_SUPABASE_URL=https://xyzxyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudflare Turnstile (deixe assim por enquanto, configure depois)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Microsoft Clarity (deixe assim por enquanto, configure depois)
NEXT_PUBLIC_CLARITY_PROJECT_ID=
```

5. **Salve** o arquivo (Ctrl + S)

> **IMPORTANTE:** O arquivo `.env.local` contém senhas. Ele **nunca** deve ser enviado para o GitHub. O `.gitignore` já está configurado para ignorar este arquivo.

---

#### Passo 10: Rodar o projeto

1. No prompt de comando, dentro da pasta do projeto, execute:

```
npm run dev
```

2. Aguarde aparecer a mensagem:

```
▲ Next.js 14.2.5
- Local:   http://localhost:3000
```

3. Abra o navegador e acesse: **http://localhost:3000**

Pronto! O site está rodando na sua máquina.

4. Para acessar o **painel admin**, vá em: **http://localhost:3000/admin**
   - Use o email e senha que você criou no Passo 8.4

> **Para parar o servidor:** Pressione `Ctrl + C` no prompt de comando.

---

### PARTE 3 — Configurações Opcionais

---

#### Passo 11: (Opcional) Configurar Microsoft Clarity (Mapa de Calor)

O Clarity mostra onde os usuários clicam e como navegam no seu site. É 100% gratuito.

1. Acesse: https://clarity.microsoft.com
2. Faça login com uma conta Microsoft (Hotmail, Outlook, etc.) ou crie uma
3. Clique em **+ New project**
4. Preencha:
   - **Name:** `DownDoor`
   - **Website URL:** a URL do seu site (pode ser `http://localhost:3000` para teste)
5. Clique em **Add**
6. Na tela seguinte, copie o **Project ID** (é um código alfanumérico tipo `j1k2l3m4n5`)
7. Abra o arquivo `.env.local` e preencha:

```env
NEXT_PUBLIC_CLARITY_PROJECT_ID=j1k2l3m4n5
```

8. Salve o arquivo e reinicie o servidor (`Ctrl + C` e `npm run dev` novamente)

---

#### Passo 12: (Opcional) Configurar Cloudflare Turnstile (Anti-Bot)

O Turnstile verifica se quem está baixando é uma pessoa real, não um robô. É gratuito.

1. Acesse: https://dash.cloudflare.com
2. Crie uma conta ou faça login
3. No menu lateral, clique em **Turnstile**
4. Clique em **Add site**
5. Preencha:
   - **Site name:** `DownDoor`
   - **Domain:** seu domínio (ex: `downdoor.com`) ou `localhost` para teste
   - **Widget Type:** Managed
6. Clique em **Create**
7. Copie a **Site Key** e a **Secret Key**
8. Abra o arquivo `.env.local` e preencha:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAxxxxxxxxxxxxxx
TURNSTILE_SECRET_KEY=0x4AAAAAAyyyyyyyyyyyyyy
```

9. Salve o arquivo e reinicie o servidor

---

### PARTE 4 — Abrindo o Projeto no VS Code

---

#### Passo 13: Abrir o projeto no VS Code

Existem duas formas:

**Forma 1 — Pelo explorador de arquivos:**
1. Abra a pasta `C:\Users\SeuUsuario\Documents\Projetos\SiteWhiteLabelDownload`
2. Clique com o botão direito em um espaço vazio
3. Clique em **"Abrir com Code"**

**Forma 2 — Pelo prompt de comando:**
1. No prompt de comando, dentro da pasta do projeto, digite:
```
code .
```

O VS Code abrirá com todos os arquivos do projeto no painel lateral.

---

#### Passo 14: Usar o Terminal integrado do VS Code

Em vez de usar o prompt de comando separado, você pode usar o terminal dentro do VS Code:

1. No VS Code, pressione `` Ctrl + ` `` (tecla acento grave, ao lado do 1)
2. O terminal aparecerá na parte de baixo
3. Aqui você pode executar todos os comandos: `npm run dev`, `npm install`, etc.

---

### PARTE 5 — Publicando o Site na Internet

---

#### Passo 15: Deploy no Vercel (Gratuito)

O Vercel é a plataforma criada pelos mesmos criadores do Next.js. O plano gratuito é excelente.

##### 15.1 — Criar conta no Vercel

1. Acesse: https://vercel.com
2. Clique em **Sign Up**
3. Clique em **Continue with GitHub** (usa a mesma conta)
4. Autorize o acesso

##### 15.2 — Importar o projeto

1. No dashboard do Vercel, clique em **Add New... → Project**
2. Selecione o repositório `SiteWhiteLabelDownload`
3. Clique em **Import**

##### 15.3 — Configurar variáveis de ambiente

1. Antes de fazer o deploy, clique em **Environment Variables**
2. Adicione cada variável, uma por uma:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | sua URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sua anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | sua service role key |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | sua site key (se tiver) |
| `TURNSTILE_SECRET_KEY` | sua secret key (se tiver) |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | seu project ID (se tiver) |

3. Clique em **Deploy**
4. Aguarde 1-2 minutos
5. Ao finalizar, o Vercel fornecerá uma URL como `https://seu-projeto.vercel.app`

Pronto! Seu site está no ar!

---

## Comandos Úteis (Referência Rápida)

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento (http://localhost:3000) |
| `npm run build` | Compila o projeto para produção |
| `npm start` | Inicia o servidor de produção (após o build) |
| `npm run lint` | Verifica erros de código |
| `git status` | Mostra arquivos modificados |
| `git add .` | Prepara todos os arquivos para commit |
| `git commit -m "mensagem"` | Salva as alterações com uma mensagem |
| `git push` | Envia as alterações para o GitHub |

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

## Solução de Problemas Comuns

### "node não é reconhecido como comando"
- Reinicie o computador após instalar o Node.js
- Se ainda não funcionar, reinstale o Node.js marcando a opção "Add to PATH"

### "npm install deu erro"
- Feche o VS Code e qualquer terminal aberto
- Abra um novo prompt de comando como **Administrador** (clique direito → "Executar como administrador")
- Navegue até a pasta e tente novamente

### "O site abre mas aparece em branco"
- Verifique se o arquivo `.env.local` foi criado corretamente
- Verifique se as chaves do Supabase estão corretas (sem espaços extras)
- Reinicie o servidor (`Ctrl + C` e `npm run dev`)

### "Não consigo fazer login no admin"
- Verifique se criou o usuário no Supabase (Passo 8.4)
- Verifique se marcou "Auto Confirm User" ao criar
- O email e senha devem ser os mesmos que você definiu no Supabase

### "As séries não aparecem na Home"
- Faça login no admin (`/admin`) e cadastre pelo menos uma série
- Marque a série como "Destaque" para aparecer no carrossel da Home

---

## Licença

Projeto proprietário. Todos os direitos reservados.
