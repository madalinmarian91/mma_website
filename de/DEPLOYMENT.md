# MMA Tech Germania — deployment manual

## Organizare

Site-ul este static și independent. `build.cjs` generează cele șapte pagini HTML, `robots.txt` și `sitemap.xml` în acest director; `assets/` conține fontul, logo-ul original, imaginile, CSS-ul și JavaScript-ul local. Paginile de producție sunt `index.html`, directoarele `leistungen/`, `projekte/`, `ueber-uns/`, `kontakt/`, `impressum/`, `datenschutz/`, plus `assets/`, `robots.txt` și `sitemap.xml`. Nu este necesar Node.js pe hosting.

## Înainte de publicare

1. Confirmați denumirea juridică exactă MMA Tech & Shop SRL. Completați în `build.cjs`, în paginile Impressum și Datenschutz, sediul juridic complet din România, persoana împuternicită, registrul și numărul de înregistrare, respectiv codul TVA dacă este aplicabil. Textul existent este un **draft incomplet**, nu o declarație juridică finală.
2. Alegeți hostingul și verificați cu un specialist textele juridice, inclusiv furnizorul, destinatarii datelor, logurile de server, perioadele de stocare, temeiurile legale și drepturile persoanelor vizate. Datele din [§ 5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html) și [GDPR](https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679) trebuie evaluate pentru situația firmei.
3. Lista de tehnologii provine din cerința proiectului; confirmați competențele afișate. Capturile de portofoliu sunt decupaje din imaginile existente; verificați permisiunea de utilizare.
4. Adresa `kontakt@mmatech.de` este adresa de contact indicată pentru site-ul german. Numărul `+40 775 681 508` provine din site-ul existent; verificați că este activ și potrivit pentru solicitări în limba germană.

## Build și arhivare

Din PowerShell, în directorul `de`:

```powershell
node build.cjs
Compress-Archive -LiteralPath index.html,assets,leistungen,projekte,ueber-uns,kontakt,impressum,datenschutz,robots.txt,sitemap.xml -DestinationPath deploy/mmatech-de-deploy.zip -Force
```

Node.js este necesar numai pentru regenerarea paginilor. Modificați textele în `build.cjs` și stilurile în `assets/style.css`, apoi regenerați paginile și arhiva. La fiecare actualizare schimbați `version` din `build.cjs`: aceeași versiune apare în footer și în adresele CSS și JavaScript, pentru actualizarea resurselor din cache. Nu includeți `build.cjs`, documentația, testele sau directorul `deploy` în ZIP. Fișierele HTML generate pot fi și editate direct, dar o rulare ulterioară a generatorului le va suprascrie.

## Încărcare pe hosting

1. Asigurați-vă că `mmatech.de` indică spre hostingul dorit și activați HTTPS.
2. Extrageți conținutul arhivei în document root-ul domeniului (de exemplu `public_html`, în funcție de furnizor). `index.html` și `assets/` trebuie să se afle direct în această rădăcină, nu în `de/`.
3. Hostingul trebuie să servească `index.html` ca document implicit atât la rădăcină, cât și în subdirectoare. Nu este necesar backend, runtime sau configurare pentru CSS, JS și fonturi. Resursele și linkurile interne folosesc căi relative, ceea ce permite și testarea într-un subdirector. Adresele canonical, Open Graph și sitemap rămân configurate pentru `https://mmatech.de/`, destinația finală.

## Formular și protecție antispam

Formularul validează câmpurile și deschide aplicația de e-mail implicită, cu mesajul precompletat către `kontakt@mmatech.de`. Vizitatorul trebuie să trimită manual mesajul. Nu există endpoint sau transmitere automată. Este disponibil și linkul direct de e-mail; fără un client configurat, vizitatorul poate copia adresa. Un câmp ascuns reduce trimiterile automate prin formular, dar nu protejează adresa publică de spam. Activați filtrarea antispam la furnizorul de e-mail. Dacă doriți ulterior un formular care trimite de pe server, configurați un serviciu sau backend separat, protecție antispam și textele GDPR aferente; nu sunt incluse credențiale și nu se folosește backend-ul site-ului românesc.

## Verificare după publicare

Deschideți toate paginile și legăturile pe desktop și mobil; verificați meniul, imaginile, tastatura, formularul cu un client de e-mail configurat, linkurile de telefon și e-mail, HTTPS, `robots.txt`, `sitemap.xml`, canonical și paginile legale completate. Trimiteți o solicitare de probă și confirmați primirea. Actualizările se fac în acest director și se încarcă doar în document root-ul `mmatech.de`.
