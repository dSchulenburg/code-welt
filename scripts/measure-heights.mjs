// Misst die gerenderte Hoehe jeder Station in allen sechs Sprachen bei 750px Breite
// (das ist die iframe-Breite, mit der die Box die Stationen einbettet). Grundlage fuer
// STATIONS[sid].iframeHeight in src/data/stations.js: Maximum ueber alle Sprachen + 15%,
// auf 50 gerundet (Final-Review-Fix A, Punkt 1 — ersetzt die geschaetzte Arabisch-x1.1-Regel).
import { build, preview } from 'vite';
import { chromium } from 'playwright-core';
import { resolveBrowser } from './resolveBrowser.mjs';
import { STATIONS } from '../src/data/stations.js';
import { LANGS } from '../src/i18n/index.js';

const PORT = 4173;
const BASE = `http://localhost:${PORT}/code-welt/`;
const WIDTH = 750;

await build({ logLevel: 'error' });
const server = await preview({ preview: { port: PORT, strictPort: true }, logLevel: 'error' });
let browser = null;
const results = {}; // sid -> { code: scrollHeight }

try {
  browser = await chromium.launch({ executablePath: resolveBrowser(), headless: true });
  for (const sid of Object.keys(STATIONS)) {
    results[sid] = {};
    for (const { code } of LANGS) {
      const page = await browser.newPage({ viewport: { width: WIDTH, height: 1000 } });
      await page.goto(`${BASE}?lang=${code}#/station/${sid}`, { waitUntil: 'networkidle' });
      // Die Block-Ansicht (SVG, ".blockview") oder ein Block-Bild (".blockimage") ist die
      // hoechste Einzelkomponente der Seite und laedt asynchron (import.meta.glob-Bild oder
      // Layout-Berechnung) — erst danach ist scrollHeight verlaesslich.
      await page.waitForSelector('.blockview, .blockimage');
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      results[sid][code] = height;
      await page.close();
    }
  }
} finally {
  if (browser) await browser.close().catch(() => {});
  await server.close().catch(() => {});
}

const codes = LANGS.map((l) => l.code);
const round50 = (n) => Math.round(n / 50) * 50;

console.log(`Gemessen bei ${WIDTH}px Breite:\n`);
console.log(['Station', ...codes, 'max', 'empfohlen (+15%, auf 50 gerundet)'].join('\t'));
for (const sid of Object.keys(STATIONS)) {
  const row = results[sid];
  const max = Math.max(...codes.map((c) => row[c]));
  const empfohlen = round50(max * 1.15);
  console.log([sid, ...codes.map((c) => row[c]), max, empfohlen].join('\t'));
}
