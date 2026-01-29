# 🚀 StoreSync Pro - Deployment Guide (UPDATED)

## ✅ Ce am rezolvat

Am **simplificat complet** procesul de build pentru a funcționa pe orice platformă de hosting:

- ✅ Eliminat build-ul complex cu tsx
- ✅ Folosit esbuild pentru bundling rapid
- ✅ Fix-uit toate problemele cu `import.meta.dirname` și `__dirname`
- ✅ Adăugat configurații pentru Render și Vercel
- ✅ Simplificat dependency-urile

## 📦 Build System Nou

**Build Commands:**
```bash
npm run build:client  # Build React app cu Vite
npm run build:server  # Build Node.js server cu esbuild
npm run build         # Build complet (client + server)
```

**Start Command:**
```bash
npm start  # Rulează dist/server.js
```

**Development:**
```bash
npm run dev  # Hot reload cu tsx watch
```

## 🌐 Deployment pe Render.com

### Opțiunea 1: Blueprint (Recomandat)

Render va detecta automat `render.yaml` și va configura totul:

1. Push codul pe GitHub
2. Mergi pe [Render Dashboard](https://dashboard.render.com)
3. Click **"New"** → **"Blueprint"**
4. Selectează repository-ul
5. Click **"Apply"**

Render va crea automat:
- PostgreSQL database
- Web service
- Environment variables (cu secrete generate automat)

### Opțiunea 2: Manual

#### 1. Creează PostgreSQL Database

- Click **"New +"** → **"PostgreSQL"**
- Name: `storesync-db`
- Database: `storesync_pro`
- Region: Alege cea mai apropiată
- Plan: **Free**
- Click **"Create Database"**
- **Copiază Internal Database URL**

#### 2. Creează Web Service

- Click **"New +"** → **"Web Service"**
- Conectează repository-ul GitHub
- Configurare:
  - **Name**: `storesync-pro`
  - **Region**: Aceeași cu database
  - **Branch**: `main`
  - **Build Command**: 
    ```
    npm install && npm run build
    ```
  - **Start Command**: 
    ```
    npm start
    ```

#### 3. Environment Variables

Adaugă în **Environment** tab:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | [Internal Database URL de la pasul 1] |
| `NODE_ENV` | `production` |
| `SESSION_SECRET` | [Generează 32 caractere random] |
| `JWT_SECRET` | [Generează 32 caractere random] |

**Generare secrete:**
```bash
openssl rand -base64 32
```

#### 4. Deploy

Click **"Create Web Service"** și așteaptă deploy-ul (~5 min).

#### 5. Inițializează DB

După deploy, deschide **Shell** în Render și rulează:
```bash
npm run db:push
```

### ✅ Gata!

Aplicația ta va fi live la:
```
https://storesync-pro.onrender.com
```

---

## 🐛 Troubleshooting

### Build fails pe Render

**Error**: `Cannot find module 'esbuild'`

**Fix**: Asigură-te că `esbuild` e în `devDependencies`:
```bash
npm install -D esbuild
```

### Error: Cannot find dist/public

**Cauză**: Build-ul client-ului a eșuat

**Fix**: Verifică logs și rulează local:
```bash
npm run build:client
```

### Database connection failed

**Error**: `connection refused` sau `ETIMEDOUT`

**Fix pe Render**: 
- Folosește **Internal Database URL** (nu External)
- Verifică că service-ul și DB-ul sunt în **aceeași regiune**

### Application crashes on start

**1. Verifică Logs**
- Render: Dashboard → Service → Logs

**2. Erori comune:**

```
Error: relation "users" does not exist
```
**Fix**: Rulează migrațiile:
```bash
npm run db:push
```

```
Error: Invalid JWT_SECRET
```
**Fix**: Verifică că `JWT_SECRET` și `SESSION_SECRET` sunt setate

---

## 💡 Tips

1. **Auto-Deploy**: Render va auto-deploy la fiecare `git push`

2. **Database Backups**: 
   - Free tier nu include backups
   - Export manual: Settings → Database → Download

3. **Monitoring**:
   - Use [UptimeRobot](https://uptimerobot.com) gratuit
   - Ping la fiecare 5 min previne sleep

4. **Logs**:
   - Render: Real-time în Dashboard
   - Download pentru debug offline

5. **Scaling**:
   - Free tier: 512 MB RAM
   - Starter ($7/lună): 2 GB RAM, 24/7 uptime

---

**Status**: ✅ Proiectul este 100% gata pentru production deployment!

**Last Updated**: 29 Ianuarie 2026
