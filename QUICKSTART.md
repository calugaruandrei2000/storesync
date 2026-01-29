# ⚡ Quick Start Guide - StoreSync Pro MVP

## 🚀 Start Rapid în 5 Pași

### 1️⃣ Instalare Dependențe (2 min)
```bash
cd StoreSync-Pro-MVP
npm install
```

### 2️⃣ Setup Bază de Date (3 min)

**Opțiunea A: PostgreSQL Local**
```bash
# Instalează PostgreSQL
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql
# Windows: Descarcă de la postgresql.org

# Pornește PostgreSQL
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Creează baza de date
createdb storesync_pro

# Sau folosind psql
psql postgres
CREATE DATABASE storesync_pro;
\q
```

**Opțiunea B: PostgreSQL Docker**
```bash
docker run --name storesync-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=storesync_pro \
  -p 5432:5432 \
  -d postgres:16
```

### 3️⃣ Configurare Environment (1 min)
```bash
# Copiază fișierul exemplu
cp .env.example .env

# Editează .env
nano .env  # sau orice editor
```

**Minim necesar în .env:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/storesync_pro
SESSION_SECRET=schimba-acest-secret-cu-unul-random-de-32-caractere
JWT_SECRET=schimba-acest-secret-cu-alt-secret-random-de-32-caractere
NODE_ENV=development
PORT=5000
```

### 4️⃣ Inițializare DB Schema (1 min)
```bash
npm run db:push
```

Ar trebui să vezi:
```
✅ Tables created successfully
✅ Schema pushed to database
```

### 5️⃣ Start Development Server (30 sec)
```bash
npm run dev
```

🎉 **Gata!** Accesează: `http://localhost:5000`

---

## 🧪 Testare Rapidă

### Creare Cont de Test
1. Deschide `http://localhost:5000`
2. Click "Creează cont"
3. Completează:
   - Email: `test@example.com`
   - Parolă: `Test123456`
4. Click "Înregistrare"

### Test Funcționalități de Bază
```bash
# Rulează în alt terminal
curl http://localhost:5000/api/health
# Ar trebui să returneze: {"status":"ok"}

# Test autentificare
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'
```

---

## 📁 Structură Proiect (Esențial)

```
StoreSync-Pro-MVP/
├── client/src/          # Frontend React
│   ├── components/     # Componente UI
│   ├── pages/          # Pagini aplicație
│   ├── hooks/          # Custom hooks
│   └── lib/            # Utilități
├── server/              # Backend Express
│   ├── routes.ts       # API endpoints
│   ├── auth.ts         # Autentificare
│   └── db.ts           # Database config
├── shared/              # Cod partajat
│   └── schema.ts       # DB Schema + Types
├── package.json        # Dependențe
└── .env                # Configurare (NU commita!)
```

---

## 🔧 Comenzi Utile

### Development
```bash
npm run dev          # Start dev server (auto-reload)
npm run check        # TypeScript type checking
npm run db:studio    # Deschide Drizzle Studio (UI pentru DB)
```

### Database
```bash
npm run db:push      # Sincronizează schema cu DB
npm run db:generate  # Generează migrații
npm run db:migrate   # Rulează migrații
```

### Production
```bash
npm run build        # Build pentru production
npm start            # Start production server
```

---

## 🐛 Debugging Tips

### Check Logs
```bash
# Server logs în terminal unde rulează `npm run dev`
# Caută erori (linii roșii)
```

### Verificare Bază de Date
```bash
# Conectează-te la DB
psql postgresql://postgres:postgres@localhost:5432/storesync_pro

# Liste tabele
\dt

# Verifică users
SELECT * FROM users;

# Ieși
\q
```

### Reset Database
```bash
# Șterge toate tabelele și recreează
npm run db:push -- --force
```

### Clear Cache
```bash
# Șterge node_modules și reinstalează
rm -rf node_modules package-lock.json
npm install
```

---

## 🎨 Development Workflow

### 1. Creează Feature Branch
```bash
git checkout -b feature/awb-tracking
```

### 2. Fă Modificări
- Editează fișiere
- Server reloads automat

### 3. Test Local
- Verifică în browser
- Check console pentru erori

### 4. Commit & Push
```bash
git add .
git commit -m "Add AWB tracking feature"
git push origin feature/awb-tracking
```

---

## 🔐 Credentials de Test (Development)

**Admin User:**
```
Email: admin@storesync.test
Password: Admin123456!
```

**Test Store Credentials:**

**WooCommerce Test:**
```
URL: https://demo.woothemes.com
Consumer Key: ck_test...
Consumer Secret: cs_test...
```

**Shopify Test:**
```
Shop URL: test-store.myshopify.com
Access Token: shpat_test...
```

**Note:** Acestea sunt pentru development local. NICIODATĂ nu folosi în production!

---

## 📚 Documentație Esențială

### În acest repository:
- **README.md** - Prezentare completă
- **DEPLOYMENT.md** - Ghid deployment Render
- **TESTING.md** - Checklist testare

### Externe:
- **React**: [react.dev](https://react.dev)
- **Express**: [expressjs.com](https://expressjs.com)
- **Drizzle ORM**: [orm.drizzle.team](https://orm.drizzle.team)
- **Tailwind**: [tailwindcss.com](https://tailwindcss.com)
- **shadcn/ui**: [ui.shadcn.com](https://ui.shadcn.com)

---

## 🆘 Probleme Comune

### "DATABASE_URL not set"
```bash
# Verifică că ai .env file
ls -la | grep .env

# Verifică conținut
cat .env

# Ar trebui să conțină DATABASE_URL=postgresql://...
```

### "Port 5000 already in use"
```bash
# Găsește procesul care folosește portul
lsof -i :5000

# Oprește procesul
kill -9 <PID>

# Sau folosește alt port în .env
PORT=5001
```

### "Cannot connect to database"
```bash
# Verifică că PostgreSQL rulează
# macOS:
brew services list | grep postgresql

# Linux:
systemctl status postgresql

# Docker:
docker ps | grep postgres
```

### Build Errors
```bash
# Șterge cache și rebuild
rm -rf dist/ .vite/
npm run build
```

---

## 📞 Need Help?

1. **Check Logs** - Majoritatea problemelor sunt evidente în logs
2. **Google Error** - Copy-paste eroarea în Google
3. **GitHub Issues** - Caută în issues existente
4. **Stack Overflow** - Pentru întrebări tehnice generale
5. **Documentation** - Citește docs pentru librării folosite

---

## ✅ Next Steps

După ce ai aplicația rulând local:

1. **Explorează Codul**
   - Începe cu `server/routes.ts` pentru API
   - Apoi `client/src/pages/` pentru UI

2. **Adaugă Date de Test**
   - Creează magazine
   - Importă produse
   - Creează comenzi

3. **Testează Funcționalități**
   - Generează AWB
   - Creează facturi
   - Vezi analytics

4. **Customizează**
   - Schimbă design (Tailwind în componente)
   - Adaugă features noi
   - Optimizează performance

5. **Deploy**
   - Urmează **DEPLOYMENT.md**
   - Deploy pe Render
   - Share cu users

---

## 🎯 Pro Tips

1. **Folosește TypeScript**
   - Type checking previne multe buguri
   - `npm run check` înainte de commit

2. **Hot Reload**
   - Salvează fișierele → browser refresh automat
   - Nu trebuie să restartezi serverul

3. **DevTools**
   - F12 în browser
   - Network tab pentru API calls
   - Console pentru erori

4. **Git Commits**
   - Commit frecvent
   - Mesaje descriptive
   - Un feature = un commit

5. **Database GUI**
   - `npm run db:studio`
   - Vizualizează și editează date
   - Mai ușor decât SQL queries

---

**Happy Coding! 💻🚀**

Dacă întâmpini probleme, check DEPLOYMENT.md și TESTING.md pentru mai multe detalii.
