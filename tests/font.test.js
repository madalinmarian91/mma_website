const test = require('./harness.js');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('fontul local conține diacriticele românești', () => {
  const font = fs.readFileSync(path.join(root, 'assets/montserrat-complete.ttf'));
  const u16 = offset => font.readUInt16BE(offset);
  const u32 = offset => font.readUInt32BE(offset);
  let cmap;
  for (let i = 0; i < u16(4); i++) {
    const entry = 12 + i * 16;
    if (font.toString('ascii', entry, entry + 4) === 'cmap') cmap = u32(entry + 8);
  }
  assert.ok(cmap, 'Tabelul cmap lipsește');
  const tables = [];
  for (let i = 0; i < u16(cmap + 2); i++) {
    const entry = cmap + 4 + i * 8;
    const offset = cmap + u32(entry + 4);
    if ([0, 3].includes(u16(entry)) && [4, 12].includes(u16(offset))) tables.push(offset);
  }
  function hasGlyph(code) {
    return tables.some(offset => {
      if (u16(offset) === 12) {
        for (let i = 0; i < u32(offset + 12); i++) {
          const group = offset + 16 + i * 12;
          const first = u32(group), last = u32(group + 4), glyph = u32(group + 8);
          if (code >= first && code <= last && glyph + code - first !== 0) return true;
        }
      } else if (code <= 0xffff) {
        const count = u16(offset + 6) / 2;
        const ends = offset + 14, starts = ends + count * 2 + 2;
        const deltas = starts + count * 2, ranges = deltas + count * 2;
        for (let i = 0; i < count; i++) {
          const first = u16(starts + 2 * i), last = u16(ends + 2 * i);
          if (code < first || code > last) continue;
          const delta = u16(deltas + 2 * i), range = u16(ranges + 2 * i);
          let glyph = range === 0 ? (code + delta) & 0xffff : u16(ranges + 2 * i + range + 2 * (code - first));
          if (range && glyph) glyph = (glyph + delta) & 0xffff;
          if (glyph) return true;
        }
      }
      return false;
    });
  }
  for (const letter of 'ĂăÂâÎîȘșȚț') assert.ok(hasGlyph(letter.codePointAt(0)), `Lipsește caracterul ${letter}`);
});

test('paginile folosesc fontul complet pentru textul românesc', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const version = html.match(/class="site-version">Versiune (\d{4})\.(\d{2})\.(\d{2})\.(\d+)</);
  assert.ok(version, 'Versiunea site-ului lipsește');
  const cache = `${version[1]}${version[2]}${version[3]}-${version[4]}`;
  for (const file of ['redesign.css', 'websites/styles.css']) {
    const css = fs.readFileSync(path.join(root, file), 'utf8');
    assert.ok(css.includes(`montserrat-complete.ttf?v=${cache}`), `${file}: fontul nu corespunde versiunii`);
    assert.doesNotMatch(css, /montserrat\.woff2/);
  }
});
