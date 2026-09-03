// End-to-End in der Box. Voraussetzungen: Box laeuft, Kurs gebaut (registry.json), App-Dev-Server auf 3030.
import fs from 'node:fs';
import { chromium } from 'playwright-core';
import { resolveBrowser } from '../scripts/resolveBrowser.mjs';
import uk from '../src/i18n/uk.js';

const M = process.env.MOODLE_URL || 'http://localhost:8080';
const USER = process.env.MOODLE_USER || 'admin';
const PASS = process.env.MOODLE_PASS || 'KiKurs-Demo-2026';
const reg = JSON.parse(fs.readFileSync(new URL('./registry.json', import.meta.url), 'utf8'))[process.env.REG_ENV || 'box'];

const browser = await chromium.launch({ executablePath: resolveBrowser(), headless: true });
const page = await browser.newPage();
let failures = 0;
const check = (label, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${ok ? '' : ' ' + extra}`); if (!ok) failures++; };

try {
  await page.goto(`${M}/login/index.php`);
  await page.fill('#username', USER);
  await page.fill('#password', PASS);
  await page.click('#loginbtn');
  await page.waitForLoadState('networkidle');
  check('Login', !(await page.url()).includes('/login/'));

  // Kursseite auf Ukrainisch
  await page.goto(`${M}/course/view.php?id=${reg.courseId}&lang=uk`, { waitUntil: 'networkidle' });
  const body = await page.locator('body').innerText();
  check('Abschnitt Holz auf uk', body.includes(uk.etappen.holz.name), `erwartet "${uk.etappen.holz.name}"`);
  const i = body.indexOf('{mlang');
  check('kein rohes {mlang}', i < 0, i >= 0 ? 'bei Index ' + i + ': …' + body.slice(Math.max(0, i - 80), i + 80).replace(/\s+/g, ' ') + '…' : '');
  const iframeSrc = await page.locator('.cw-station iframe').first().getAttribute('src').catch(() => null);
  check('iframe traegt ?lang=uk', !!iframeSrc && iframeSrc.includes('?lang=uk#/station/s02'), iframeSrc || '');

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

  // Zurueck auf Deutsch, damit die Session sauber bleibt
  await page.goto(`${M}/course/view.php?id=${reg.courseId}&lang=de`);
} finally {
  await browser.close().catch(() => {});
}
console.log(failures ? `\n${failures} FAIL` : '\nBox-Smoke grün');
process.exit(failures ? 1 : 0);
