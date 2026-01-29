# 🧪 Ghid de Testare - StoreSync Pro MVP

## 📋 Lista Completă de Funcționalități de Testat

### ✅ 1. Autentificare și Utilizatori

#### 1.1 Înregistrare Utilizator
**Pași:**
1. Accesează pagina principală
2. Click pe "Creează cont"
3. Completează:
   - Email: `test@example.com`
   - Parolă: `Test123456!`
   - Prenume: `Ion`
   - Nume: `Popescu`
   - Companie: `Test SRL`
4. Click "Înregistrare"

**Rezultat așteptat:**
- ✅ Cont creat cu succes
- ✅ Redirect automat la dashboard
- ✅ Mesaj de bun venit

**Cazuri de testare:**
- [ ] Email valid
- [ ] Email duplicat (ar trebui să dea eroare)
- [ ] Parolă prea scurtă (< 6 caractere)
- [ ] Câmpuri goale

#### 1.2 Autentificare
**Pași:**
1. Logout din cont
2. Click "Autentificare"
3. Introdu email și parolă
4. Click "Autentificare"

**Rezultat așteptat:**
- ✅ Autentificare reușită
- ✅ Redirect la dashboard
- ✅ Sesiune persistentă (refresh nu deloghează)

**Cazuri de testare:**
- [ ] Credențiale corecte
- [ ] Email greșit
- [ ] Parolă greșită
- [ ] Remember me funcționează

#### 1.3 Delogare
**Pași:**
1. Click pe avatar/meniu utilizator
2. Click "Logout"

**Rezultat așteptat:**
- ✅ Delogare reușită
- ✅ Redirect la landing page
- ✅ Sesiune ștearsă

---

### ✅ 2. Gestionare Magazine

#### 2.1 Adăugare Magazin WooCommerce
**Pași:**
1. Dashboard → "Magazinele Mele"
2. Click "Adaugă Magazin Nou"
3. Completează:
   - Nume: `Magazin Test WooCommerce`
   - Tip: `WooCommerce`
   - URL: `https://magazin-test.com`
   - Consumer Key: `ck_test123...`
   - Consumer Secret: `cs_test456...`
4. Click "Salvează"

**Rezultat așteptat:**
- ✅ Magazin adăugat
- ✅ Status: "Activ"
- ✅ Apare în lista de magazine

**Cazuri de testare:**
- [ ] WooCommerce cu credentials valide
- [ ] WooCommerce cu credentials invalide
- [ ] URL invalid
- [ ] Shopify (OAuth flow)
- [ ] Magento
- [ ] PrestaShop

#### 2.2 Sincronizare Manuală
**Pași:**
1. Listă magazine → Click pe un magazin
2. Click "Sincronizează Acum"

**Rezultat așteptat:**
- ✅ Loader/progress indicator
- ✅ Mesaj "Sincronizare în curs..."
- ✅ După finalizare: "Sincronizare completă"
- ✅ Produse și comenzi actualizate
- ✅ Log entry în istoric sincronizări

**Verificări:**
- [ ] Produse noi importate
- [ ] Comenzi noi importate
- [ ] Stocuri actualizate
- [ ] Timestamps corecte

#### 2.3 Editare Magazin
**Pași:**
1. Click pe magazin
2. Click "Editează"
3. Modifică câmpuri
4. Click "Salvează"

**Rezultat așteptat:**
- ✅ Modificări salvate
- ✅ Mesaj confirmare
- ✅ Date actualizate în listă

#### 2.4 Ștergere Magazin
**Pași:**
1. Click pe magazin
2. Click "Șterge"
3. Confirmă ștergerea

**Rezultat așteptat:**
- ✅ Dialog de confirmare
- ✅ Magazin șters
- ✅ Produse și comenzi asociate (opțional șterge/păstrează)

---

### ✅ 3. Gestionare Produse și Stocuri

#### 3.1 Vizualizare Lista Produse
**Pași:**
1. Dashboard → "Produse/Inventar"

**Verificări:**
- [ ] Lista afișează toate produsele
- [ ] Filtre: per magazin, status, stoc mic
- [ ] Căutare după nume/SKU
- [ ] Paginare funcționează
- [ ] Sortare după coloană

#### 3.2 Detalii Produs
**Pași:**
1. Click pe un produs

**Verificări:**
- [ ] Toate detaliile afișate corect
- [ ] Imagine produs
- [ ] Preț, SKU, stoc
- [ ] Magazin asociat
- [ ] Istoric modificări

#### 3.3 Actualizare Stoc
**Pași:**
1. Click pe produs
2. Modifică cantitatea stoc
3. Click "Actualizează"

**Rezultat așteptat:**
- ✅ Stoc actualizat local
- ✅ Sincronizare automată cu magazinul
- ✅ Mesaj confirmare
- ✅ Log entry

**Cazuri de testare:**
- [ ] Stoc pozitiv
- [ ] Stoc 0 (out of stock)
- [ ] Actualizare multiplă (bulk update)

#### 3.4 Alert Stoc Mic
**Pași:**
1. Dashboard → Verifică widget "Stocuri Mici"

**Verificări:**
- [ ] Produse cu stoc < 5 afișate
- [ ] Notificare vizibilă
- [ ] Click pe notificare → listă produse

---

### ✅ 4. Gestionare Comenzi

#### 4.1 Vizualizare Lista Comenzi
**Pași:**
1. Dashboard → "Comenzi"

**Verificări:**
- [ ] Toate comenzile afișate
- [ ] Filtre: status, magazin, dată
- [ ] Căutare după număr comandă/client
- [ ] Paginare
- [ ] Export CSV/Excel (dacă implementat)

#### 4.2 Detalii Comandă
**Pași:**
1. Click pe o comandă

**Verificări:**
- [ ] Toate detaliile afișate
- [ ] Date client (nume, email, adresă)
- [ ] Produse comandate
- [ ] Total comandă
- [ ] Status comandă
- [ ] Timeline/istoric

#### 4.3 Actualizare Status Comandă
**Pași:**
1. Click pe comandă
2. Schimbă status (pending → processing → completed)
3. Click "Salvează"

**Rezultat așteptat:**
- ✅ Status actualizat
- ✅ Sincronizare cu magazinul
- ✅ Timestamp actualizat
- ✅ Notificare client (dacă implementat)

---

### ✅ 5. Generare AWB (Tracking)

#### 5.1 Generare AWB Fan Courier
**Pași:**
1. Comenzi → Selectează o comandă fără AWB
2. Click "Generează AWB"
3. Selectează "Fan Courier"
4. Completează detalii:
   - Greutate: `1` kg
   - Colete: `1`
   - Valoare declarată: `100` RON
   - Plata transport: `Destinatar`
5. Click "Generează"

**Rezultat așteptat:**
- ✅ Loader cu mesaj "Se generează AWB..."
- ✅ După 3-5 secunde: Success message
- ✅ Număr AWB afișat (ex: `3510123456789`)
- ✅ Link descărcare PDF
- ✅ Status comandă → "Shipped" / "În livrare"

**Verificări:**
- [ ] Număr AWB valid
- [ ] PDF descărcabil
- [ ] PDF conține cod bare
- [ ] Adresă corectă pe etichetă

#### 5.2 Generare AWB Sameday
**Similar cu Fan Courier**

**Verificări:**
- [ ] Locker disponibil (selectabil)
- [ ] AWB generat cu succes
- [ ] PDF conform Sameday

#### 5.3 Generare AWB GLS
**Similar cu Fan Courier/Sameday**

#### 5.4 Tracking AWB
**Pași:**
1. Comenzi → Click pe comandă cu AWB
2. Secțiunea "Tracking"

**Verificări:**
- [ ] Status curent afișat
- [ ] Istoric tracking (timeline)
- [ ] Update automat (polling la 30s - 1min)
- [ ] Statusuri: "Preluat", "În curs", "Livrat"

#### 5.5 Descărcare PDF AWB
**Pași:**
1. Click "Descarcă AWB"

**Rezultat așteptat:**
- ✅ PDF se descarcă
- ✅ Dimensiune A4 / A6
- ✅ Cod bare scanabil
- ✅ Detalii corecte

**Cazuri de testare:**
- [ ] Un AWB
- [ ] Multiple AWBs (bulk download)
- [ ] Print direct

---

### ✅ 6. Generare Facturi

#### 6.1 Generare Factură SmartBill
**Pași:**
1. Comenzi → Selectează comandă fără factură
2. Click "Generează Factură"
3. Selectează "SmartBill"
4. Verifică detalii auto-complete:
   - Serie: `TEST`
   - Client
   - Produse
   - Total
5. Click "Generează"

**Rezultat așteptat:**
- ✅ Loader "Se generează factura..."
- ✅ Factură generată (3-5 secunde)
- ✅ Număr factură afișat (ex: `TEST-2025-0001`)
- ✅ Link descărcare PDF
- ✅ Status "Issued" / "Emisă"

**Verificări:**
- [ ] Număr factură valid
- [ ] PDF conform standard RO
- [ ] TVA calculat corect
- [ ] Date client complete

#### 6.2 Generare Factură Oblio
**Similar cu SmartBill**

**Verificări:**
- [ ] Integrare Oblio funcțională
- [ ] PDF descărcabil
- [ ] Conform standard facturare RO

#### 6.3 Descărcare PDF Factură
**Pași:**
1. Click "Descarcă Factură"

**Rezultat așteptat:**
- ✅ PDF se descarcă
- ✅ Format A4
- ✅ Detalii facturare complete
- ✅ Semnătură electronică (dacă aplicabil)

#### 6.4 Anulare Factură
**Pași:**
1. Click pe factură
2. Click "Anulează"
3. Confirmă

**Rezultat așteptat:**
- ✅ Dialog confirmare
- ✅ Factură anulată în sistem
- ✅ Stare în SmartBill/Oblio actualizată
- ✅ Factură storno generată (dacă aplicabil)

---

### ✅ 7. Dashboard și Rapoarte

#### 7.1 Widget-uri Dashboard
**Verificări:**
- [ ] Total vânzări (astăzi/săptămână/lună)
- [ ] Număr comenzi
- [ ] Produse totale
- [ ] Stocuri mici (alert)
- [ ] Comenzi pending livrare

#### 7.2 Grafice
**Verificări:**
- [ ] Grafic vânzări ultimele 7/30 zile
- [ ] Grafic comenzi per status
- [ ] Grafic top produse
- [ ] Date corecte
- [ ] Tooltips pe hover
- [ ] Responsive pe mobile

#### 7.3 Rapoarte
**Pași:**
1. Dashboard → "Rapoarte"
2. Selectează perioada
3. Click "Generează"

**Verificări:**
- [ ] Raport vânzări
- [ ] Raport produse
- [ ] Raport clienți
- [ ] Export CSV/Excel/PDF

---

### ✅ 8. AI Layer (Opțional)

#### 8.1 Activare AI
**Pași:**
1. Setări Magazin
2. Secțiunea "AI Layer"
3. Toggle "Activează AI"
4. Selectează provider (OpenAI/Claude/Groq)
5. Salvează

**Verificări:**
- [ ] AI activat
- [ ] API key valid
- [ ] Model selectat

#### 8.2 Analiză Comenzi
**Pași:**
1. Comenzi → Selectează comandă
2. Click "Analiză AI"

**Rezultat așteptat:**
- ✅ Loader "Analizează..."
- ✅ Insights afișate:
  - Risk score
  - Recomandări
  - Pattern detection

#### 8.3 Predicții Stocuri
**Pași:**
1. Produse → Selectează produs
2. Click "Predicție Stoc"

**Rezultat așteptat:**
- ✅ Predicție pentru următoarele 7/30 zile
- ✅ Recomandare cantitate restock
- ✅ Bazat pe istoric vânzări

---

### ✅ 9. Setări și Configurare

#### 9.1 Profil Utilizator
**Verificări:**
- [ ] Editare nume, email
- [ ] Schimbare parolă
- [ ] Upload avatar
- [ ] Salvare setări

#### 9.2 Setări Aplicație
**Verificări:**
- [ ] Dark mode toggle
- [ ] Limba (RO/EN)
- [ ] Timezone
- [ ] Notificări (email/push)

#### 9.3 Integrări
**Verificări:**
- [ ] Listă integrări disponibile
- [ ] Status fiecare integrare
- [ ] Configurare API keys
- [ ] Test conexiune

---

### ✅ 10. Securitate

#### 10.1 Protecție Rute
**Teste:**
- [ ] `/dashboard` fără autentificare → redirect `/login`
- [ ] `/api/stores` fără token → 401 Unauthorized
- [ ] CSRF protection
- [ ] XSS protection

#### 10.2 Rate Limiting
**Teste:**
- [ ] > 100 requests/min → 429 Too Many Requests
- [ ] Login brute force protection

#### 10.3 Validare Date
**Teste:**
- [ ] SQL injection blocată
- [ ] XSS scripts filtrate
- [ ] File upload validation

---

### ✅ 11. Performance

#### 11.1 Timpi de Răspuns
**Verificări:**
- [ ] Landing page: < 2s
- [ ] Dashboard: < 3s
- [ ] Lista produse (1000 items): < 5s
- [ ] API calls: < 500ms

#### 11.2 Optimizări
**Verificări:**
- [ ] Images lazy loading
- [ ] Code splitting
- [ ] Caching API responses
- [ ] Database queries optimizate

---

### ✅ 12. Mobile Responsiveness

#### 12.1 Layout
**Teste pe:**
- [ ] iPhone (375px)
- [ ] iPad (768px)
- [ ] Desktop (1920px)

**Verificări:**
- [ ] Meniu colapsabil
- [ ] Tabele scrollabile
- [ ] Butoane accesibile
- [ ] Formulare utilizabile

---

## 🐛 Raportare Buguri

Dacă găsești probleme, documentează:
1. **Pași de reproducere** (exact ce ai făcut)
2. **Rezultat așteptat** (ce ar trebui să se întâmple)
3. **Rezultat actual** (ce s-a întâmplat)
4. **Screenshots/Video** (dacă posibil)
5. **Browser & Device** (Chrome, Firefox, mobile, etc.)
6. **Console errors** (F12 → Console)

---

## ✅ Checklist Final

Înainte de a considera MVP-ul gata:

- [ ] Toate funcționalitățile de bază testate
- [ ] Fără erori critice
- [ ] Performance acceptabil
- [ ] Mobile friendly
- [ ] Securitate verificată
- [ ] Documentație completă
- [ ] README actualizat
- [ ] DEPLOYMENT guide verificat
- [ ] Backup strategy în loc
- [ ] Monitoring configurat

---

**Status Test:** ___/12 Secțiuni Complete

**Data Ultimului Test:** _____________

**Testat De:** _____________

**Aprobat pentru Production:** [ ] DA [ ] NU
