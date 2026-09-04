// App-Smoke: jede Station × jede Sprache rendert ohne Konsolenfehler,
// Arabisch setzt dir=rtl, ?lang gewinnt ueber localStorage, Stuetz-Umschalter da.
import { build, preview } from 'vite';
import { chromium } from 'playwright-core';
import { resolveBrowser } from './resolveBrowser.mjs';
import { STATIONS } from '../src/data/stations.js';
import { LANGS, RTL } from '../src/i18n/index.js';
import de from '../src/i18n/de.js';

// Uebungstypen, die als eigene Komponente im DOM landen muessen, wenn STATIONS[sid].exercises
// einen Eintrag mit diesem type traegt (Task 10) -- 'predict' hat keine eigene .exercise-Klasse
// (AgentGrid) und bleibt darum aussen vor.
const EXERCISE_TYPES = ['parsons', 'match', 'fill', 'findbug'];

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
        // 750px = die iframe-Breite, mit der die Box die Stationen einbettet (Final-Review-Fix A).
        const page = await browser.newPage({ viewport: { width: 750, height: 900 } });
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
        // ConceptCard.jsx zeigt statt der BlockView (".blockview") ein Block-Bild (".blockimage"),
        // sobald eine Station blockImage traegt UND die passende PNG unter src/assets/blocks/
        // existiert (heute leer, daher faellt jede Station auf BlockView zurueck) -- beide Faelle
        // sind gueltig, nur "gar keine Blockdarstellung" ist ein Fehler.
        const blockCount = await page.locator('.blockview, .blockimage').count();
        if (blockCount === 0) throw new Error('weder .blockview noch .blockimage (Block-Ansicht fehlt)');
        // Final-Review-Fix A, Punkt 1: die gemessene Hoehe (scripts/measure-heights.mjs) darf bei
        // 750px Breite nicht ueberschritten werden, sonst schneidet die Box den Inhalt ab.
        const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        const maxHeight = STATIONS[sid].iframeHeight;
        if (scrollHeight > maxHeight) throw new Error(`Hoehe ${scrollHeight}px ueberschreitet iframeHeight ${maxHeight}px`);
        // Final-Review-Fix A, Punkt 2: ein deutscher Story-Absatz (Leit-Ebene, immer Deutsch) bleibt
        // bidi-sicher LTR, auch wenn die Seite bei Arabisch insgesamt dir="rtl" traegt.
        if (code === 'ar') {
          const bidi = await page.locator('.story p').first().evaluate((el) => {
            const cs = getComputedStyle(el);
            return { direction: cs.direction, unicodeBidi: cs.unicodeBidi };
          });
          if (bidi.direction !== 'ltr' && bidi.unicodeBidi !== 'plaintext') {
            throw new Error(`Story-Absatz nicht bidi-sicher: direction=${bidi.direction} unicode-bidi=${bidi.unicodeBidi}`);
          }
        }
        // Task 10: jede in STATIONS[sid].exercises deklarierte Uebung muss tatsaechlich im DOM
        // landen -- beweist, dass die Komponente dispatcht wurde, nicht nur, dass die Daten
        // dafuer existieren.
        const typesHere = [...new Set(STATIONS[sid].exercises.map((e) => e.type).filter((t) => EXERCISE_TYPES.includes(t)))];
        for (const type of typesHere) {
          const exCount = await page.locator('.exercise.' + type).count();
          if (exCount === 0) throw new Error(`Übung ${type} fehlt`);
        }
        // s07: Klick-Durchlauf der Zuordnung -- beweist die Interaktion im echten Browser, nicht
        // nur die statischen Daten. Block i gehoert immer zu Zeile i (Datenreihenfolge, siehe
        // MatchBlocksPython.jsx: nur die Anzeige der Zeilen ist deterministisch gemischt, die
        // data-testid der Zeile bleibt der Originalindex).
        // Erwartungstext ist immer de.ui.matchRight, NICHT die Uebersetzung der Seitensprache:
        // StationView.jsx reicht Uebungs-Komponenten nur `ui = de.ui` durch (nie `sui`), src/lib/
        // bilingual.js dokumentiert das als Entscheidung ("Buttons bleiben deutsch, Nachtrag Plan 2,
        // Entscheidung 2") -- matchRight/matchWrong sind Teil dieser Button-/Feedback-Ebene.
        // Gegenprobe gemacht: mit getBundle(code) FAILten s07 en/uk/ar/es/it (deutscher Text kam
        // an, obwohl die jeweils andere Sprache aktiv war) -- kein Uebungsdefekt, sondern exakt das
        // dokumentierte Verhalten.
        if (sid === 's07') {
          const matchExercise = STATIONS.s07.exercises.find((e) => e.type === 'match');
          for (let i = 0; i < matchExercise.pairs.length; i++) {
            await page.locator(`[data-testid="match-block-${i}"]`).click();
            await page.locator(`[data-testid="match-line-${i}"]`).click();
          }
          await page.locator('[data-testid="match-check"]').click();
          const status = await page.locator('[role="status"]').first().textContent();
          if (!status || !status.includes(de.ui.matchRight)) {
            throw new Error(`role=status "${status}" enthält nicht ui.matchRight "${de.ui.matchRight}"`);
          }
        }
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
