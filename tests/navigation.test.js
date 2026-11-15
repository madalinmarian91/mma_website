const test = require('./harness.js');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('scenariul 10 — navigația leagă homepage, Websites, configurator și Smart Systems', () => {
  const home = read('index.html'); const websites = read('websites/index.html'); const pricing = read('websites/preturi/index.html');
  assert.match(home, /href="websites\/"/);
  assert.match(websites, /href="preturi\/"/); assert.match(websites, /href="\.\.\/smart-systems\/"/);
  assert.match(pricing, /href="\.\.\/"/); assert.match(pricing, /href="\.\.\/\.\.\/smart-systems\/"/); assert.match(pricing, /href="\.\.\/\.\.\/"/);
});

test('toate paginile noi au un singur H1, canonical și descriere', () => {
  ['websites/index.html', 'websites/preturi/index.html'].forEach((file) => {
    const html = read(file);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, file);
    assert.match(html, /rel="canonical"/, file); assert.match(html, /name="description"/, file);
  });
});
