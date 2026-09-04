// End-to-End in der Box. Voraussetzungen: Box laeuft, Kurs gebaut (registry.json), App-Dev-Server auf 3030.
import fs from 'node:fs';
import { chromium } from 'playwright-core';
import { resolveBrowser } from '../scripts/resolveBrowser.mjs';
import uk from '../src/i18n/uk.js';
import de from '../src/i18n/de.js';
import en from '../src/i18n/en.js';
import ar from '../src/i18n/ar.js';
import es from '../src/i18n/es.js';
import it from '../src/i18n/it.js';
import { buildCourseDef } from './course-def.mjs';
import { callTool, parseSectionModules } from './lib/mcp.mjs';
import { isOrderedSubsequence } from './lib/registry-ops.mjs';

const M = process.env.MOODLE_URL || 'http://localhost:8080';
const USER = process.env.MOODLE_USER || 'admin';
const PASS = process.env.MOODLE_PASS || 'KiKurs-Demo-2026';
const APP_BASE = process.env.APP_BASE || 'http://localhost:3030/code-welt/';
const reg = JSON.parse(fs.readFileSync(new URL('./registry.json', import.meta.url), 'utf8'))[process.env.REG_ENV || 'box'];

// Gleicher Aufbau wie build-course.mjs Schritt 4: die Soll-Reihenfolge je Abschnitt kommt aus
// derselben Kursdefinition, die auch das Bauskript verwendet -- kein zweiter, potenziell
// abweichender Ort fuer "was gehoert wohin".
const def = buildCourseDef({ bundles: { de, en, uk, ar, es, it }, appBase: APP_BASE });

const browser = await chromium.launch({ executablePath: resolveBrowser(), headless: true });
const page = await browser.newPage();
let failures = 0;
const check = (label, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${ok ? '' : ' ' + extra}`); if (!ok) failures++; };

try {
  // Aufwaerm-GET: der allererste Request gegen eine gerade gestartete Box antwortet manchmal
  // traege (PHP-Opcache/Session kalt) -- in Plan 1 dreimal Ursache eines transienten Erstlauf-
  // Fehlers. Die Antwort wird verworfen, zaehlt nicht als Check.
  await page.goto(`${M}/login/index.php`).catch(() => {});

  const login = async () => {
    await page.goto(`${M}/login/index.php`, { waitUntil: 'networkidle' });
    // logintoken ist ein type=hidden-Feld -- "visible" (Playwright-Default) wird es nie, und die
    // Seite traegt zwei davon (Login-Formular + ein zweites, z. B. fuer den Mobile-App-Link);
    // "attached" reicht als Beweis, dass das Formular fertig gerendert ist, .first() waehlt eindeutig.
    await page.waitForSelector('input[name="logintoken"]', { state: 'attached' });
    await page.fill('#username', USER);
    await page.fill('#password', PASS);
    await page.click('#loginbtn');
    await page.waitForLoadState('networkidle');
  };
  await login();
  let loginRetried = false;
  if (page.url().includes('/login/')) {
    loginRetried = true;
    await login();
  }
  if (loginRetried) console.log('  Hinweis: Login-Formular blieb beim ersten Versuch auf /login/, zweiter Versuch erfolgreich.');
  check('Login', !page.url().includes('/login/'), 'url ' + page.url());

  // Soll-Reihenfolge je Abschnitt (2 = Holz, 3 = Stein): CMIDs aus dem Register als geordnete
  // Teilfolge der tatsaechlichen Kursinhalte -- derselbe Beweis wie build-course.mjs Schritt 4,
  // hier nur gelesen statt durchgesetzt. Fehlt ein Registry-Key, wuerde ein stilles .filter()
  // ihn verschlucken und isOrderedSubsequence([], irgendwas) waere immer true (leeres "want" ist
  // per Definition erfuellt) -- also erst pruefen, ob alle Keys ueberhaupt eine CMID haben, und
  // bei Luecken laut FAILen statt einen verkuerzten (und damit trivial erfuellten) Vergleich zu
  // fahren.
  const contentsText = await callTool('moodle_get_course_contents', { courseId: reg.courseId });
  for (const [label, num] of [['Holz', 2], ['Stein', 3]]) {
    const section = def.sections.find((s) => s.num === num);
    const missing = section.items.filter((item) => typeof reg.items[item.key]?.cmid !== 'number').map((item) => item.key);
    if (missing.length > 0) {
      check(`Reihenfolge Abschnitt ${num} (${label})`, false, `fehlt im Register: ${missing.join(', ')}`);
      continue;
    }
    const want = section.items.map((item) => reg.items[item.key].cmid);
    const actual = parseSectionModules(contentsText, num);
    check(`Reihenfolge Abschnitt ${num} (${label})`, isOrderedSubsequence(want, actual?.cmids || []), `soll ${JSON.stringify(want)}, ist ${JSON.stringify(actual?.cmids || [])}`);
  }

  // Kursseite auf Ukrainisch
  await page.goto(`${M}/course/view.php?id=${reg.courseId}&lang=uk`, { waitUntil: 'networkidle' });
  const body = await page.locator('body').innerText();
  check('Abschnitt Holz auf uk', body.includes(uk.etappen.holz.name), `erwartet "${uk.etappen.holz.name}"`);
  const i = body.indexOf('{mlang');
  check('kein rohes {mlang}', i < 0, i >= 0 ? 'bei Index ' + i + ': …' + body.slice(Math.max(0, i - 80), i + 80).replace(/\s+/g, ' ') + '…' : '');
  // Gezielt auf die s02-Station filtern, nicht ".first()" -- die Seite traegt inzwischen sechs
  // Stationen, ".cw-station iframe" ohne Filter traf zuerst s01 (Reihenfolge im Abschnitt).
  const iframeSrc = await page.locator('.cw-station iframe[src*="station/s02"]').first().getAttribute('src').catch(() => null);
  check('iframe traegt ?lang=uk', !!iframeSrc && iframeSrc.includes('?lang=uk#/station/s02'), iframeSrc || '');

  // Forum "Fragen an Nour" (Abschnitt 0) -- gleiche Seite, noch geladen: ein sichtbarer Link auf
  // die registrierte CMID beweist, dass das Forum im Kurs steht und nicht versteckt ist.
  const forumCmid = reg.items['forum-nour']?.cmid;
  // ":visible" statt ".first().isVisible()": Boost hat den Aktivitaetslink zweimal im DOM (u. a.
  // im standardmaessig eingeklappten Kursindex-Drawer) -- ".first()" traf dort das unsichtbare
  // Duplikat und lieferte false, obwohl der Link im sichtbaren Kursinhalt existiert.
  const forumVisibleCount = forumCmid ? await page.locator(`a[href*="mod/forum/view.php?id=${forumCmid}"]:visible`).count() : 0;
  check('Forum sichtbar in Abschnitt 0', forumVisibleCount > 0, forumCmid ? `Link zu CMID ${forumCmid} nicht sichtbar gefunden (${forumVisibleCount} sichtbare Treffer)` : 'forum-nour fehlt im Register');

  // Boss-Check-Aufgabe (Abschnitt 2, Station s03) auf Ukrainisch
  const bossHolzCmid = reg.items['boss-holz']?.cmid;
  if (typeof bossHolzCmid !== 'number') {
    check('Boss-Check-Aufgabe auf uk', false, 'boss-holz fehlt im Register');
  } else {
    await page.goto(`${M}/mod/assign/view.php?id=${bossHolzCmid}&lang=uk`, { waitUntil: 'networkidle' });
    const bossBody = await page.locator('body').innerText();
    check('Boss-Check-Aufgabe auf uk', bossBody.includes(uk.stations.s03.bossCheck.title), `erwartet "${uk.stations.s03.bossCheck.title}"`);
  }

  // Quiz: Versuch starten, Frage lesen
  const quiz = reg.items['s02-quiz'];
  await page.goto(`${M}/mod/quiz/view.php?id=${quiz.cmid}&lang=uk`, { waitUntil: 'networkidle' });
  const startBtn = page.locator('form[action*="startattempt"] button, form[action*="startattempt"] input[type=submit]').first();
  if (await startBtn.count()) { await startBtn.click(); await page.waitForLoadState('networkidle'); }
  if (await page.locator('.qtext').count() === 0) {
    check('Quizfrage auf uk', false, 'kein .qtext gefunden (Versuch nicht gestartet? URL ' + page.url() + ')');
  } else {
    const qtext = await page.locator('.qtext').first().innerText();
    check('Quizfrage auf uk', qtext.includes(uk.stations.s02.quiz[0].q.slice(0, 20)) || qtext.includes(uk.stations.s02.quiz[1].q.slice(0, 20)) || qtext.includes(uk.stations.s02.quiz[2].q.slice(0, 20)) || qtext.includes(uk.stations.s02.quiz[3].q.slice(0, 20)), qtext.slice(0, 80));
    check('Quizfrage ohne Entity-Rohtext', !/&uuml;|&auml;|&ouml;|&szlig;/.test(qtext));
  }

  // Arabisch: RTL
  await page.goto(`${M}/course/view.php?id=${reg.courseId}&lang=ar`, { waitUntil: 'networkidle' });
  check('ar setzt dir=rtl', (await page.evaluate(() => document.documentElement.getAttribute('dir'))) === 'rtl');

  // Badge-Seite: beide Etappen-Badges (Holz, Stein) gelistet. Nicht auf den ganzen Seitentext
  // pruefen (der urspruengliche Check war vakuos -- "Holz"/"Stein" stehen als Abschnittsnamen
  // z. B. auch im Kursindex, wenn der irgendwo mitgerendert wird), sondern gezielt auf die
  // Badge-Namenslinks der Liste ("#region-main a[href*=overview.php]", je Badge genau einer, per
  // Snapshot der echten Seite verifiziert) -- und zusaetzlich die Anzahl dieser Links gegen 2
  // pruefen, damit weder "Badge fehlt" noch "es sind auf einmal drei" unbemerkt bliebe.
  await page.goto(`${M}/badges/view.php?type=2&id=${reg.courseId}&lang=de`, { waitUntil: 'networkidle' });
  const badgeLinks = page.locator('#region-main a[href*="overview.php"]');
  const badgeCount = await badgeLinks.count();
  const badgeText = (await badgeLinks.allTextContents()).join(' | ');
  const badgeExtra = `Badge-Eintraege: ${badgeCount} (erwartet 2), Namen: [${badgeText}]`;
  check('Badge Holz auf Badge-Seite', badgeCount === 2 && badgeText.includes(de.etappen.holz.badge.name), badgeExtra);
  check('Badge Stein auf Badge-Seite', badgeCount === 2 && badgeText.includes(de.etappen.stein.badge.name), badgeExtra);

  // Zurueck auf Deutsch, damit die Session sauber bleibt
  await page.goto(`${M}/course/view.php?id=${reg.courseId}&lang=de`);
} finally {
  await browser.close().catch(() => {});
}
console.log(failures ? `\n${failures} FAIL` : '\nBox-Smoke grün');
process.exit(failures ? 1 : 0);
