# Redesign MMA Tech 2026

## Arhitectură și identitate

Site static HTML, CSS și JavaScript, fără proces de build sau dependențe de runtime. Paginile sunt `/`, `/websites/` și `/smart-systems/`. `redesign.css` conține stilurile comune, iar `carousel.js` controlează caruselul; logica existentă pentru formulare și WhatsApp rămâne în scripturile originale. Stilurile anterioare Websites se păstrează pentru componentele paginii.

Logo-ul `assets/logo.png` este fișierul original. Culorile de bază reutilizate din proiect includ `#084e32`, `#0c6544`, `#101914`, `#f7faf7` și `#e99d4e`; fontul este Montserrat, local. Canonical, datele structurate și robots.txt sunt păstrate; sitemap-ul corespunde paginilor existente. Au fost actualizate descrierile care menționau servicii eliminate din oferta publică.

## Imagini

Cele trei imagini ilustrative din `assets/hero-software-v2.webp`, `assets/hero-web-v2.webp` și `assets/hero-smart-v2.webp` au fost generate cu instrumentul AI integrat și convertite local în WebP. Portofoliul folosește capturile existente ale proiectelor reale.

Prompturi folosite, fără text sau logo în imagine:

- Software: spațiu contemporan de lucru pentru software engineering, monitoare cu interfețe abstracte, interior închis, accente verde închis, compoziție largă cu spațiu pentru text.
- Websites: monitor, laptop și telefon cu interfețe web abstracte într-un studio întunecat, accente verzi, fără reprezentarea unui proiect real.
- Smart Systems: interior rezidențial modern la apus, iluminat ambiental și termostat discret, fotografie arhitecturală, compoziție largă cu spațiu pentru text.

## Localizare

Stilurile comune sunt reutilizabile pentru o viitoare versiune germană, dar textele rămân în HTML; un sistem complet de traduceri și versiunea germană nu sunt implementate. Nu există promisiuni de instalare Smart Systems în Germania.

## Rulare și verificare

Din directorul proiectului, rulează `python -m http.server 8000` și deschide `http://localhost:8000/`. Testele se rulează cu `npm test`, iar verificarea sintaxei cu `npm run check`.

Core Web Vitals nu au fost măsurate cu Lighthouse sau date reale de teren. Funcționalitatea WhatsApp pregătește un mesaj, fără trimitere automată.
