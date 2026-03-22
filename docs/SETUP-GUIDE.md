# Guia de Configuracao — Servicos Externos

Passo a passo para configurar os servicos que dependem de contas externas.

---

## 1. Sentry (Error Tracking)

### Criar conta e projeto

1. Acesse [sentry.io](https://sentry.io) e crie uma conta (plano gratuito disponivel)
2. Clique em **Create Project**
3. Escolha a plataforma **Next.js**
4. Anote os valores:
   - **DSN** — algo como `https://abc123@o123456.ingest.sentry.io/789`
   - **Organization slug** — visivel na URL do dashboard (ex: `minha-org`)
   - **Project slug** — o nome do projeto (ex: `downdoor`)

### Configurar no projeto

Adicione ao `.env.local`:

```ini
NEXT_PUBLIC_SENTRY_DSN=https://SEU_DSN_AQUI@o123456.ingest.sentry.io/789
SENTRY_ORG=sua-organizacao
SENTRY_PROJECT=seu-projeto
```

### Configurar no deploy (Vercel)

1. No painel Vercel, va em **Settings** > **Environment Variables**
2. Adicione as mesmas 3 variaveis acima
3. Adicione tambem (para upload de source maps no CI):

```
SENTRY_AUTH_TOKEN=sntrys_SEU_TOKEN_AQUI
```

> Para gerar o token: Sentry > Settings > Auth Tokens > Create New Token (escopo: `project:releases`, `org:read`)

### Verificar

Apos configurar, qualquer erro no client/server/edge sera capturado automaticamente. Verifique em Sentry > Issues.

---

## 2. Google Analytics 4 (GA4)

### Criar propriedade

1. Acesse [analytics.google.com](https://analytics.google.com)
2. Clique em **Admin** (engrenagem) > **Create Property**
3. Preencha nome, fuso horario e moeda
4. Crie um **Web Data Stream**:
   - URL do site: `https://seu-dominio.com`
   - Nome: `DownDoor Web`
5. Copie o **Measurement ID** (formato: `G-XXXXXXXXXX`)

### Configurar no projeto

Adicione ao `.env.local`:

```ini
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Configurar no deploy (Vercel)

Adicione a mesma variavel em **Settings** > **Environment Variables**.

### O que e rastreado automaticamente

- **Page views** — cada navegacao (exceto rotas `/admin/*`)
- **Web Vitals** — CLS, INP, LCP, FCP, TTFB como eventos personalizados
- **Categoria de evento** — `Web Vitals` para metricas de performance

### Verificar

1. Apos configurar, acesse o site e navegue por algumas paginas
2. No GA4, va em **Realtime** — voce deve ver os page views
3. Web Vitals aparecem em **Reports** > **Events** > filtrar por `CLS`, `INP`, `LCP`

---

## 3. Deploy (Vercel)

### Passo a passo

1. Acesse [vercel.com](https://vercel.com) e faca login com GitHub
2. Clique em **Add New... > Project**
3. Selecione o repositorio `SiteWhiteLabelDownload`
4. Em **Environment Variables**, adicione TODAS as variaveis do `.env.local`:

| Variavel | Obrigatoria | Descricao |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave anon publica |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | Chave service role (nunca expor no frontend) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Sim (prod) | Cloudflare Turnstile site key |
| `TURNSTILE_SECRET_KEY` | Sim (prod) | Cloudflare Turnstile secret |
| `NEXT_PUBLIC_SITE_URL` | Sim | URL final do site (ex: `https://downdoor.com`) |
| `NEXT_PUBLIC_SITE_NAME` | Nao | Nome customizado (padrao: DownDoor) |
| `NEXT_PUBLIC_SENTRY_DSN` | Nao | DSN do Sentry |
| `SENTRY_ORG` | Nao | Org do Sentry |
| `SENTRY_PROJECT` | Nao | Projeto do Sentry |
| `SENTRY_AUTH_TOKEN` | Nao | Token para source maps |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Nao | ID do Google Analytics |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Nao | ID do Microsoft Clarity |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Nao | Client ID do AdSense |
| `NEXT_PUBLIC_ADSENSE_SLOT_*` | Nao | Slot IDs do AdSense |

5. Clique em **Deploy**
6. Apos ~2 min, o site estara em `https://seu-projeto.vercel.app`

### Dominio customizado

1. No Vercel, va em **Settings** > **Domains**
2. Adicione seu dominio (ex: `downdoor.com`)
3. Configure o DNS no seu registrador:
   - **Tipo A**: `76.76.21.21`
   - **Tipo CNAME** (www): `cname.vercel-dns.com`
4. Aguarde propagacao DNS (ate 48h, geralmente minutos)
5. O Vercel gera certificado HTTPS automaticamente (Let's Encrypt)

### Apos o deploy

1. Atualize `NEXT_PUBLIC_SITE_URL` com o dominio real
2. No Supabase > Authentication > URL Configuration:
   - Adicione o dominio nas **Redirect URLs** (ex: `https://downdoor.com/**`)
   - Remova `localhost:3002` se nao precisar mais de dev
3. No Cloudflare Turnstile:
   - Adicione o dominio na lista de sites permitidos

---

## 4. Dominio + HTTPS

### Registrar dominio

Opcoes populares:
- [Namecheap](https://namecheap.com) — a partir de ~$8/ano
- [Cloudflare Registrar](https://dash.cloudflare.com) — preco de custo
- [Google Domains](https://domains.google) (agora Squarespace)

### Configurar no projeto

Apos ter o dominio e deploy funcionando:

```ini
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
```

Isso afeta:
- **sitemap.xml** — URLs absolutas das paginas
- **JSON-LD** — URL canonica da serie
- **Meta OG** — URL nas meta tags

### Configurar HTTPS

- **Vercel**: automatico (Let's Encrypt)
- **Self-hosted**: use Caddy (HTTPS automatico) ou Nginx + certbot

---

## 5. CDN para Imagens

### Quando configurar

- O Next.js Image ja faz otimizacao automatica (AVIF/WebP, resize, cache 30 dias)
- CDN externo so e necessario se:
  - Voce tem milhares de imagens
  - O trafego ultrapassar os limites do Vercel (1000 otimizacoes/mes no plano gratuito)
  - Quer servir imagens de um dominio separado

### Opcoes

1. **Cloudflare Images** — $5/mes por 100k imagens
2. **imgix** — transformacao de imagens on-the-fly
3. **Supabase Storage CDN** — ja incluido no plano (via Supabase edge network)

### Configurar

Se usar CDN externo, adicione o hostname em `next.config.mjs`:

```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '*.supabase.co' },
    { protocol: 'https', hostname: 'cdn.seudominio.com' }, // adicionar
  ],
}
```

---

## Checklist Final de Producao

- [ ] `.env.local` com todas as variaveis preenchidas
- [ ] Deploy funcionando (Vercel ou self-hosted)
- [ ] Dominio configurado com HTTPS
- [ ] `NEXT_PUBLIC_SITE_URL` com dominio real
- [ ] Sentry configurado e recebendo eventos
- [ ] GA4 configurado e rastreando page views
- [ ] Cloudflare Turnstile com dominio adicionado
- [ ] Supabase redirect URLs atualizadas com dominio
- [ ] AdSense aprovado para o dominio (se aplicavel)
- [ ] Testar: login admin, criar serie, download com Turnstile
- [ ] Verificar `npm audit` periodicamente
