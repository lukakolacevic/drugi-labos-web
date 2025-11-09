# Odgovor na projekt

## 1. Adresa javno dostupnog git repozitorija
```
[Upišite adresu vašeg GitHub/GitLab repozitorija]
Primjer: https://github.com/vasusername/web-security-vulnerabilities-demo
```

## 2. Adresa web-aplikacije
```
[Upišite adresu vaše deployane aplikacije]
Primjer: https://web-security-demo.onrender.com
```

## 3. Popis implementiranih ranjivosti
1. Cross-site scripting (XSS) - Stored XSS napad
2. Loša kontrola pristupa (Broken Access Control)

## 4. Napomene za svaku implementiranu ranjivost

### Cross-site scripting (XSS)
**Status:** Sve je uspješno implementirano

**Implementirane funkcionalnosti:**
- ✅ Funkcionalnost kojom se omogućuje ranjivost (korisnički unos se ne sanitizira)
- ✅ Funkcionalnost kojom se onemogućuje ranjivost (korisnički unos se escapira)
- ✅ Prekidač (checkbox) kojim se ranjivost uključuje i isključuje
- ✅ Napadi se mogu pokrenuti kroz sučelje web-aplikacije (unos poruke s JavaScript kodom)
- ✅ Učinak napada je vidljiv u korisničkom sučelju (JavaScript alert s cookie informacijama, izvršavanje koda u porukama)

**Opis implementacije:**
Kada je ranjivost uključena, korisnički unos se direktno ubacuje u HTML bez sanitizacije, što omogućava izvršavanje JavaScript koda. Kada je ranjivost isključena, svi HTML znakovi se escapiraju pomoću `escapeHtml()` funkcije, čime se sprječava izvršavanje malicioznog koda.

### Loša kontrola pristupa (Broken Access Control)
**Status:** Sve je uspješno implementirano

**Implementirane funkcionalnosti:**
- ✅ Funkcionalnost kojom se omogućuje ranjivost (provjerava se samo autentifikacija, ne i autorizacija)
- ✅ Funkcionalnost kojom se onemogućuje ranjivost (provjerava se i autentifikacija i autorizacija)
- ✅ Prekidač (checkbox) kojim se ranjivost uključuje i isključuje
- ✅ Napadi se mogu pokrenuti kroz sučelje web-aplikacije (prijava kao obični korisnik i pristup admin resursima)
- ✅ Učinak napada je vidljiv u korisničkom sučelju (prikaz svih korisnika kada obični korisnik pristupa admin panelu)

**Opis implementacije:**
Kada je ranjivost uključena, `/api/admin/users` endpoint provjerava samo je li korisnik prijavljen, ali ne provjerava ima li korisnik admin ulogu. To omogućava običnim korisnicima pristup admin resursima. Kada je ranjivost isključena, endpoint provjerava i autentifikaciju i autorizaciju, dopuštajući pristup samo korisnicima s admin ulogom.

## 5. Kratke upute kako pokrenuti i testirati aplikaciju

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
6. Isključite ranjivost i ponovite unos - HTML znakovi će biti escapirani i kod se neće izvršiti

### Testiranje Broken Access Control ranjivosti

1. Provjerite da je checkbox "Ranjivost uključena" označen za Broken Access Control sekciju
2. Prijavite se kao obični korisnik:
   - Korisničko ime: `user`
   - Lozinka: `user123`
3. Kliknite na gumb "Učitaj sve korisnike" u admin panelu
4. Kada je ranjivost uključena, obični korisnik će moći vidjeti sve korisnike (uključujući admina)
5. Isključite ranjivost i ponovite korake 2-3
6. Sada će se prikazati greška "Access denied. Admin role required." jer je autorizacija ispravno implementirana

