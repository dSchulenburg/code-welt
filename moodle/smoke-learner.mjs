// Lernenden-Pfad als Nachweis (Final-Review-Fix B, Important 4): anders als moodle/smoke-box.mjs
// (das nur prueft, dass Inhalte *angezeigt* werden) fuehrt dieses Skript den Lernpfad einer
// Etappe wirklich durch -- als schueler1, nicht als admin, und ohne Abkuerzung ueber
// moodle_set_completion oder eine manuelle Badge-Vergabe: die drei Quizze der Etappe werden mit
// den in src/i18n/de.js hinterlegten richtigen Antworten geloest, der Boss-Check bekommt eine
// echte Online-Text-Abgabe, und am Ende steht (per MCP, read-only) entweder das Badge der Etappe
// auf dem Konto von schueler1 -- oder das Skript FAILt sichtbar.
//
// Aufruf: node moodle/smoke-learner.mjs [--etappe holz|stein]  (npm run moodle:smoke:learner)
// Vorher wird der Testschueler in der Etappe automatisch zurueckgesetzt (moodle/php/
// reset-test-student.php), damit der Pfad bei jedem Lauf wirklich neu beginnt -- sonst waeren
// Quiz-Grade/Boss-Abgabe/Badge aus einem frueheren Lauf schon da und der "Nachweis" waere keiner.
//
// Browser-Weg (playwright-core + Edge, wie moodle/smoke-box.mjs) ist hier nicht der fragile Notfall,
// den final-fix-B.md als moeglich einplant: bei der Vorbereitung dieses Skripts lief der komplette
// Weg mehrfach robust durch. Zwei Moodle-5.0-Eigenheiten, die dabei nicht offensichtlich waren:
//  - Die letzte Frageseite eines Quizversuchs zeigt "Versuch abschliessen ..." nicht als <a>-Link,
//    sondern als stinknormalen input[name=next]-Submit (nur der Wert des Buttons aendert sich) --
//    derselbe Selector wie fuer "Naechste Seite" funktioniert also auf jeder Seite. Ein zusaetzlicher
//    <a class="endtestlink">-Link existiert im Kursindex/Fragen-Navigationsblock ebenfalls, ist aber
//    fuer diesen Zweck eine Sackgasse (nicht sichtbar / navigiert nicht zuverlaessig).
//  - Fraction bei Multichoice-Antworten ist ein Punktanteil 0.0-1.0, keine Prozentzahl -- ein bei
//    dieser Vorbereitung gefundener Bug in moodle/course-def.mjs (fraction: 100 statt 1) liess
//    Moodle bis zu 2500% werten. Ohne den Fix waere "Bewertung 100%" unten nie erreichbar gewesen;
//    siehe den Kommentar in course-def.mjs und den Fix-Report.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { resolveBrowser } from '../scripts/resolveBrowser.mjs';
import de from '../src/i18n/de.js';
import { ETAPPEN, STATIONS } from '../src/data/stations.js';
import { callTool } from './lib/mcp.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const M = process.env.MOODLE_URL || 'http://localhost:8080';
const USER = process.env.MOODLE_STUDENT_USER || 'schueler1';
const PASS = process.env.MOODLE_STUDENT_PASS || 'Test-2026!';
const USERID = Number(process.env.MOODLE_STUDENT_USERID || 3);
const reg = JSON.parse(fs.readFileSync(new URL('./registry.json', import.meta.url), 'utf8'))[process.env.REG_ENV || 'box'];

const etappeArg = (() => {
  const i = process.argv.indexOf('--etappe');
  return i >= 0 ? process.argv[i + 1] : 'holz';
})();
const etappe = ETAPPEN.find((e) => e.id === etappeArg);
if (!etappe || etappe.stations.length === 0) {
  console.error(`Unbekannte oder noch nicht gebaute Etappe: "${etappeArg}" (bekannt: ${ETAPPEN.filter((e) => e.stations.length > 0).map((e) => e.id).join(', ')})`);
  process.exit(1);
}
const lastSid = etappe.stations[etappe.stations.length - 1];
const bossKey = STATIONS[lastSid]?.bossCheck?.key;
if (!bossKey) {
  console.error(`Etappe "${etappe.id}": letzte Station ${lastSid} traegt keinen Boss-Check`);
  process.exit(1);
}

// Drei-Saetze-Abgabe fuer den Boss-Check, inhaltlich passend zur jeweiligen Aufgabe (s. content/de
// bzw. src/i18n/de.js stations.<sid>.bossCheck.task). Fuer eine Etappe ohne eigenen Text greift
// ein generischer, aber sachlich zutreffender Fallback -- vorerst nur Holz/Stein gebraucht.
const BOSS_TEXT = {
  holz: 'Mein Programm legt vier Bloecke geradeaus und dann zwei um die Ecke, so entsteht ein L. '
    + 'Die Reihenfolge ist wichtig, weil der Agent sich sonst an der falschen Stelle dreht und das L verschoben waere. '
    + 'Am schwersten war es, die Drehung genau nach dem vierten Block einzufuegen.',
  stein: 'Mein Programm laesst den Agenten mit einer Schleife achtmal einen Block setzen und sich danach drehen, '
    + 'sodass ein Ring aus vier Seiten mit je acht Bloecken entsteht. '
    + 'Die Schleife spart mir das Wiederholen der einzelnen Bau-Befehle fuer jede Seite einzeln. '
    + 'Ohne Schleife braeuchte ich fuer alle vier Seiten zusammen deutlich mehr einzelne Befehle.',
};
const bossText = BOSS_TEXT[etappe.id]
  || `Ich habe die Aufgabe der Etappe ${etappe.id} geloest. Der Share-Link zeigt mein Ergebnis. Am schwersten war der letzte Schritt.`;

function need(key) {
  const cmid = reg.items[key]?.cmid;
  if (typeof cmid !== 'number') throw new Error(`registry.json: items['${key}'].cmid fehlt -- erst npm run moodle:build/moodle:postbuild laufen lassen`);
  return cmid;
}
const quizCmids = etappe.stations.map((sid) => ({ sid, cmid: need(`${sid}-quiz`) }));
const bossCmid = need(bossKey);

// --- Reset zuerst: der Pfad ist nur dann ein Nachweis, wenn er wirklich bei null beginnt (siehe
// moodle/php/reset-test-student.php -- setzt Aktivitaetsabschluss, Quizversuche, Boss-Abgabe,
// Noten und Badge-Verleihungen des Testschuelers im Kurs zurueck).
console.log(`Reset ${USER} in Kurs ${reg.courseId} (vor dem Lernpfad, damit der Nachweis echt ist):`);
console.log(execFileSync('bash', ['apply-php.sh', 'php/reset-test-student.php', String(reg.courseId), USER], { cwd: HERE, encoding: 'utf8' }).trimEnd());

const browser = await chromium.launch({ executablePath: resolveBrowser(), headless: true });
const page = await browser.newPage();
let failures = 0;
const check = (label, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${ok ? '' : ' ' + extra}`); if (!ok) failures++; };

// Findet in der aktuell sichtbaren Frage (.que) die Antwort, deren Text den erwarteten Text
// enthaelt, und hakt ihr Radio an. Antwort-Label sind <div data-region="answer-label" id="q..:N_
// answerX_label">, das zugehoerige Radio hat dieselbe id ohne "_label" (siehe qtype_multichoice/
// renderer.php); Attribut-Selektor statt "#id", weil die id einen Doppelpunkt traegt (in CSS ein
// Sonderzeichen, wuerde "#q5:1_answer0" als ungueltigen Selector parsen).
async function checkAnswer(correctText) {
  const labels = await page.locator('.que [data-region="answer-label"]').all();
  for (const l of labels) {
    const text = await l.innerText();
    if (text.includes(correctText)) {
      const id = await l.getAttribute('id');
      const inputId = id.replace(/_label$/, '');
      await page.locator(`[id="${inputId}"]`).check();
      return true;
    }
  }
  return false;
}

// Ein Quiz komplett durchspielen: Versuch starten, jede Frage mit der laut src/i18n/de.js
// richtigen Antwort beantworten, abgeben, bestaetigen, Bewertung von der Review-Seite lesen.
async function runQuiz(cmid, sid) {
  await page.goto(`${M}/mod/quiz/view.php?id=${cmid}&lang=de`, { waitUntil: 'networkidle' });
  const startBtn = page.locator('form[action*="startattempt"] button, form[action*="startattempt"] input[type=submit]');
  if (await startBtn.count() === 0) return { ok: false, extra: `kein Start-Button auf ${page.url()}` };
  await startBtn.first().click();
  await page.waitForLoadState('networkidle');

  const quiz = de.stations[sid].quiz;
  for (let i = 0; i < quiz.length; i++) {
    const correct = quiz[i].answers.find((a) => a.correct)?.text;
    if (!correct) return { ok: false, extra: `${sid} Frage ${i}: keine Antwort mit correct:true in src/i18n/de.js` };
    const found = await checkAnswer(correct);
    if (!found) return { ok: false, extra: `${sid} Frage ${i}: Antworttext "${correct}" nicht auf der Seite gefunden` };
    const next = page.locator('input[name="next"]');
    if (await next.count() === 0) return { ok: false, extra: `${sid} Frage ${i}: kein input[name=next] (Seitenwechsel/Abgabe)` };
    await next.click();
    await page.waitForLoadState('networkidle');
  }

  const finishBtn = page.locator('.btn-finishattempt button, .btn-finishattempt input[type=submit]');
  if (await finishBtn.count() === 0) return { ok: false, extra: `kein Abgeben-Button auf ${page.url()}` };
  await finishBtn.click();
  await page.waitForSelector('.modal.show', { timeout: 10000 }).catch(() => {});
  const confirmBtn = page.locator('.modal.show [data-action="save"]');
  if (await confirmBtn.count() > 0) { await confirmBtn.click(); await page.waitForLoadState('networkidle'); }

  if (!/\/mod\/quiz\/review\.php/.test(page.url())) return { ok: false, extra: `keine Review-Seite nach Abgabe, url ${page.url()}` };
  const bodyText = await page.locator('#region-main').innerText();
  const m = bodyText.match(/Bewertung\s+([\d,.]+)\s+von\s+([\d,.]+)\s+\((\d+)\s*%\)/);
  if (!m) return { ok: false, extra: `keine "Bewertung X von Y (Z%)"-Zeile gefunden: ${bodyText.slice(0, 200)}` };
  return { ok: true, percent: Number(m[3]), line: m[0] };
}

// Boss-Check: echte Online-Text-Abgabe (kein Draft-Modus auf diesen Aufgaben -- "Aenderungen
// speichern" reicht als endgueltige Abgabe, siehe course-def.mjs submissionDrafts nicht gesetzt).
async function submitBossCheck(cmid, text) {
  await page.goto(`${M}/mod/assign/view.php?id=${cmid}&lang=de&action=editsubmission`, { waitUntil: 'networkidle' });
  const editorFrame = page.frameLocator('iframe[id="id_onlinetext_editor_ifr"]');
  const editorBody = editorFrame.locator('body#tinymce');
  if (await editorBody.count() === 0) return { ok: false, extra: `kein TinyMCE-Editor auf ${page.url()}` };
  await editorBody.click();
  await editorBody.fill(text);
  const saveBtn = page.locator('input[type="submit"][value*="speichern"]');
  if (await saveBtn.count() === 0) return { ok: false, extra: `kein Speichern-Button auf ${page.url()}` };
  await saveBtn.first().click();
  await page.waitForLoadState('networkidle');
  const bodyText = await page.locator('#region-main').innerText();
  return { ok: bodyText.includes('Zur Bewertung abgegeben'), extra: bodyText.slice(0, 300) };
}

try {
  // Aufwaerm-GET wie in smoke-box.mjs: der erste Request gegen eine frisch gestartete Box antwortet
  // manchmal traege.
  await page.goto(`${M}/login/index.php`).catch(() => {});

  const login = async () => {
    await page.goto(`${M}/login/index.php`, { waitUntil: 'networkidle' });
    await page.waitForSelector('input[name="logintoken"]', { state: 'attached' });
    await page.fill('#username', USER);
    await page.fill('#password', PASS);
    await page.click('#loginbtn');
    await page.waitForLoadState('networkidle');
  };
  await login();
  if (page.url().includes('/login/')) { await login(); }
  check('Login als ' + USER, !page.url().includes('/login/'), 'url ' + page.url());

  // (b) die drei Quizze der Etappe -- jedes mit den korrekten Antworten, erwartet 100%.
  for (const { sid, cmid } of quizCmids) {
    const r = await runQuiz(cmid, sid);
    check(`Quiz ${sid} (cmid ${cmid}): Bewertung 100%`, r.ok && r.percent === 100, r.ok ? r.line : r.extra);
  }

  // (c) Boss-Check: Online-Text-Abgabe mit drei Saetzen.
  const boss = await submitBossCheck(bossCmid, bossText);
  check(`Boss-Check ${bossKey} (cmid ${bossCmid}): Online-Text abgegeben`, boss.ok, boss.extra);

  // Zurueck auf Deutsch/Startseite, damit die Session sauber bleibt (wie smoke-box.mjs).
  await page.goto(`${M}/course/view.php?id=${reg.courseId}&lang=de`).catch(() => {});
} finally {
  await browser.close().catch(() => {});
}

// (d) Badge per MCP pruefen -- read-only (moodle_get_user_badges = natives
// core_badges_get_user_badges), kein Umweg ueber die Datenbank. Erwartung laut final-fix-B.md:
// das Badge ist schon da, ohne dass hier php admin/cli/cron.php lief -- bei der Vorbereitung
// dieses Skripts hat der Event-Observer die Verleihung in jedem Testlauf sofort ausgeloest
// (siehe Fix-Report). Falls doch nicht: einmal Cron nachschieben und erneut pruefen, das Ergebnis
// unten sagt, welcher Fall es war.
const badgeName = de.etappen[etappe.id].badge.name;
async function hasBadge() {
  const text = await callTool('moodle_get_user_badges', { userId: USERID, courseId: reg.courseId });
  return text.includes(badgeName);
}
let badgeOk = await hasBadge();
let cronRan = false;
if (!badgeOk) {
  cronRan = true;
  console.log(`Badge "${badgeName}" noch nicht da -- php admin/cli/cron.php einmal in der Box laufen lassen und erneut pruefen ...`);
  execFileSync('docker', ['exec', 'ki-kurs-moodle', 'php', '/var/www/html/admin/cli/cron.php'], { encoding: 'utf8' });
  badgeOk = await hasBadge();
}
check(`Badge "${badgeName}" fuer ${USER} verliehen${cronRan ? ' (erst nach Cron)' : ' (sofort, ohne Cron)'}`, badgeOk);

console.log(failures ? `\n${failures} FAIL` : '\nLernenden-Pfad gruen');
// process.exitCode statt process.exit(): der MCP-Fetch und ggf. der Cron-execFileSync oben laufen
// nach browser.close() -- ein hartes process.exit() direkt danach hat beim Vorbereiten dieses
// Skripts einen nativen libuv-Absturz ausgeloest ("UV_HANDLE_CLOSING", Windows), weil noch Handles
// dieser Aufrufe am Schliessen waren. exitCode setzen und den Prozess natuerlich auslaufen lassen
// vermeidet das, ohne am PASS/FAIL-Ergebnis oder Exit-Code etwas zu aendern.
process.exitCode = failures ? 1 : 0;
