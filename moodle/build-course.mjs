#!/usr/bin/env node
// Legt den Kurs "Code-Welt" in der Box an oder aktualisiert ihn. Idempotent ueber registry.json.
//   node moodle/build-course.mjs            (APP_BASE=http://localhost:3030/code-welt/, REG_ENV=box)
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { callTool, extractId, sleepBetween, hasShortname, parseSectionModules } from './lib/mcp.mjs';
import { contentHash, needsUpdate, isOrderedSubsequence } from './lib/registry-ops.mjs';
import { buildCourseDef } from './course-def.mjs';
import de from '../src/i18n/de.js';
import en from '../src/i18n/en.js';
import uk from '../src/i18n/uk.js';
import ar from '../src/i18n/ar.js';
import es from '../src/i18n/es.js';
import it from '../src/i18n/it.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REG_PATH = path.join(HERE, 'registry.json');
const ENV = process.env.REG_ENV || 'box';
const APP_BASE = process.env.APP_BASE || 'http://localhost:3030/code-welt/';

const registry = JSON.parse(fs.readFileSync(REG_PATH, 'utf8'));
const reg = (registry[ENV] ||= { courseId: null, items: {} });
const save = () => fs.writeFileSync(REG_PATH, JSON.stringify(registry, null, 2) + '\n');

const def = buildCourseDef({ bundles: { de, en, uk, ar, es, it }, appBase: APP_BASE });

// Fallback, falls moodle_get_course_contents fuer einen Abschnitt einmal keine Section-ID
// mitliefert: direkt aus der Box-DB lesen und fuer den restlichen Lauf cachen (lazy, hoechstens
// einmal pro Lauf ausgefuehrt). Normalfall ist, dass parseSectionModules die ID schon aus dem
// Text zieht — dieser Pfad ist reine Absicherung.
let sectionIdCache = null;
function sectionIdFromDb(courseId, sectionNum) {
  if (!sectionIdCache) {
    const php = `define('CLI_SCRIPT',true); require('/var/www/html/config.php'); $rows=$DB->get_records_sql('SELECT id, section FROM {course_sections} WHERE course = ?', [${courseId}]); foreach ($rows as $r) { echo $r->section . '=' . $r->id . "\\n"; }`;
    const out = execSync(`docker exec ki-kurs-moodle php -r ${JSON.stringify(php)}`, { encoding: 'utf8' });
    sectionIdCache = {};
    for (const line of out.trim().split('\n')) {
      const [num, id] = line.split('=');
      if (num !== undefined && id !== undefined && num !== '') sectionIdCache[Number(num)] = Number(id);
    }
  }
  return sectionIdCache[sectionNum];
}

// 1. Kurs
if (!reg.courseId) {
  const list = await callTool('moodle_list_courses', {});
  if (hasShortname(list, def.shortname)) throw new Error(`Kurs ${def.shortname} existiert schon, aber nicht im Register — courseId von Hand in registry.json eintragen`);
  const r = await callTool('moodle_create_course', { fullname: def.fullname, shortname: def.shortname, categoryid: 1, summary: def.summary, format: 'topics', numsections: 8, visible: 1 });
  reg.courseId = extractId(r, 'ID'); save();
  console.log(`Kurs angelegt: ${reg.courseId}`);
} else {
  await callTool('moodle_update_course', { courseId: reg.courseId, fullname: def.fullname, summary: def.summary });
  console.log(`Kurs aktualisiert: ${reg.courseId}`);
}
const courseId = reg.courseId;
await sleepBetween();

// 2. Abschnitte (Namen + Sichtbarkeit; Abschnitt 0..8 existieren durch numsections=8)
for (const s of def.sections) {
  await callTool('moodle_update_section', { courseId, sectionNum: s.num, name: s.name, visible: s.visible });
  console.log(`Abschnitt ${s.num}: ok`);
  await sleepBetween(800);
}

// 3. Aktivitaeten
let quizzesRecreated = 0;
for (const s of def.sections) {
  for (const item of s.items) {
    const have = reg.items[item.key];
    const hash = contentHash(item);
    if (item.type === 'label') {
      if (!have) {
        const r = await callTool('moodle_create_label', { courseId, sectionNum: s.num, labelText: item.html });
        reg.items[item.key] = { cmid: extractId(r, 'Modul-ID'), hash }; save();
        console.log(`Label ${item.key}: angelegt (cmid ${reg.items[item.key].cmid})`);
      } else if (have.hash !== undefined && needsUpdate(have, item)) {
        const r = await callTool('moodle_update_label', { courseId, cmid: have.cmid, labelText: item.html });
        have.cmid = extractId(r, 'Neuer CMID'); have.hash = hash; save();     // Update = Delete+Recreate, CMID wandert
        console.log(`Label ${item.key}: aktualisiert (cmid ${have.cmid})`);
      } else {
        // have.hash === undefined: Altbestand aus der Zeit vor der Hash-Einfuehrung — Hash jetzt
        // erstmalig speichern, OHNE das Label neu anzulegen (das wuerde es sonst ans Abschnittsende
        // schieben und die Reihenfolge genau so durcheinanderbringen wie der Fehler, den wir fixen).
        if (have.hash === undefined) { have.hash = hash; save(); }
        console.log(`Label ${item.key}: unverändert`);
      }
    }
    if (item.type === 'quiz') {
      if (!have) {
        const r = await callTool('moodle_create_quiz', { courseId, sectionNum: s.num, quizName: item.name, intro: item.intro, attempts: 0, grademethod: 1, shufflequestions: 0 });
        const entry = { cmid: extractId(r, 'Modul-ID'), quizId: extractId(r, 'Quiz-ID'), questions: 0, hash };
        reg.items[item.key] = entry; save();
        for (const q of item.questions) {
          await callTool('moodle_add_quiz_question_multichoice', { quizId: entry.quizId, questionText: q.text, answers: q.answers, name: q.name, single: 1, shuffleAnswers: 1 });
          entry.questions++; save();
          await sleepBetween(800);
        }
        console.log(`Quiz ${item.key}: angelegt (quizId ${entry.quizId}, ${entry.questions} Fragen)`);
        // Aktivitaetsabschluss (manuell) ist Voraussetzung fuer moodle_set_course_completion_criteria weiter unten;
        // nur beim Anlegen setzen, sonst ueberschreibt ein spaeterer Update-Lauf ein von Plan 2 gesetztes completion=2
        await callTool('moodle_set_completion', { cmid: entry.cmid, completion: 1 });
      } else if (have.hash !== undefined && needsUpdate(have, item)) {
        // Fragen (oder Name/Intro) haben sich seit dem letzten Lauf geaendert: Moodle kann Quizfragen
        // nicht In-Place ersetzen, also komplett neu anlegen. Completion-Setting (completion=2,
        // Bestehensnote) geht dabei verloren — apply-completion.sh muss danach erneut laufen.
        const oldCmid = have.cmid;
        await callTool('moodle_delete_module', { moduleId: have.cmid });
        delete reg.items[item.key]; save();
        quizzesRecreated++;
        const r = await callTool('moodle_create_quiz', { courseId, sectionNum: s.num, quizName: item.name, intro: item.intro, attempts: 0, grademethod: 1, shufflequestions: 0 });
        const entry = { cmid: extractId(r, 'Modul-ID'), quizId: extractId(r, 'Quiz-ID'), questions: 0, hash };
        reg.items[item.key] = entry; save();
        for (const q of item.questions) {
          await callTool('moodle_add_quiz_question_multichoice', { quizId: entry.quizId, questionText: q.text, answers: q.answers, name: q.name, single: 1, shuffleAnswers: 1 });
          entry.questions++; save();
          await sleepBetween(800);
        }
        await callTool('moodle_set_completion', { cmid: entry.cmid, completion: 1 });
        console.log(`Quiz ${item.key}: Fragen geändert → neu angelegt (cmid ${oldCmid} → ${entry.cmid})`);
      } else {
        // Hash unveraendert (oder Altbestand ohne hash-Feld: jetzt erstmalig speichern, ohne
        // Neuanlage) — nur noch fehlende Fragen nachtragen, falls ein frueherer Lauf mittendrin
        // abgebrochen ist.
        if (have.hash === undefined) { have.hash = hash; save(); }
        const missing = item.questions.slice(have.questions || 0);
        for (const q of missing) {
          await callTool('moodle_add_quiz_question_multichoice', { quizId: have.quizId, questionText: q.text, answers: q.answers, name: q.name, single: 1, shuffleAnswers: 1 });
          have.questions++; save();
          await sleepBetween(800);
        }
        if (missing.length > 0) {
          console.log(`Quiz ${item.key}: ${missing.length} fehlende Fragen nachgetragen`);
        } else {
          console.log(`Quiz ${item.key}: unverändert`);
        }
      }
    }
    if (item.type === 'assignment') {
      // Boss-Check als Aufgabe (Nachtrag Plan 2, Entscheidung 3): kein Update-Tool, also wie beim
      // Quiz Recreate bei Hash-Aenderung. completionSubmit=1 setzt den Aktivitaetsabschluss schon
      // beim Anlegen (bei Abgabe) — ein separates moodle_set_completion ist hier nicht noetig.
      if (!have) {
        const r = await callTool('moodle_create_assignment', { courseId, sectionNum: s.num, name: item.name, intro: item.intro, grade: item.gradeMax, submissionOnlineText: 1, submissionFile: 0, completionSubmit: 1 });
        reg.items[item.key] = { cmid: extractId(r, 'Modul-ID'), hash }; save();
        console.log(`Aufgabe ${item.key}: angelegt (cmid ${reg.items[item.key].cmid})`);
      } else if (have.hash !== undefined && needsUpdate(have, item)) {
        const oldCmid = have.cmid;
        await callTool('moodle_delete_module', { moduleId: have.cmid });
        delete reg.items[item.key]; save();
        const r = await callTool('moodle_create_assignment', { courseId, sectionNum: s.num, name: item.name, intro: item.intro, grade: item.gradeMax, submissionOnlineText: 1, submissionFile: 0, completionSubmit: 1 });
        reg.items[item.key] = { cmid: extractId(r, 'Modul-ID'), hash }; save();
        console.log(`Aufgabe ${item.key}: geändert → neu angelegt (cmid ${oldCmid} → ${reg.items[item.key].cmid})`);
      } else {
        if (have.hash === undefined) { have.hash = hash; save(); }
        console.log(`Aufgabe ${item.key}: unverändert`);
      }
    }
    if (item.type === 'page') {
      // Kein Update-Tool fuer Seiten, also wie beim Quiz Recreate bei Hash-Aenderung.
      if (!have) {
        const r = await callTool('moodle_create_page', { courseId, sectionNum: s.num, pageName: item.name, content: item.html });
        reg.items[item.key] = { cmid: extractId(r, 'Modul-ID'), hash }; save();
        console.log(`Seite ${item.key}: angelegt (cmid ${reg.items[item.key].cmid})`);
      } else if (have.hash !== undefined && needsUpdate(have, item)) {
        const oldCmid = have.cmid;
        await callTool('moodle_delete_module', { moduleId: have.cmid });
        delete reg.items[item.key]; save();
        const r = await callTool('moodle_create_page', { courseId, sectionNum: s.num, pageName: item.name, content: item.html });
        reg.items[item.key] = { cmid: extractId(r, 'Modul-ID'), hash }; save();
        console.log(`Seite ${item.key}: geändert → neu angelegt (cmid ${oldCmid} → ${reg.items[item.key].cmid})`);
      } else {
        if (have.hash === undefined) { have.hash = hash; save(); }
        console.log(`Seite ${item.key}: unverändert`);
      }
    }
    if (item.type === 'folder') {
      // Wird nie aktualisiert (Dirk laedt die Weltdatei von Hand hoch). moodle_create_folder
      // meldet im Antworttext faelschlich die Item-ID statt der CMID als "Modul-ID" (gemessen
      // 03.09.2026 gegen die Box) — die echte CMID kommt deshalb aus moodle_get_course_contents
      // (neu angelegte Module haengen am Abschnittsende).
      if (!have) {
        await callTool('moodle_create_folder', { courseId, sectionNum: s.num, name: item.name, itemId: 0 });
        const contentsText = await callTool('moodle_get_course_contents', { courseId });
        const parsed = parseSectionModules(contentsText, s.num);
        const cmid = parsed?.cmids?.[parsed.cmids.length - 1];
        if (!cmid) throw new Error(`Ordner ${item.key}: CMID nicht in Kursinhalten gefunden`);
        reg.items[item.key] = { cmid, hash }; save();
        console.log(`Ordner ${item.key}: angelegt (cmid ${cmid})`);
      } else {
        console.log(`Ordner ${item.key}: unverändert (Ordner werden nie aktualisiert)`);
      }
    }
    await sleepBetween(800);
  }
  // Reihenfolge im Abschnitt erzwingen: moodle_update_label haengt aktualisierte Labels ans
  // Abschnittsende, dadurch driftet die Modul-Reihenfolge bei jedem Update-Lauf. Nur Items aus
  // der Registry werden angeordnet — Module, die build-course.mjs nicht kennt (z. B. das
  // Ankuendigungsforum in Abschnitt 0), bleiben, wo der Tool sie hinstellt.
  //
  // moodle_reorder_modules ist auf dieser Box nicht nutzbar (lokale local_wsmanagesections-Version
  // registriert keine reorder_modules-Webservice-Funktion, siehe Fix-Report). Ausweichroute:
  // moodle_move_module im Section-ID-Modus (lehnt sich an local_course_move_module_to_specific_position
  // an, das IST auf der Box registriert). Ohne beforeModuleId haengt ein Aufruf das Modul ans
  // Abschnittsende — wer also die gewuenschten CMIDs der Reihe nach ans Ende haengt, hat sie am
  // Ende in genau dieser Reihenfolge hintereinander stehen. "Append in order, only when needed":
  // erst pruefen, ob die gewuenschte Reihenfolge schon als Teilfolge in der aktuellen steckt.
  const want = s.items.map((it) => reg.items[it.key]?.cmid).filter((cmid) => typeof cmid === 'number');
  if (want.length > 0) {
    const contentsText = await callTool('moodle_get_course_contents', { courseId });
    const parsed = parseSectionModules(contentsText, s.num);
    const currentOrder = parsed?.cmids || [];
    if (isOrderedSubsequence(want, currentOrder)) {
      console.log(`Abschnitt ${s.num}: Reihenfolge ok`);
    } else {
      const sectionId = parsed?.sectionId ?? sectionIdFromDb(courseId, s.num);
      try {
        let moved = 0;
        for (const cmid of want) {
          await callTool('moodle_move_module', { courseId, moduleId: cmid, toSectionId: sectionId });
          moved++;
          await sleepBetween(800);
        }
        console.log(`Abschnitt ${s.num}: Reihenfolge gesetzt (${moved} Module verschoben)`);
      } catch (e) {
        console.log(`WARNUNG: Abschnitt ${s.num} Reihenfolge nicht gesetzt: ${e.message}`);
      }
    }
  }
}

// 4. Kursabschluss: alle Quizze und Boss-Check-Aufgaben — nur aufrufen, wenn sich die Menge der
// CMIDs seit dem letzten Lauf geaendert hat. Der Aufruf schlaegt fehl (❌), sobald irgendein Nutzer
// den Kurs bereits abgeschlossen hat; das ist dann eine WARNUNG statt eines Abbruchs, der Kurs ist
// sonst fertig gebaut. Aufgaben-Registry-Keys sind der jeweilige bossCheck.key (z. B. "boss-holz"),
// kein festes Suffix wie bei Quizzen — deshalb ueber die Item-Typen in def bestimmt.
const assignmentKeys = new Set();
for (const s of def.sections) for (const item of s.items) if (item.type === 'assignment') assignmentKeys.add(item.key);
const quizCmids = Object.entries(reg.items).filter(([k]) => k.endsWith('-quiz')).map(([, v]) => v.cmid);
const assignmentCmids = Object.entries(reg.items).filter(([k]) => assignmentKeys.has(k)).map(([, v]) => v.cmid);
const allCriteriaCmids = [...quizCmids, ...assignmentCmids].sort((a, b) => a - b);
const criteriaCmids = allCriteriaCmids.join(',');
if (reg.criteriaCmids === criteriaCmids) {
  console.log('Kursabschluss-Kriterien: unverändert');
} else {
  try {
    await callTool('moodle_set_course_completion_criteria', { courseId, cmids: criteriaCmids, aggregation: 1 });
    reg.criteriaCmids = criteriaCmids; save();
    console.log(`Kursabschluss-Kriterien: ${quizCmids.length} Quizze, ${assignmentCmids.length} Aufgaben`);
  } catch (e) {
    console.log(`WARNUNG: Kriterien nicht gesetzt: ${e.message}`);
  }
}

if (quizzesRecreated > 0) {
  console.log(`\nHINWEIS: ${quizzesRecreated} Quiz neu angelegt — jetzt \`bash moodle/apply-completion.sh\` ausführen (Bestehensnote-Abschluss), Badges/Kriterien prüfen.`);
}

console.log(`\nFertig. Kurs: http://localhost:8080/course/view.php?id=${courseId}`);
