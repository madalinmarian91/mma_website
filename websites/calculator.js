(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MMA_WEBSITES_CALCULATOR = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const integer = (value) => Number.isInteger(value) && value >= 0 ? value : 0;

  function isCampaignActive(config, now) {
    const instant = now instanceof Date ? now : new Date(now || Date.now());
    if (Number.isNaN(instant.getTime())) return false;
    return instant.getTime() >= Date.parse(config.campaign.startsAt) && instant.getTime() <= Date.parse(config.campaign.endsAt);
  }

  function priceFor(item, active, standardKey, promotionalKey) {
    if (active && Number.isInteger(item[promotionalKey])) return item[promotionalKey];
    if (Number.isInteger(item[standardKey])) return item[standardKey];
    return null;
  }

  function calculateEstimate(config, selection, now) {
    const input = selection && typeof selection === 'object' ? selection : {};
    const campaignActive = isCampaignActive(config, now);
    const pkg = config.packages[input.packageId] || config.packages.landing;
    const requestedPages = Number.isInteger(input.pages) && input.pages > 0 ? input.pages : (pkg.pages || 1);
    const pages = pkg.pages ? Math.max(pkg.pages, requestedPages) : requestedPages;
    const details = [];
    const customQuote = [];
    let oneTime = 0;
    let monthly = 0;
    let annual = 0;

    if (pkg.customQuote) customQuote.push(pkg.label);
    else {
      const value = priceFor(pkg, campaignActive, 'standard', 'promotional');
      oneTime += integer(value);
      details.push({ id: pkg.id, label: pkg.label, cadence: 'one-time', amount: integer(value) });
    }

    if (pkg.pages && pages > pkg.pages) customQuote.push(`${pages - pkg.pages} pagini suplimentare`);

    const selectedExtras = Array.isArray(input.extras) ? Array.from(new Set(input.extras)) : [];
    selectedExtras.forEach((id) => {
      const item = config.extras[id];
      if (!item) return;
      if (item.customQuote) customQuote.push(item.label);
      else {
        const value = priceFor(item, campaignActive, 'standard', 'promotional');
        oneTime += integer(value);
        details.push({ id: item.id, label: item.label, cadence: 'one-time', amount: integer(value) });
      }
    });

    const maintenance = config.maintenance[input.maintenanceId] || config.maintenance.none;
    if (maintenance.id !== 'none') {
      const value = priceFor(maintenance, campaignActive, 'standardMonthly', 'promotionalMonthly');
      if (value === null || (maintenance.customQuoteOutsideCampaign && !campaignActive)) customQuote.push(maintenance.label);
      else {
        monthly += integer(value);
        details.push({ id: maintenance.id, label: maintenance.label, cadence: 'monthly', amount: integer(value) });
      }
    }

    const selectedAnnual = Array.isArray(input.annualServices) ? Array.from(new Set(input.annualServices)) : [];
    selectedAnnual.forEach((id) => {
      const item = config.annualServices[id];
      if (!item) return;
      const value = priceFor(item, campaignActive, 'standardAnnual', 'promotionalAnnual');
      if (item.customQuote || value === null || (item.customQuoteOutsideCampaign && !campaignActive)) customQuote.push(item.label);
      else {
        annual += integer(value);
        details.push({ id: item.id, label: item.label, cadence: 'annual', amount: integer(value) });
      }
    });

    return Object.freeze({
      packageId: pkg.id,
      packageLabel: pkg.label,
      pages,
      campaignActive,
      campaign: campaignActive ? config.campaign.name : null,
      oneTime,
      monthly,
      annual,
      customQuote: Object.freeze(customQuote),
      details: Object.freeze(details.map(Object.freeze)),
      isCompleteEstimate: customQuote.length === 0
    });
  }

  return Object.freeze({ isCampaignActive, calculateEstimate });
});
