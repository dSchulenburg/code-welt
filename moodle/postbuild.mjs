#!/usr/bin/env node
// Nachlaufskript zu moodle:build: legt das Forum "Fragen an Nour" (Abschnitt 0) und die
// Etappen-Badges Holz/Stein per PHP an -- fuer beides gibt es kein MCP-Tool (nur Aktivitaeten aus
// der MCP-Werkzeugliste: Label/Seite/Quiz/Aufgabe/Ordner/... siehe build-course.mjs). Ruft dafuer
// apply-php.sh auf (docker cp + docker exec in der Box, siehe dort), parst dessen stdout und
// traegt das Ergebnis in registry.json ein: items['forum-nour'] und badges.
//
// Aufruf: node moodle/postbuild.mjs   (REG_ENV=box); Voraussetzung: npm run moodle:build ist
// bereits gelaufen (courseId + Quiz-/Aufgaben-cmids fuer die Etappen muessen im Register stehen).
//
// Testbarkeit: parseCmidLine/parseBadgeLines/applyForumResult/applyBadgeResults sind reine,
// exportierte Funktionen (siehe tests/postbuild.test.js) -- der Import dieses Moduls loest keine
// Seiteneffekte aus. main() laeuft nur, wenn die Datei direkt als Skript ausgefuehrt wird (Guard
// ganz unten), nicht beim Import fuer Tests.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mlang, pick } from './lib/mlang.mjs';
import { toEntities } from './lib/entities.mjs';
import de from '../src/i18n/de.js';
import en from '../src/i18n/en.js';
import uk from '../src/i18n/uk.js';
import ar from '../src/i18n/ar.js';
import es from '../src/i18n/es.js';
import it from '../src/i18n/it.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REG_PATH = path.join(HERE, 'registry.json');
const TMP_JSON = path.join(HERE, 'tmp-badges.json');

// Forum-Name (Klartext-Feld, echte Umlaute -- wie Kurs-/Abschnitts-/Aktivitaetsnamen in
// course-def.mjs) und Intro (HTML-Feld, Entities via toEntities). Kurze zweisprachige Stuetzen
// pro Sprache statt einer vollen Uebersetzung, wie im Brief vorgegeben.
const FORUM_NAME = { de: 'Fragen an Nour', en: 'Questions for Nour', uk: 'Питання до Нур', ar: 'أسئلة إلى نور', es: 'Preguntas a Nour', it: 'Domande a Nour' };
const FORUM_INTRO = {
  de: '<p>Frag Nour, wenn du beim Bauen oder Programmieren nicht weiterkommst.</p>',
  en: '<p>Ask Nour when you get stuck building or coding.</p>',
  uk: '<p>Запитай Нур, якщо застряг під час будівництва чи програмування.</p>',
  ar: '<p>اسأل نور إذا واجهت صعوبة في البناء أو البرمجة.</p>',
  es: '<p>Pregunta a Nour si te atascas construyendo o programando.</p>',
  it: '<p>Chiedi a Nour se ti blocchi mentre costruisci o programmi.</p>',
};

// --- reine Funktionen (getestet in tests/postbuild.test.js) ---

// Liest "cmid=<n>" aus der Ausgabe von create-forum.php.
export function parseCmidLine(text) {
  const m = String(text).match(/cmid=(\d+)/);
  if (!m) throw new Error(`cmid= nicht in Ausgabe gefunden: ${String(text).slice(0, 200)}`);
  return Number(m[1]);
}

// Liest alle "badge=<key> id=<n>"-Zeilen aus der Ausgabe von create-badges.php (eine je Badge).
export function parseBadgeLines(text) {
  const out = [];
  const re = /badge=(\S+) id=(\d+)/g;
  let m;
  while ((m = re.exec(String(text)))) out.push({ key: m[1], id: Number(m[2]) });
  return out;
}

export function applyForumResult(reg, cmid) {
  reg.items['forum-nour'] = { cmid };
  return reg;
}

export function applyBadgeResults(reg, badgeResults) {
  reg.badges ||= {};
  for (const { key, id } of badgeResults) reg.badges[key] = id;
  return reg;
}

// --- Lauf gegen die Box ---

function run(args) {
  return execFileSync('bash', ['apply-php.sh', ...args], { cwd: HERE, encoding: 'utf8' });
}

function main() {
  const ENV = process.env.REG_ENV || 'box';
  const registry = JSON.parse(fs.readFileSync(REG_PATH, 'utf8'));
  const reg = registry[ENV];
  if (!reg || !reg.courseId) throw new Error(`registry.json: ${ENV}.courseId fehlt -- erst npm run moodle:build laufen lassen`);
  const save = () => fs.writeFileSync(REG_PATH, JSON.stringify(registry, null, 2) + '\n');
  const courseId = reg.courseId;

  const need = (key) => {
    const cmid = reg.items[key]?.cmid;
    if (typeof cmid !== 'number') throw new Error(`registry.json: items['${key}'].cmid fehlt -- erst npm run moodle:build laufen lassen`);
    return cmid;
  };
  const holzCmids = [need('s01-quiz'), need('s02-quiz'), need('s03-quiz'), need('boss-holz')];
  const steinCmids = [need('s04-quiz'), need('s05-quiz'), need('s06-quiz'), need('boss-stein')];

  const bundles = { de, en, uk, ar, es, it };

  // 1. Forum
  const forumName = mlang(FORUM_NAME);
  const forumIntro = toEntities(mlang(FORUM_INTRO));
  const forumOut = run(['php/create-forum.php', String(courseId), forumName, forumIntro]);
  console.log(forumOut.trimEnd());
  applyForumResult(reg, parseCmidLine(forumOut));
  save();

  // 2. Badges (JSON als Datei nach /tmp/ kopiert statt als Argument -- Shell-Quoting bei
  // mehrsprachigem {mlang}-Text mit Anfuehrungszeichen/Sonderzeichen waere sonst nicht robust)
  const badgeSpecs = [
    {
      key: 'badge-holz',
      name: mlang(pick(bundles, 'etappen.holz.badge.name')),
      description: toEntities(mlang(pick(bundles, 'etappen.holz.badge.description'))),
      icon: '/tmp/holz.png',
      cmids: holzCmids,
    },
    {
      key: 'badge-stein',
      name: mlang(pick(bundles, 'etappen.stein.badge.name')),
      description: toEntities(mlang(pick(bundles, 'etappen.stein.badge.description'))),
      icon: '/tmp/stein.png',
      cmids: steinCmids,
    },
  ];
  fs.writeFileSync(TMP_JSON, JSON.stringify(badgeSpecs, null, 2));
  try {
    const badgeOut = run([
      'php/create-badges.php',
      '--copy', 'tmp-badges.json',
      '--copy', 'badges/holz.png',
      '--copy', 'badges/stein.png',
      String(courseId), '/tmp/tmp-badges.json',
    ]);
    console.log(badgeOut.trimEnd());
    applyBadgeResults(reg, parseBadgeLines(badgeOut));
    save();
  } finally {
    fs.rmSync(TMP_JSON, { force: true });
  }

  console.log(`\nFertig. Forum cmid ${reg.items['forum-nour'].cmid}, Badges: ${JSON.stringify(reg.badges)}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
