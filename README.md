# StoreSync Pro MVP - Manager E-commerce Complet

## 📦 Despre Proiect

StoreSync Pro este o platformă SaaS production-ready pentru managementul magazinelor online. Oferă funcționalități complete pentru gestionarea comenzilor, tracking AWB, generare facturi, actualizare stocuri și multe altele.

## ✨ Funcționalități Principale

### 🔐 Autentificare Robustă
- Sistem de login/register cu JWT și sesiuni persistente
- Hash-uire securizată a parolelor cu bcrypt (12 rounds)
- Sesiuni stocate în PostgreSQL
- Protected routes și middleware de autentificare

### 🏪 Gestionare Magazine
- Conectare multiplă magazine (WooCommerce, Shopify, Magento, PrestaShop)
- Sincronizare automată comenzi și produse
- API keys și OAuth tokens securizate
- Status monitoring în timp real

### 📦 Tracking AWB
- Generare AWB pentru 3 curieri: Fan Courier, Sameday, GLS
- Tracking în timp real
- Descărcare etichete PDF
- Istoric complet tracking

### 📄 Generare Facturi
- Integrare SmartBill și Oblio
- Generare automată la plasare comandă
- Download PDF facturi
- Arhivă completă facturi

### 📊 Dashboard Inteligent
- Statistici în timp real
- Grafice vânzări
- Alert-uri stocuri mici
- Comenzi pending

### 🤖 AI Layer (Opțional)
- Analiza comenzilor cu OpenAI/Anthropic/Groq
- Predicții stocuri
- Recomandări optimizare
- Configurabil per magazin

### 📱 UI/UX Modern
- Design responsive pentru toate device-urile
- Dark mode
- Animații fluide cu Framer Motion
- Componente shadcn/ui
- Tailwind CSS 4

## 🚀 Instalare și Configurare

### Prerequisite
- Node.js 20+
- PostgreSQL 14+
- npm sau yarn

### 1. Clonare și Instalare Dependențe
```bash
cd StoreSync-Pro-MVP
npm install
```

### 2. Configurare Bază de Date

Creează o bază de date PostgreSQL:
```sql
CREATE DATABASE storesync_pro;
```

### 3. Configurare Variabile de Mediu

Creează fișier `.env` în root:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/storesync_pro

# Server
PORT=5000
NODE_ENV=development

# Security
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional: AI Integration
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...

# Optional: Courier APIs
FANCOURIER_CLIENT_ID=...
FANCOURIER_USER=...
FANCOURIER_PASSWORD=...

SAMEDAY_USERNAME=...
SAMEDAY_PASSWORD=...

GLS_CLIENT_ID=...
GLS_USERNAME=...
GLS_PASSWORD=...

# Optional: Billing APIs
SMARTBILL_USERNAME=...
SMARTBILL_TOKEN=...

OBLIO_EMAIL=...
OBLIO_SECRET=...
```

### 4. Inițializare Bază de Date
```bash
npm run db:push
```

### 5. Pornire Development
```bash
npm run dev
```

Aplicația va rula pe `http://localhost:5000`

### 6. Build pentru Production
```bash
npm run build
npm start
```

## 📁 Structură Proiect

```
StoreSync-Pro-MVP/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componente UI
│   │   ├── hooks/         # React hooks personalizate
│   │   ├── lib/           # Utilități
│   │   └── pages/         # Pagini aplicație
│   └── index.html
├── server/                 # Backend Express
│   ├── routes/            # API routes
│   ├── middleware/        # Middleware-uri
│   ├── services/          # Servicii business logic
│   ├── auth.ts           # Autentificare
│   ├── db.ts             # Configurare DB
│   └── index.ts          # Entry point server
├── shared/                 # Cod partajat
│   ├── models/           # Modele de date
│   ├── types/            # TypeScript types
│   └── schema.ts         # Drizzle ORM schema
└── package.json

```

## 🔧 Deploy pe Render

### 1. Creează cont Render
Accesează [render.com](https://render.com) și creează un cont.

### 2. Adaugă Serviciu PostgreSQL
- New → PostgreSQL
- Alege un nume (ex: storesync-db)
- Selectează planul Free sau Starter
- Copiază `Internal Database URL`

### 3. Adaugă Web Service
- New → Web Service
- Conectează repository GitHub
- Configurare:
  - **Build Command**: `npm install && npm run build`
  - **Start Command**: `npm start`
  - **Environment**: Node
  - **Region**: Frankfurt (cel mai aproape de România)

### 4. Adaugă Environment Variables
În dashboard-ul serviciului:
- `DATABASE_URL` = Internal Database URL de la pasul 2
- `SESSION_SECRET` = secret generat (32+ caractere)
- `JWT_SECRET` = secret generat (32+ caractere)
- `NODE_ENV` = production
- Plus variabilele opționale pentru API-uri

### 5. Deploy
Render va face deploy automat. URL-ul aplicației va fi `https://your-app-name.onrender.com`

## 📖 Utilizare

### Creare Cont
1. Accesează aplicația
2. Click pe "Creează cont"
3. Completează detaliile
4. Autentificare automată

### Adăugare Magazin
1. Dashboard → Magazinele Mele
2. "Adaugă Magazin Nou"
3. Selectează platforma (WooCommerce/Shopify/etc)
4. Introdu credențiale API
5. Salvează → Sincronizare automată

### Generare AWB
1. Comenzi → Selectează comandă
2. "Generează AWB"
3. Alege curier
4. Completează detalii (dacă e necesar)
5. Generează → Download PDF

### Generare Factură
1. Comenzi → Selectează comandă
2. "Generează Factură"
3. Alege provider (SmartBill/Oblio)
4. Confirmă
5. Download PDF

## 🔍 API Endpoints

### Autentificare
- `POST /api/auth/register` - Înregistrare utilizator
- `POST /api/auth/login` - Autentificare
- `GET /api/auth/user` - User curent
- `POST /api/auth/logout` - Logout

### Magazine
- `GET /api/stores` - Lista magazine
- `POST /api/stores` - Adaugă magazin
- `PUT /api/stores/:id` - Update magazin
- `DELETE /api/stores/:id` - Șterge magazin
- `POST /api/stores/:id/sync` - Sincronizare manuală

### Comenzi
- `GET /api/orders` - Lista comenzi
- `GET /api/orders/:id` - Detalii comandă

### AWB
- `POST /api/awb/generate` - Generează AWB
- `GET /api/awb/:id/track` - Status tracking
- `GET /api/awb/:id/pdf` - Download PDF

### Facturi
- `POST /api/invoices/generate` - Generează factură
- `GET /api/invoices/:id` - Detalii factură
- `GET /api/invoices/:id/pdf` - Download PDF

### Dashboard
- `GET /api/dashboard/stats` - Statistici generale
- `GET /api/dashboard/recent-orders` - Comenzi recente
- `GET /api/dashboard/revenue-chart` - Date grafic vânzări

## 🛡️ Securitate

- Parole hash-uite cu bcrypt (12 salt rounds)
- JWT tokens pentru API
- Sesiuni server-side în PostgreSQL
- CORS configurat corect
- SQL injection protection prin Drizzle ORM
- XSS protection
- Rate limiting pe endpoints sensibili
- HTTPS obligatoriu în production

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

## 📝 Licență

MIT License - vezi fișierul LICENSE pentru detalii.

## 🤝 Contribuții

Contribuțiile sunt binevenite! Pentru modificări majore:
1. Fork repository
2. Creează branch pentru feature (`git checkout -b feature/Amazing Feature`)
3. Commit changes (`git commit -m 'Add Amazing Feature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Deschide Pull Request

## 📧 Suport

Pentru probleme sau întrebări, deschide un issue pe GitHub sau contactează echipa de suport.

## 🎯 Roadmap

- [ ] Integrare mai mulți curieri (DPD, DHL, UPS)
- [ ] Export rapoarte Excel/PDF
- [ ] Notificări email/SMS
- [ ] Multi-user per account
- [ ] Mobile app (React Native)
- [ ] Integrare marketplace-uri (eMAG, Amazon)
- [ ] Analytics avansat
- [ ] A/B testing produse
- [ ] CRM integrat

---

Dezvoltat cu ❤️ pentru comunitatea e-commerce din România
