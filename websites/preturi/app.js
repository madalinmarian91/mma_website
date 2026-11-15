(() => {
  'use strict';
  const config = window.MMA_WEBSITES_CONFIG;
  const calculator = window.MMA_WEBSITES_CALCULATOR;
  const form = document.querySelector('#config-form');
  if (!config || !calculator || !form) return;

  const money = (value) => `${new Intl.NumberFormat('ro-RO').format(value)} lei`;
  const safePageCount = (value) => Math.min(50, Math.max(1, Number.parseInt(value, 10) || 1));
  let currentSelection;
  let currentEstimate;

  function selectionFromForm() {
    const data = new FormData(form);
    return {
      packageId: String(data.get('package') || 'landing'),
      pages: safePageCount(data.get('pages')),
      extras: data.getAll('extras').map(String),
      maintenanceId: String(data.get('maintenance') || 'none'),
      annualServices: data.getAll('annual').map(String)
    };
  }

  function applySelection(selection) {
    const pkg = form.querySelector(`[name="package"][value="${CSS.escape(selection.packageId || 'landing')}"]`);
    if (pkg) pkg.checked = true;
    form.elements.pages.value = safePageCount(selection.pages);
    form.querySelectorAll('[name="extras"]').forEach((el) => { el.checked = (selection.extras || []).includes(el.value); });
    const maintenance = form.querySelector(`[name="maintenance"][value="${CSS.escape(selection.maintenanceId || 'none')}"]`);
    if (maintenance) maintenance.checked = true;
    form.querySelectorAll('[name="annual"]').forEach((el) => { el.checked = (selection.annualServices || []).includes(el.value); });
  }

  function readUrl() {
    const params = new URLSearchParams(location.search);
    const allowedPackages = Object.keys(config.packages);
    const allowedExtras = Object.keys(config.extras);
    const allowedAnnual = Object.keys(config.annualServices);
    return {
      packageId: allowedPackages.includes(params.get('tip')) ? params.get('tip') : 'landing',
      pages: safePageCount(params.get('pagini')),
      extras: (params.get('extra') || '').split(',').filter((id) => allowedExtras.includes(id)),
      maintenanceId: Object.hasOwn(config.maintenance, params.get('mentenanta')) ? params.get('mentenanta') : 'none',
      annualServices: (params.get('anual') || '').split(',').filter((id) => allowedAnnual.includes(id))
    };
  }

  function saveUrl(selection) {
    const params = new URLSearchParams();
    params.set('tip', selection.packageId); params.set('pagini', String(selection.pages));
    if (selection.extras.length) params.set('extra', selection.extras.join(','));
    if (selection.maintenanceId !== 'none') params.set('mentenanta', selection.maintenanceId);
    if (selection.annualServices.length) params.set('anual', selection.annualServices.join(','));
    history.replaceState(null, '', `${location.pathname}?${params}`);
  }

  function addSummaryLine(container, label, amount, suffix) {
    const row = document.createElement('div'); row.className = 'summary-line';
    const name = document.createElement('span'); name.textContent = label;
    const price = document.createElement('strong'); price.textContent = `${money(amount)}${suffix || ''}`;
    row.append(name, price); container.append(row);
  }

  function render() {
    currentSelection = selectionFromForm();
    form.elements.pages.value = currentSelection.pages;
    currentEstimate = calculator.calculateEstimate(config, currentSelection, new Date());
    const lines = document.querySelector('#summary-lines'); lines.replaceChildren();
    currentEstimate.details.forEach((item) => addSummaryLine(lines, item.label, item.amount, item.cadence === 'monthly' ? '/lună' : item.cadence === 'annual' ? '/an' : ''));
    const pages = document.createElement('div'); pages.className = 'summary-line';
    const pagesLabel = document.createElement('span'); pagesLabel.textContent = 'Număr de pagini';
    const pagesValue = document.createElement('strong'); pagesValue.textContent = String(currentEstimate.pages);
    pages.append(pagesLabel, pagesValue); lines.append(pages);
    document.querySelector('#total-once').textContent = money(currentEstimate.oneTime);
    document.querySelector('#total-monthly').textContent = `${money(currentEstimate.monthly)}/lună`;
    document.querySelector('#total-annual').textContent = `${money(currentEstimate.annual)}/an`;
    document.querySelector('#mobile-once').textContent = money(currentEstimate.oneTime);
    const warning = document.querySelector('#custom-warning');
    warning.classList.toggle('is-visible', currentEstimate.customQuote.length > 0);
    warning.textContent = currentEstimate.customQuote.length ? `Necesită ofertă personalizată: ${currentEstimate.customQuote.join(', ')}. Totalul afișat nu include aceste opțiuni.` : '';
    const banner = document.querySelector('#promo-banner'); banner.classList.toggle('is-active', currentEstimate.campaignActive);
    banner.textContent = currentEstimate.campaignActive ? `${config.campaign.name} este activă · ${config.campaign.displayInterval}. Prețurile promoționale sunt aplicate automat.` : '';
    saveUrl(currentSelection);
  }

  function estimateText() {
    const lines = currentEstimate.details.map((item) => `• ${item.label}: ${money(item.amount)}${item.cadence === 'monthly' ? '/lună' : item.cadence === 'annual' ? '/an' : ''}`);
    return [
      'Bună ziua! Doresc să discutăm această configurație MMA Tech Websites.', '',
      `Tip website: ${currentEstimate.packageLabel}`, `Număr de pagini: ${currentEstimate.pages}`,
      ...lines, '', `Cost unic estimat: ${money(currentEstimate.oneTime)}`,
      `Cost lunar: ${money(currentEstimate.monthly)}/lună`, `Cost anual: ${money(currentEstimate.annual)}/an`,
      currentEstimate.campaign ? `Campanie activă: ${currentEstimate.campaign}` : '',
      currentEstimate.customQuote.length ? `Necesită ofertă personalizată: ${currentEstimate.customQuote.join(', ')}` : '',
      '', `Configurație: ${location.href}`
    ].filter(Boolean).join('\n');
  }

  function openWhatsApp() {
    window.open(`https://wa.me/${config.contact.phoneInternational}?text=${encodeURIComponent(estimateText())}`, '_blank', 'noopener,noreferrer');
  }

  function uniqueReference() {
    const key = 'mma-websites-estimate-sequence';
    let sequence = 1;
    try { sequence = Math.max(1, Number.parseInt(localStorage.getItem(key), 10) + 1 || 1); localStorage.setItem(key, String(sequence)); } catch (_) {}
    const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    return `EST-${stamp}-${String(sequence).padStart(3, '0')}`;
  }

  function createElement(doc, tag, text, className) {
    const element = doc.createElement(tag); if (text !== undefined) element.textContent = text; if (className) element.className = className; return element;
  }

  function downloadPdf() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert('Permite ferestrele pop-up pentru a genera estimarea PDF.'); return; }
    printWindow.opener = null;
    const doc = printWindow.document; doc.title = 'Estimare cost dezvoltare website';
    const meta = doc.createElement('meta'); meta.setAttribute('charset', 'utf-8'); doc.head.append(meta);
    const style = doc.createElement('style'); style.textContent = `@font-face{font-family:Montserrat;src:url('${new URL('../../assets/montserrat-complete.ttf',location.href)}')}@page{size:A4;margin:16mm}*{box-sizing:border-box}body{font-family:Montserrat,Arial,sans-serif;color:#101512;margin:0;font-size:12px;line-height:1.5}header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #084e32;padding-bottom:18px}header img{width:210px}h1{font-size:25px;margin:28px 0 8px}.meta{color:#526159}.section{margin-top:24px}.section h2{font-size:14px;color:#084e32;border-bottom:1px solid #dbe5df;padding-bottom:6px}.row{display:flex;justify-content:space-between;gap:20px;padding:7px 0;border-bottom:1px solid #edf2ef}.totals{margin-top:18px;border:2px solid #084e32;padding:14px}.total{display:flex;justify-content:space-between;font-size:15px;padding:5px}.warning{background:#fff3df;padding:10px;margin-top:12px}.notice{margin-top:30px;padding:15px;background:#f2f7f4;border-left:4px solid #084e32}.contact{margin-top:28px;color:#526159}a{color:#084e32}@media print{button{display:none}}`; doc.head.append(style);
    const header = doc.createElement('header'); const logo = doc.createElement('img'); logo.src = new URL('../assets/logo-websites.svg', location.href).href; logo.alt = 'MMA Tech Websites'; const metaBox = createElement(doc, 'div'); metaBox.append(createElement(doc, 'strong', uniqueReference()), createElement(doc, 'div', 'Referință locală a estimării'), createElement(doc, 'div', new Intl.DateTimeFormat('ro-RO', { dateStyle: 'long' }).format(new Date()))); header.append(logo, metaBox); doc.body.append(header);
    doc.body.append(createElement(doc, 'h1', 'Estimare cost dezvoltare website'), createElement(doc, 'p', `${currentEstimate.packageLabel} · ${currentEstimate.pages} pagini`, 'meta'));
    const section = createElement(doc, 'section', undefined, 'section'); section.append(createElement(doc, 'h2', 'Configurația selectată'));
    currentEstimate.details.forEach((item) => { const row = createElement(doc, 'div', undefined, 'row'); row.append(createElement(doc, 'span', item.label), createElement(doc, 'strong', `${money(item.amount)}${item.cadence === 'monthly' ? '/lună' : item.cadence === 'annual' ? '/an' : ''}`)); section.append(row); }); doc.body.append(section);
    if (currentEstimate.campaign) doc.body.append(createElement(doc, 'p', `Campanie activă: ${currentEstimate.campaign} (${config.campaign.displayInterval})`, 'warning'));
    if (currentEstimate.customQuote.length) doc.body.append(createElement(doc, 'p', `Necesită ofertă personalizată: ${currentEstimate.customQuote.join(', ')}. Totalul nu include aceste opțiuni.`, 'warning'));
    const totals = createElement(doc, 'div', undefined, 'totals'); [['Cost unic estimat', money(currentEstimate.oneTime)], ['Cost lunar', `${money(currentEstimate.monthly)}/lună`], ['Cost anual', `${money(currentEstimate.annual)}/an`]].forEach(([label,value]) => { const row = createElement(doc, 'div', undefined, 'total'); row.append(createElement(doc, 'span', label), createElement(doc, 'strong', value)); totals.append(row); }); doc.body.append(totals);
    doc.body.append(createElement(doc, 'p', 'Acest document reprezintă o estimare orientativă, nu o ofertă contractuală fermă. Prețul final și termenul de livrare vor fi confirmate după analiza cerințelor proiectului.', 'notice'));
    const contact = createElement(doc, 'div', undefined, 'contact'); contact.append(createElement(doc, 'strong', config.contact.company), createElement(doc, 'div', `${config.contact.phoneDisplay} · ${config.contact.email}`)); const link = createElement(doc, 'a', config.contact.website); link.href = config.contact.website; contact.append(link); doc.body.append(contact);
    logo.addEventListener('load', () => setTimeout(() => { printWindow.focus(); printWindow.print(); }, 250), { once: true });
    setTimeout(() => { if (!logo.complete) return; printWindow.focus(); printWindow.print(); }, 800);
  }

  form.addEventListener('input', render); form.addEventListener('change', (event) => { if (event.target.name === 'package') { const pkg = config.packages[event.target.value]; form.elements.pages.value = pkg.pages || 1; } render(); });
  document.querySelector('#whatsapp-button').addEventListener('click', openWhatsApp); document.querySelector('#mobile-whatsapp').addEventListener('click', openWhatsApp); document.querySelector('#pdf-button').addEventListener('click', downloadPdf);
  applySelection(readUrl()); render();
})();
