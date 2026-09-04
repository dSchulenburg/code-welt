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
import { ETAPPEN, STATIONS } from '../src/data/stations.js';
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

// managedBy: 'postbuild' markiert das Forum als Nachlauf-Item -- build-course.mjs' orphanKeys()
// (moodle/lib/registry-ops.mjs) ueberspringt jeden Eintrag mit managedBy, sonst wuerde Schritt 3b
// das Forum bei jedem Build als "verwaist" loeschen, weil course-def.mjs es nie liefert (Fix 3c).
export function applyForumResult(reg, cmid) {
  reg.items['forum-nour'] = { cmid, managedBy: 'postbuild' };
  return reg;
}

export function applyBadgeResults(reg, badgeResults) {
  reg.badges ||= {};
  for (const { key, id } of badgeResults) reg.badges[key] = id;
  return reg;
}

// Leitet aus ETAPPEN + STATIONS + dem aktuellen Register die Badge-Grunddaten ab (Etappen-ID,
// badge.key, badge.icon-Dateiname, cmids der Quizze + Boss-Checks) -- ohne Namen/Beschreibung
// (die kommen erst in main() aus den Bundles) und ohne Icon-Pfad-Praefix. Reine Funktion, mit
// Fake-ETAPPEN/Fake-Register testbar (siehe tests/postbuild.test.js), damit hier keine
// String-Literale wie "badge-holz"/"holz.png" mehr stehen muessen.
//
// Eine Etappe liefert keinen Spec (landet in `skipped`, main() loggt eine Zeile je Eintrag),
// wenn sie kein badge-Feld traegt, keine Stationen hat (Eisen, Gold, ... -- noch nicht gebaut)
// oder wenn irgendeine ihrer Stationen (Quiz oder, falls die Station einen traegt, deren
// Boss-Check) noch keine cmid im Register hat.
export function badgeSpecsFromEtappen(etappen, stations, items) {
  const specs = [];
  const skipped = [];
  for (const e of etappen) {
    if (!e.badge) { skipped.push({ id: e.id, reason: 'kein badge-Feld' }); continue; }
    if (e.stations.length === 0) { skipped.push({ id: e.id, reason: 'keine Stationen (noch nicht gebaut)' }); continue; }
    const cmids = [];
    let missing = null;
    for (const sid of e.stations) {
      const quizKey = `${sid}-quiz`;
      const quizCmid = items[quizKey]?.cmid;
      if (typeof quizCmid !== 'number') { missing = quizKey; break; }
      cmids.push(quizCmid);
      const bossKey = stations[sid]?.bossCheck?.key;
      if (bossKey) {
        const bossCmid = items[bossKey]?.cmid;
        if (typeof bossCmid !== 'number') { missing = bossKey; break; }
        cmids.push(bossCmid);
      }
    }
    if (missing) { skipped.push({ id: e.id, reason: `Register: items['${missing}'].cmid fehlt` }); continue; }
    specs.push({ etappeId: e.id, key: e.badge.key, icon: e.badge.icon, cmids });
  }
  return { specs, skipped };
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

  const bundles = { de, en, uk, ar, es, it };

  // 1. Forum -- die bekannte cmid (falls schon mal angelegt) wird mitgegeben, damit
  // create-forum.php per ID statt per (aenderlichem) {mlang}-Namenstext wiederfindet (Fix-Runde 1:
  // eine geschaerfte Uebersetzung liess den reinen Namensvergleich sonst ins Leere laufen und haette
  // ein zweites Forum angelegt).
  const forumName = mlang(FORUM_NAME);
  const forumIntro = toEntities(mlang(FORUM_INTRO));
  const knownForumCmid = reg.items['forum-nour']?.cmid;
  const forumArgs = ['php/create-forum.php', String(courseId), forumName, forumIntro];
  if (typeof knownForumCmid === 'number') forumArgs.push(String(knownForumCmid));
  const forumOut = run(forumArgs);
  console.log(forumOut.trimEnd());
  applyForumResult(reg, parseCmidLine(forumOut));
  save();

  // 2. Badges -- Grunddaten (Etappe, key, icon-Datei, cmids) aus ETAPPEN/STATIONS/Register
  // abgeleitet (badgeSpecsFromEtappen oben), nicht mehr hier hardcodiert. Etappen ohne gebaute
  // Stationen (Eisen, Gold, ...) fallen dabei heraus -- eine Log-Zeile je uebersprungener Etappe.
  const { specs, skipped } = badgeSpecsFromEtappen(ETAPPEN, STATIONS, reg.items);
  for (const s of skipped) console.log(`Badge fuer Etappe "${s.id}" uebersprungen: ${s.reason}`);

  if (specs.length === 0) {
    console.log('\nKeine Etappe mit gebauten Stationen -- keine Badges angelegt.');
  } else {
    // JSON als Datei nach /tmp/ kopiert statt als Argument -- Shell-Quoting bei mehrsprachigem
    // {mlang}-Text mit Anfuehrungszeichen/Sonderzeichen waere sonst nicht robust. id: die bekannte
    // Badge-ID aus dem Register (falls schon mal angelegt) -- robust gegen geaenderte
    // {mlang}-Uebersetzungen, siehe create-badges.php.
    const badgeSpecs = specs.map((s) => ({
      key: s.key,
      id: reg.badges?.[s.key] ?? null,
      name: mlang(pick(bundles, `etappen.${s.etappeId}.badge.name`)),
      description: toEntities(mlang(pick(bundles, `etappen.${s.etappeId}.badge.description`))),
      icon: '/tmp/' + s.icon,
      cmids: s.cmids,
    }));
    fs.writeFileSync(TMP_JSON, JSON.stringify(badgeSpecs, null, 2));
    try {
      const badgeOut = run([
        'php/create-badges.php',
        '--copy', 'tmp-badges.json',
        ...specs.flatMap((s) => ['--copy', 'badges/' + s.icon]),
        String(courseId), '/tmp/tmp-badges.json',
      ]);
      console.log(badgeOut.trimEnd());
      applyBadgeResults(reg, parseBadgeLines(badgeOut));
      save();
    } finally {
      fs.rmSync(TMP_JSON, { force: true });
    }
  }

  console.log(`\nFertig. Forum cmid ${reg.items['forum-nour'].cmid}, Badges: ${JSON.stringify(reg.badges)}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
