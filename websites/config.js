(function (root, factory) {
  const config = factory();
  if (typeof module === 'object' && module.exports) module.exports = config;
  if (root) root.MMA_WEBSITES_CONFIG = config;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  return Object.freeze({
    currency: 'RON',
    vat: Object.freeze({ label: 'Regim TVA', note: 'Valorile sunt afișate în lei. Regimul TVA se confirmă în oferta finală.' }),
    contact: Object.freeze({
      company: 'MMA Tech & Shop SRL',
      phoneDisplay: '0775 681 508',
      phoneInternational: '40775681508',
      email: 'contact@mmatech.ro',
      website: 'https://mmatech.ro/websites/'
    }),
    campaign: Object.freeze({
      id: 'black-friday-2026',
      name: 'Black Friday 2026',
      timezone: 'Europe/Bucharest',
      startsAt: '2026-10-31T22:00:00.000Z',
      endsAt: '2026-11-15T21:59:59.999Z',
      displayInterval: '1–15 noiembrie 2026'
    }),
    packages: Object.freeze({
      landing: Object.freeze({ id: 'landing', label: 'Landing Page', pages: 1, standard: 799, promotional: 599, description: 'O pagină de prezentare concentrată pe un obiectiv clar.' }),
      business: Object.freeze({ id: 'business', label: 'Site de prezentare', pages: 5, standard: 1499, promotional: 1199, description: 'Structură completă pentru prezentarea unei afaceri.' }),
      custom: Object.freeze({ id: 'custom', label: 'Dezvoltare web personalizată', pages: null, customQuote: true, description: 'Arhitectură și funcționalități analizate individual.' })
    }),
    pagePricing: Object.freeze({ includedByPackage: true, extraPage: Object.freeze({ id: 'extra-page', label: 'Pagină suplimentară', customQuote: true }) }),
    extras: Object.freeze({
      gallery: Object.freeze({ id: 'gallery', label: 'Galerie foto', standard: 100, promotional: 79 }),
      blog: Object.freeze({ id: 'blog', label: 'Blog', standard: 200, promotional: 159 }),
      customFeature: Object.freeze({ id: 'custom-feature', label: 'Funcționalitate personalizată', customQuote: true })
    }),
    maintenance: Object.freeze({
      none: Object.freeze({ id: 'none', label: 'Fără mentenanță', monthly: 0 }),
      basic: Object.freeze({ id: 'basic', label: 'Mentenanță Basic', standardMonthly: null, promotionalMonthly: 119, customQuoteOutsideCampaign: true })
    }),
    annualServices: Object.freeze({
      hosting: Object.freeze({ id: 'hosting', label: 'Hosting administrat', standardAnnual: null, promotionalAnnual: 399, customQuoteOutsideCampaign: true }),
      domain: Object.freeze({ id: 'domain', label: 'Administrare domeniu', customQuote: true })
    })
  });
});
