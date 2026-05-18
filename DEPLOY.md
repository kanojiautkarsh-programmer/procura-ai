# Procura AI — Deploy Guide

## 1. Push to GitHub

Create a repo at https://github.com/new (name: `procura-ai`, private or public), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/procura-ai.git
git branch -M main
git push -u origin main
```

---

## 2. Clerk (Auth)

1. Go to https://dashboard.clerk.com and create a new application
2. Note the **Publishable Key** (`pk_live_...`) and **Secret Key** (`sk_live_...`)
3. Go to **Webhooks** → **Add Endpoint**
   - Endpoint: `https://procura-api.onrender.com/api/v1/auth/webhook`
   - Events: `user.created`, `user.updated`, `user.deleted`, `organization.created`, `organization.updated`, `organization.deleted`
   - Note the **Signing Secret** (`whsec_...`)
4. Note your Clerk issuer URL: `https://[YOUR_CLERK_DOMAIN].clerk.accounts.dev`

---

## 3. Supabase (Database)

1. Go to https://supabase.com → **New Project**
2. After creation, go to **Project Settings** → **Database**
3. Copy the **Connection string** (URI format)
4. Enable pgvector: In **SQL Editor**, run `CREATE EXTENSION IF NOT EXISTS vector;`

---

## 4. Cloudflare (Frontend + Storage + Cache)

### 4a. R2 Bucket
```bash
npx wrangler r2 bucket create procura-invoices
```
Then enable **Public Access** in Cloudflare Dashboard → R2 → procura-invoices → Settings

### 4b. KV Namespace
```bash
npx wrangler kv namespace create procura-cache
```
Copy the returned ID into `apps/web/wrangler.toml` → `kv_namespaces[].id`

### 4c. Pages Project
```bash
npx wrangler pages project create procura-ai
```

### 4d. Environment Variables
Set in Cloudflare Dashboard → Pages → procura-ai → **Environment Variables** (Production):
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` |
| `NEXT_PUBLIC_API_URL` | `https://procura-api.onrender.com/api/v1` |
| `R2_PUBLIC_URL` | `https://pub-XXXX.r2.dev` (from step 4a) |
| `KV_CACHE_TTL` | `60` |
| `INTERNAL_API_TOKEN` | (random 32-char token) |

---

## 5. Render (API + AI Service)

### 5a. NestJS API
1. Go to https://dashboard.render.com → **New Web Service**
2. Connect your GitHub repo
3. **Name:** `procura-api`
4. **Root Directory:** (leave blank)
5. **Build Command:** `npm install && npx prisma generate --schema=packages/database/prisma/schema.prisma && npm run build --filter=@procura/api`
6. **Start Command:** `node apps/api/dist/main.js`
7. **Plan:** Free

### 5b. Environment Variables (Render → API → Environment)
| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `DATABASE_URL` | `postgresql://...` (from Supabase) |
| `CLERK_SECRET_KEY` | `sk_live_...` |
| `CLERK_PUBLISHABLE_KEY` | `pk_live_...` |
| `CLERK_WEBHOOK_SECRET` | `whsec_...` |
| `CLERK_ISSUER` | `https://[your-domain].clerk.accounts.dev` |
| `BYOK_ENCRYPTION_KEY` | (32-byte hex key — generate via `openssl rand -hex 32` or use a strong passphrase) |
| `INTERNAL_API_TOKEN` | (same token as step 4d) |
| `FRONTEND_URL` | `https://procura-ai.pages.dev` |
| `AI_SERVICE_URL` | `https://procura-ai-service.onrender.com` |

### 5c. Python AI Service
1. **New Web Service** → **Name:** `procura-ai-service`
2. **Root Directory:** `apps/ai-service`
3. **Build Command:** `pip install -r requirements.txt`
4. **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port 10000`
5. **Plan:** Free
6. **Environment Variables:** `ENVIRONMENT=production`, `FRONTEND_URL=https://procura-ai.pages.dev`, `API_KEY=...`, `DATABASE_URL=...`, `OPENAI_API_KEY=...`, `INTERNAL_API_TOKEN=...`

---

## 6. GitHub Actions Secrets

After pushing to GitHub, set these **Repository Secrets** (Settings → Secrets and variables → Actions):

| Secret | Value |
|--------|-------|
| `CLERK_PUBLISHABLE_KEY` | `pk_live_...` |
| `API_URL` | `https://procura-api.onrender.com/api/v1` |
| `CLOUDFLARE_API_TOKEN` | (Create in Cloudflare Dashboard → My Profile → API Tokens → Create Token → "Cloudflare Pages") |
| `RENDER_SERVICE_ID` | (From Render dashboard → API service URL → Copy ID after `/srv-`) |
| `RENDER_DEPLOY_KEY` | (Render Dashboard → Account → Deploy Keys) |

---

## 7. Final Steps

1. Visit `https://procura-ai.pages.dev` — you should see the Clerk sign-in page
2. Sign up → Clerk webhook triggers → user is created in your Supabase database
3. Go to `https://procura-api.onrender.com/api/v1/health` — should return `{ "status": "ok" }`

---

## 8. Cron Job (Keep Render Free Tier Awake)

Create a free cron job at https://cron-job.org:
- **URL:** `https://procura-api.onrender.com/api/v1/health`
- **Schedule:** Every 10 minutes
- This prevents Render's free tier from sleeping after 15 min of inactivity
