# 🚀 Campus Connect — Deployment Guide
## Architecture: Backend on Render + Frontend on Vercel

```
campus-connect.online  →  Vercel (frontend, never sleeps)
                               ↓ API calls
campus-connect-api.onrender.com  →  Render (backend)
                               ↓
                          PostgreSQL (Render DB)
```

---

## Step 1 — Deploy Backend on Render (already done)

Your backend is already live. Just add/update these env vars in your Render service:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://campus-connect.online,https://www.campus-connect.online` |
| `JWT_SECRET` | (already set) |
| `DATABASE_URL` | (already set) |

> **Note:** `CLIENT_URL` now accepts comma-separated origins. Both your domain and www work.

---

## Step 2 — Deploy Frontend on Vercel

### 2a. Push to GitHub
```bash
# From your project root
git init          # if not already a git repo
git add .
git commit -m "feat: campus connect v2 with Vercel deployment"
git remote add origin https://github.com/YOUR_USERNAME/campus-connect.git
git push -u origin main
```

### 2b. Import on Vercel
1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Set **Root Directory** = `frontend`
4. **Framework Preset** = Create React App (auto-detected)
5. Add Environment Variable:
   - Key: `REACT_APP_API_URL`
   - Value: `https://YOUR-RENDER-APP.onrender.com/api`
   *(replace with your actual Render backend URL)*
6. Click **Deploy**

### 2c. Add your custom domain
1. In Vercel → Project → **Settings → Domains**
2. Add `campus-connect.online`
3. Also add `www.campus-connect.online`
4. Vercel will show you DNS records to add

### 2d. Update DNS at your domain registrar
Add these records:

| Type | Name | Value |
|------|------|-------|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

> After adding DNS records, wait 5–30 minutes for propagation.

---

## Step 3 — Run database migration (one-time)

SSH into Render or run this SQL on your Render PostgreSQL:

```sql
-- Auto-verify all existing unverified users (removes OTP requirement)
UPDATE users SET is_verified = true WHERE is_verified = false OR is_verified IS NULL;
ALTER TABLE users ALTER COLUMN is_verified SET DEFAULT true;
```

This runs automatically on server startup via `remove_otp_migration.sql`.

---

## Step 4 — Verify deployment

```bash
# Test backend health
curl https://YOUR-RENDER-APP.onrender.com/api/health

# Should return:
# {"status":"ok","db":"connected","env":"production",...}
```

Then visit `https://campus-connect.online` — the site should load instantly (Vercel CDN, no sleep).

---

## Local Development

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env    # fill in DATABASE_URL and JWT_SECRET
npm install
npm run dev             # starts on :5000

# Terminal 2 — Frontend
cd frontend
npm install
npm start               # starts on :3000, proxies /api to :5000
```

The `"proxy": "http://localhost:5000"` in `frontend/package.json` handles API calls locally.

---

## Environment Variables Summary

### Render (Backend)
```
NODE_ENV=production
DATABASE_URL=postgresql://...  (from Render DB)
JWT_SECRET=<random 64 chars>
CLIENT_URL=https://campus-connect.online,https://www.campus-connect.online
PORT=10000
```

### Vercel (Frontend)
```
REACT_APP_API_URL=https://your-render-app.onrender.com/api
```

---

## Why Vercel + Render?

| | Render (Backend) | Vercel (Frontend) |
|-|-----------------|-------------------|
| **Free tier sleep** | Yes, after 15min idle | ❌ Never sleeps (CDN) |
| **Cold start** | ~30s after sleep | Instant |
| **Custom domain** | ✅ | ✅ |
| **Auto-deploy** | ✅ from GitHub | ✅ from GitHub |

**Result:** Users always get instant page loads from Vercel's CDN. The backend may have a 30s cold start on the first API call after idle, but subsequent calls are fast.

To eliminate backend cold starts, upgrade Render to the $7/mo paid plan.
