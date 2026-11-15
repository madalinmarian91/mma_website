const test = require('./harness.js');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('navigația leagă homepage, Websites și Smart Systems', () => {
  const home = read('index.html'); const websites = read('websites/index.html');
  assert.match(home, /href="websites\/"/);
  assert.match(websites, /href="\.\.\/smart-systems\/"/); assert.match(websites, /href="\.\.\/#contact"/);
});

test('meniul evidențiază secțiunea sau pagina curentă', () => {
  const makeLink = href => ({href, attrs:{}, setAttribute(k,v){this.attrs[k]=v;}, removeAttribute(k){delete this.attrs[k];}});
  const services = makeLink('https://example.test/#servicii');
  const portfolio = makeLink('https://example.test/#proiecte');
  const websites = makeLink('https://example.test/websites/');
  const links = [services, portfolio, websites];
  const listeners = {};
  const window = {location:{href:'https://example.test/#servicii'},addEventListener(name,handler){listeners[name]=handler;}};
  vm.runInNewContext(read('navigation-active.js'),{document:{querySelectorAll:()=>links},window,URL});
  assert.equal(services.attrs['aria-current'],'location');
  window.location.href='https://example.test/#proiecte'; listeners.hashchange();
  assert.equal(services.attrs['aria-current'],undefined); assert.equal(portfolio.attrs['aria-current'],'location');
  window.location.href='https://example.test/websites/'; listeners.hashchange();
  assert.equal(portfolio.attrs['aria-current'],undefined); assert.equal(websites.attrs['aria-current'],'page');
});

test('toate paginile noi au un singur H1, canonical și descriere', () => {
  ['index.html', 'websites/index.html', 'smart-systems/index.html'].forEach((file) => {
    const html = read(file);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, file);
    assert.match(html, /rel="canonical"/, file); assert.match(html, /name="description"/, file);
  });
});

test('versiunea din footer corespunde versiunii CSS și JavaScript', () => {
  for (const file of ['index.html', 'websites/index.html', 'smart-systems/index.html']) {
    const html = read(file);
    const match = html.match(/class="site-version">Versiune (\d{4})\.(\d{2})\.(\d{2})\.(\d+)</);
    assert.ok(match, `${file}: versiunea lipsește`);
    const version = `${match[1]}${match[2]}${match[3]}-${match[4]}`;
    const assets = [...html.matchAll(/(?:href|src)="([^"]+\.(?:css|js)(?:\?[^"]*)?)"/g)];
    assert.ok(assets.length > 0, `${file}: nu există CSS sau JavaScript`);
    for (const [, asset] of assets) assert.ok(asset.endsWith(`?v=${version}`), `${file}: ${asset}`);
  }
});
