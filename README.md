# Web Security Vulnerabilities Demo (lokalno pokretanje)

Ovaj projekt demonstrira dvije sigurnosne ranjivosti web-aplikacija:
- Cross-site scripting (XSS)
- Loša kontrola pristupa (Broken Access Control)

Ako poveznica na Render nije dostupna, možete aplikaciju pokrenuti lokalno prema uputama u nastavku.

## Preduvjeti
- Instaliran Node.js (verzija 14+ preporučeno). Provjera:
```
node -v
npm -v
```

## Instalacija i pokretanje (lokalno)
1. Klonirajte ili preuzmite repozitorij
2. U terminalu uđite u korijenski direktorij projekta
3. Instalirajte ovisnosti:
```
npm install
```
4. Pokrenite server:
```
npm start
```
5. Otvorite preglednik i idite na:
```
http://localhost:3000
```

Ako želite development način rada (auto-restart):
```
npm run dev
```

## Test korisnici
- Admin: `admin` / `admin123`
- Obični korisnik: `user` / `user123`


## Prekidači ranjivosti
U sučelju postoje checkbox prekidači za svaku ranjivost (XSS i Broken Access Control). 
- Kada je ranjivost uključena: ponašanje je nesigurno (ranjivo)
- Kada je ranjivost isključena: primjenjuje se zaštita

## Kako testirati XSS
1. Provjerite da je prekidač (checkbox) za XSS uključen
2. Upišite autora i poruku te kliknite “Dodaj poruku”
3. Primjeri poruka (payloadi):
   - Automatsko izvršavanje preko onerror:
     ```
     <img src=x onerror="alert('XSS: ' + document.cookie)">
     ```
   - Klikom (socijalni inženjering):
     ```
     <div onclick="alert('XSS napad izvršen! Cookie: ' + document.cookie)" style="cursor:pointer;color:blue;padding:10px;border:1px solid red;">Klikni na mene za besplatan mobitel</div>
     ```
     Nakon umetanja poruke, otvorite listu poruka i kliknite na plavi okvir s crvenim obrubom da biste pokrenuli XSS.

4. Kada XSS isključite, svi HTML znakovi bit će escapirani i JavaScript se neće izvršiti (uključujući već spremljene poruke prilikom prikaza).


## Kako testirati Broken Access Control
1. Uključite ranjivost “Broken Access Control”
2. Prijavite se kao obični korisnik: `user` / `user123`
3. Kliknite “Učitaj sve korisnike” u admin panelu
   - Kada je ranjivost uključena: obični korisnik vidi sve korisnike (neispravno)
   - Kada je ranjivost isključena: pristup je odbijen osim za admina (`admin` / `admin123`)

## Tehničke napomene
- Aplikacija koristi in-memory pohranu (poruke i sesije u memoriji). Podaci se resetiraju pri restartu servera.
- Za potrebe demonstracije, kolačić sesije je vidljiv JavaScriptu (`httpOnly: false`) kako bi se XSS utjecaj mogao jasno prikazati alertom s `document.cookie`.

## Rješavanje problema
- Port zauzet: Provjerite da ništa drugo ne koristi port 3000 ili postavite varijablu `PORT`, npr. `PORT=4000 npm start` i otvorite `http://localhost:4000`
- Prazna stranica / greška u konzoli: Osvježite stranicu i provjerite terminal log (`npm start`)
- Node verzija: Ako je vrlo stara, ažurirajte Node.js (npr. 18 LTS)

## Skripte
- `npm start` — pokreće server (production)
- `npm run dev` — development način s auto-restartom (nodemon)

## Struktura (sažetak)
- `server.js` — Express server, API i logika ranjivosti
- `public/index.html` — UI
- `public/app.js` — front-end logika, pozivi na API i prekidači ranjivosti
- `public/styles.css` — stilovi (tema crvena/bordo)
- `render.yaml` — konfiguracija za Render (cloud deployment)

Sretno s testiranjem! Ukoliko je potrebno, možete uključiti/isključiti ranjivosti i odmah vidjeti razliku u ponašanju aplikacije.
