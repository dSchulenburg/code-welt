// App-Smoke: jede Station × jede Sprache rendert ohne Konsolenfehler,
// Arabisch setzt dir=rtl, ?lang gewinnt ueber localStorage, Stuetz-Umschalter da.
import { build, preview } from 'vite';
import { chromium } from 'playwright-core';
import { resolveBrowser } from './resolveBrowser.mjs';
import { STATIONS } from '../src/data/stations.js';
import { LANGS, RTL } from '../src/i18n/index.js';

const PORT = 4173;
const BASE = `http://localhost:${PORT}/code-welt/`;

await build({ logLevel: 'error' });
const server = await preview({ preview: { port: PORT, strictPort: true }, logLevel: 'error' });
let browser = null;
let failures = 0;

async function check(label, fn) {
  try { await fn(); console.log(`PASS ${label}`); }
  catch (e) { failures++; console.log(`FAIL ${label}: ${e.message}`); }
}

try {
  browser = await chromium.launch({ executablePath: resolveBrowser(), headless: true });

  for (const sid of Object.keys(STATIONS)) {
    for (const { code } of LANGS) {
      await check(`${sid} ${code}`, async () => {
        const page = await browser.newPage();
        const errors = [];
        page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
        page.on('pageerror', (e) => errors.push(e.message));
        // Erst die Origin laden, dann eine andere Sprache in localStorage legen: ?lang muss trotzdem gewinnen.
        await page.goto(BASE, { waitUntil: 'networkidle' });
        await page.evaluate(() => localStorage.setItem('code-welt:lang', 'es'));
        await page.goto(`${BASE}?lang=${code}#/station/${sid}`, { waitUntil: 'networkidle' });
        const dir = await page.evaluate(() => document.documentElement.getAttribute('dir'));
        if (dir !== (RTL.has(code) ? 'rtl' : 'ltr')) throw new Error(`dir=${dir}`);
        const lang = await page.evaluate(() => document.documentElement.getAttribute('lang'));
        if (lang !== code) throw new Error(`lang=${lang} (?lang muss gewinnen)`);
        if (!(await page.locator('h1').first().textContent())) throw new Error('kein h1');
        const supportBtn = await page.locator('.btn-support').count();
        if (code === 'de' ? supportBtn !== 0 : supportBtn !== 1) throw new Error(`Stuetz-Umschalter: ${supportBtn}`);
        if (errors.length) throw new Error(errors.join(' | '));
        await page.close();
      });
    }
  }
} finally {
  if (browser) await browser.close().catch(() => {});
  await server.close().catch(() => {});
}

console.log(failures ? `\n${failures} FAIL` : '\nalle grün');
process.exit(failures ? 1 : 0);
