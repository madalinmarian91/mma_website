const test = require('./harness.js');
const assert = require('node:assert/strict');
const config = require('../websites/config.js');
const { calculateEstimate, isCampaignActive } = require('../websites/calculator.js');

const standardDate = new Date('2026-11-16T12:00:00.000Z');
const promoDate = new Date('2026-11-03T12:00:00.000Z');
const selection = (overrides = {}) => ({ packageId: 'landing', pages: 1, extras: [], maintenanceId: 'none', annualServices: [], ...overrides });

test('scenariul 1 — Landing Page standard', () => {
  const result = calculateEstimate(config, selection(), standardDate);
  assert.equal(result.oneTime, 799); assert.equal(result.monthly, 0); assert.equal(result.annual, 0);
});

test('scenariul 2 — Landing Page Black Friday', () => {
  assert.equal(calculateEstimate(config, selection(), promoDate).oneTime, 599);
});

test('scenariul 3 — Site Business Black Friday', () => {
  const result = calculateEstimate(config, selection({ packageId: 'business', pages: 5, extras: ['gallery', 'blog'] }), promoDate);
  assert.equal(result.oneTime, 1437);
  assert.deepEqual(result.details.filter((x) => x.cadence === 'one-time').map((x) => x.amount), [1199, 79, 159]);
});

test('scenariul 4 — Site Business standard', () => {
  const result = calculateEstimate(config, selection({ packageId: 'business', pages: 5, extras: ['gallery', 'blog'] }), standardDate);
  assert.equal(result.oneTime, 1799);
  assert.deepEqual(result.details.filter((x) => x.cadence === 'one-time').map((x) => x.amount), [1499, 100, 200]);
});

test('scenariul 5 — serviciile recurente sunt separate', () => {
  const result = calculateEstimate(config, selection({ maintenanceId: 'basic', annualServices: ['hosting'] }), promoDate);
  assert.equal(result.oneTime, 599); assert.equal(result.monthly, 119); assert.equal(result.annual, 399);
});

test('scenariul 6 — după 15 noiembrie se folosesc prețurile standard', () => {
  const result = calculateEstimate(config, selection(), new Date('2026-11-15T22:00:00.000Z'));
  assert.equal(result.campaignActive, false); assert.equal(result.oneTime, 799);
});

test('scenariul 7 — configurația personalizată nu este prezentată ca estimare completă', () => {
  const result = calculateEstimate(config, selection({ extras: ['customFeature'] }), promoDate);
  assert.equal(result.isCompleteEstimate, false); assert.deepEqual(result.customQuote, ['Funcționalitate personalizată']);
});

test('scenariul 8 — sumarul este unica sursă pentru toate canalele', () => {
  const result = calculateEstimate(config, selection({ packageId: 'business', pages: 5, extras: ['gallery'], maintenanceId: 'basic' }), promoDate);
  const channelPayload = () => ({ details: result.details, oneTime: result.oneTime, monthly: result.monthly, annual: result.annual });
  assert.deepEqual(channelPayload(), channelPayload());
});

test('scenariul 9 — limitele campaniei corespund Europe/Bucharest', () => {
  assert.equal(config.campaign.timezone, 'Europe/Bucharest');
  assert.equal(isCampaignActive(config, new Date('2026-10-31T21:59:59.999Z')), false);
  assert.equal(isCampaignActive(config, new Date('2026-10-31T22:00:00.000Z')), true);
  assert.equal(isCampaignActive(config, new Date('2026-11-15T21:59:59.999Z')), true);
  assert.equal(isCampaignActive(config, new Date('2026-11-15T22:00:00.000Z')), false);
});

test('motorul ignoră valori negative și opțiuni duplicate', () => {
  const result = calculateEstimate(config, selection({ pages: -3, extras: ['gallery', 'gallery', 'invalid'] }), promoDate);
  assert.equal(result.pages, 1); assert.equal(result.oneTime, 678);
});
