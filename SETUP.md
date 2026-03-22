# Guia Rapido de Configuracao para Teste Local

## Pre-requisitos

- Node.js 18+ (recomendado 20 LTS)
- npm 9+
- Conta no [Supabase](https://supabase.com) (gratuito)

## Passo 1 — Criar projeto no Supabase

1. Acesse https://app.supabase.com
2. Clique em **New Project**
3. Preencha nome, senha do banco e regiao (South America se disponivel)
4. Aguarde a criacao (~2 min)

## Passo 2 — Executar o schema SQL

1. No painel Supabase, va em **SQL Editor** > **New query**
2. Cole o conteudo de `src/lib/supabase/schema.sql`
3. Clique em **Run**
4. Deve aparecer "Success. No rows returned."

## Passo 3 — Criar usuario admin

1. Va em **Authentication** > **Users** > **Add user** > **Create new user**
2. Preencha email e senha, marque **Auto Confirm User**
3. Clique em **Create user**
4. Copie o **UUID** do usuario criado (coluna `id`)
5. Va em **SQL Editor** e execute:

```sql
INSERT INTO admin_users (id, email) VALUES ('COLE_O_UUID_AQUI', 'seu-email@exemplo.com');
```

## Passo 4 — Pegar as chaves

1. Va em **Project Settings** > **API**
2. Copie:
   - **Project URL** (`https://xxx.supabase.co`)
   - **anon public** key (`eyJ...`)

## Passo 5 — Criar .env.local

```bash
cp .env.local.example .env.local
```

Edite o `.env.local` e preencha as duas variaveis obrigatorias:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Passo 6 — Rodar

```bash
npm install
npm run dev
```

Acesse http://localhost:3000 (site) e http://localhost:3000/admin (painel admin).

## Variaveis Opcionais

| Variavel | Para que serve | Onde obter |
|----------|---------------|------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Operacoes server-side privilegiadas | Supabase > Settings > API > service_role |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Anti-bot nos downloads | https://dash.cloudflare.com > Turnstile |
| `TURNSTILE_SECRET_KEY` | Verificacao server-side do Turnstile | Mesmo local acima |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Heatmap/analytics | https://clarity.microsoft.com |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Anuncios Google | https://adsense.google.com |
| `NEXT_PUBLIC_ADSENSE_SLOT_ID` | Slot de anuncio padrao | AdSense > Anuncios > Obter codigo |
| `NEXT_PUBLIC_ADSENSE_NATIVE_SLOT_ID` | Slot de anuncio nativo (entre cards) | Mesmo local acima |
| `NEXT_PUBLIC_SITE_NAME` | Nome do site (white-label) | Livre |
| `NEXT_PUBLIC_SITE_TAGLINE` | Tagline do site | Livre |
| `NEXT_PUBLIC_SITE_URL` | URL publica (para sitemap) | Seu dominio |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Email exibido na pagina DMCA | Livre |
