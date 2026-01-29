# 🚀 StoreSync Pro MVP - Quick Start

## ✨ Ce este StoreSync?

Platform SaaS production-ready pentru managementul magazinelor online cu:
- 🔐 Autentificare JWT + Sessions
- 🏪 Multi-store support (WooCommerce, Shopify, Magento, PrestaShop)
- 📦 Tracking AWB (Fan Courier, Sameday, GLS)
- 📄 Generare facturi (SmartBill, Oblio)
- 📊 Dashboard cu statistici în timp real
- 🤖 AI Layer opțional (OpenAI/Anthropic/Groq)

## 🚀 Deployment Rapid (5 minute)

### **Recomandat: Render.com Blueprint**

1. **Fork/Clone** acest repository pe GitHub

2. **Mergi pe** [Render Dashboard](https://dashboard.render.com)

3. **Click**: New → Blueprint

4. **Selectează** repository-ul

5. **Click**: Apply

**✅ GATA!** Render va crea automat:
- PostgreSQL database
- Web service
- Environment variables (cu secrete generate automat)

După deploy (5 min), deschide **Shell** în Render și rulează:
```bash
npm run db:push
```

Aplicația va fi live la: `https://[your-service].onrender.com`

## 📖 Documentație Detaliată

- **DEPLOYMENT.md** - Ghid complet deployment (Render + troubleshooting)
- **README.md** - Features complete și arhitectură
- **QUICKSTART.md** - Setup local pentru development
- **.env.example** - Variabile de mediu necesare

## 🛠️ Development Local

```bash
# 1. Clone repository
git clone https://github.com/YOUR-USERNAME/storesync-pro.git
cd storesync-pro

# 2. Install dependencies
npm install

# 3. Setup .env
cp .env.example .env
# Editează .env cu DATABASE_URL și secretele tale

# 4. Push database schema
npm run db:push

# 5. Start dev server
npm run dev
```

Deschide: http://localhost:5000

## 📦 Build Commands

```bash
npm run build         # Build complet (client + server)
npm run build:client  # Build doar React app
npm run build:server  # Build doar Node.js server
npm start            # Start production server
npm run dev          # Development cu hot reload
```

## 🔑 Environment Variables Required

```env
DATABASE_URL=postgresql://...
NODE_ENV=production
SESSION_SECRET=your-32-char-secret
JWT_SECRET=your-32-char-secret
```

**Generare secrete:**
```bash
openssl rand -base64 32
```

## ⚡ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite 7
- Tailwind CSS 4
- shadcn/ui components
- TanStack Query
- Wouter (routing)

**Backend:**
- Node.js + Express 5
- PostgreSQL + Drizzle ORM
- JWT + Express Sessions
- bcryptjs (hashing)

**Build:**
- esbuild (server bundling)
- Vite (client bundling)

## 📞 Support

Dacă ai probleme:
1. Citește **DEPLOYMENT.md** pentru troubleshooting
2. Verifică logs în Render Dashboard
3. Contactează-mă cu screenshot-ul erorii

---

**Status**: ✅ Production Ready  
**Version**: 2.0.0  
**License**: MIT
