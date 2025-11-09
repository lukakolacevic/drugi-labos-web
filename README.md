# Web Security Vulnerabilities Demo

Web aplikacija koja demonstrira dvije sigurnosne ranjivosti: **Cross-site scripting (XSS)** i **Loša kontrola pristupa (Broken Access Control)**.

## Implementirane ranjivosti

1. **Cross-site scripting (XSS)** - Stored XSS napad
2. **Loša kontrola pristupa (Broken Access Control)** - Neautorizirani pristup admin resursima

## Funkcionalnosti

### Za svaku ranjivost:
- ✅ Funkcionalnost kojom se omogućuje ranjivost
- ✅ Funkcionalnost kojom se onemogućuje ranjivost
- ✅ Prekidač (checkbox) kojim se ranjivost uključuje i isključuje
- ✅ Napadi se mogu pokrenuti kroz sučelje web-aplikacije
- ✅ Učinak napada je vidljiv u korisničkom sučelju

## Instalacija i pokretanje

### Lokalno pokretanje

1. Instalirajte Node.js (verzija 14 ili novija)

2. Instalirajte dependencies:
```bash
npm install
```

3. Pokrenite server:
```bash
npm start
```

4. Otvorite web preglednik na adresi:
```
http://localhost:3000
```

### Pokretanje u development modu (s automatskim restartom)
```bash
npm run dev
```

## Testiranje aplikacije

### Test korisnici

**Admin korisnik:**
- Korisničko ime: `admin`
- Lozinka: `admin123`

**Obični korisnik:**
- Korisničko ime: `user`
- Lozinka: `user123`

### Testiranje XSS ranjivosti

1. Provjerite da je checkbox "Ranjivost uključena" označen za XSS sekciju
2. Unesite autor (npr. "Test korisnik")
3. Unesite maliciozni JavaScript kod u polje za poruku:
   ```
   <script>alert('XSS Attack! Cookie: ' + document.cookie)</script>
   ```
   ili jednostavnije:
   ```
   <img src=x onerror="alert('XSS: ' + document.cookie)">
   ```
4. Kliknite "Dodaj poruku"
5. JavaScript kod će se izvršiti i prikazati alert s cookie informacijama
6. Poruka će se prikazati u listi poruka (ako je ranjivost uključena, kod će se izvršiti)
7. Isključite ranjivost i ponovite unos - HTML znakovi će biti escapirani i kod se neće izvršiti

### Testiranje Broken Access Control ranjivosti

1. Provjerite da je checkbox "Ranjivost uključena" označen za Broken Access Control sekciju
2. Prijavite se kao obični korisnik:
   - Korisničko ime: `user`
   - Lozinka: `user123`
3. Kliknite na gumb "Učitaj sve korisnike" u admin panelu
4. Kada je ranjivost uključena, obični korisnik će moći vidjeti sve korisnike (uključujući admina)
5. Isključite ranjivost i ponovite korake 2-3
6. Sada će se prikazati greška "Access denied. Admin role required." jer je autorizacija ispravno implementirana

## Tehnički detalji

### XSS implementacija
- Kada je ranjivost uključena: korisnički unos se direktno prikazuje bez sanitizacije
- Kada je ranjivost isključena: korisnički unos se escapira pomoću `escapeHtml()` funkcije

### Broken Access Control implementacija
- Kada je ranjivost uključena: provjerava se samo autentifikacija (je li korisnik prijavljen), ne i autorizacija (ima li admin ulogu)
- Kada je ranjivost isključena: provjerava se i autentifikacija i autorizacija (korisnik mora biti admin)

## Deployment

Aplikacija je spremna za deployment na Render, Vercel, Heroku ili slične platforme.

### Render deployment

1. Povežite GitHub repozitorij s Renderom
2. Postavite:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

### Vercel deployment

1. Instalirajte Vercel CLI: `npm i -g vercel`
2. Pokrenite: `vercel`
3. Slijedite upute

### Heroku deployment

1. Instalirajte Heroku CLI
2. Pokrenite:
   ```bash
   heroku create
   git push heroku main
   ```

## Napomene

- Sve funkcionalnosti su uspješno implementirane
- Aplikacija koristi in-memory storage (podaci se resetiraju nakon restarta servera)
- Za produkcijsku upotrebu preporuča se dodati pravu bazu podataka i dodatne sigurnosne mjere

## Autor

Projekt izrađen za demonstraciju sigurnosnih ranjivosti web-aplikacija.

