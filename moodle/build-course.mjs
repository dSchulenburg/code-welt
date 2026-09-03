#!/usr/bin/env node
// Legt den Kurs "Code-Welt" in der Box an oder aktualisiert ihn. Idempotent ueber registry.json.
//   node moodle/build-course.mjs            (APP_BASE=http://localhost:3030/code-welt/, REG_ENV=box)
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { callTool, extractId, sleepBetween, hasShortname, parseSectionModules } from './lib/mcp.mjs';
import { contentHash, needsUpdate, isOrderedSubsequence, orphanKeys } from './lib/registry-ops.mjs';
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
      // 03.09.2026 gegen die Box) — die echte CMID kommt deshalb aus moodle_get_course_contents.
      // Nicht per Listenposition (letztes Element) gesucht, sondern per Modultyp+Name — robuster
      // gegen Abweichungen von der Anhaenge-Reihenfolge (z. B. wenn ein anderes Tool zwischendurch
      // ein Modul anlegt).
      if (!have) {
        await callTool('moodle_create_folder', { courseId, sectionNum: s.num, name: item.name, itemId: 0 });
        const contentsText = await callTool('moodle_get_course_contents', { courseId });
        const parsed = parseSectionModules(contentsText, s.num);
        const matches = (parsed?.modules || []).filter((mod) => mod.modname === 'folder' && mod.name === item.name);
        if (matches.length === 0) throw new Error(`Ordner ${item.key}: kein Ordner-Modul namens "${item.name}" in Abschnitt ${s.num} gefunden`);
        if (matches.length > 1) throw new Error(`Ordner ${item.key}: ${matches.length} Ordner-Module namens "${item.name}" in Abschnitt ${s.num} gefunden (cmids ${matches.map((mod) => mod.cmid).join(', ')}) — nicht eindeutig`);
        const cmid = matches[0].cmid;
        reg.items[item.key] = { cmid, hash }; save();
        console.log(`Ordner ${item.key}: angelegt (cmid ${cmid})`);
      } else {
        console.log(`Ordner ${item.key}: unverändert (Ordner werden nie aktualisiert)`);
      }
    }
    await sleepBetween(800);
  }
}

// 3b. Verwaiste Registry-Eintraege entfernen: Items, die course-def.mjs nicht mehr liefert (z. B.
// entfernt oder umbenannt — die alte "teacher-setup"-Platzhalter-Seite war so ein Fall), verlieren
// sonst dauerhaft ihre Zuordnung und bleiben als unverwaltete Modul-Leichen im Kurs stehen. Laeuft
// global (nicht pro Abschnitt, orphanKeys sammelt ueber alle def.sections) und VOR der
// Reihenfolge-Pruefung, damit moodle_get_course_contents dort schon den bereinigten Stand zeigt.
// "Datensatz nicht gefunden" beim Loeschen wird toleriert (Modul war vermutlich schon von Hand
// entfernt); jeder andere Fehler bricht den Lauf ab.
for (const key of orphanKeys(reg.items, def)) {
  const cmid = reg.items[key].cmid;
  try {
    await callTool('moodle_delete_module', { moduleId: cmid });
  } catch (e) {
    if (!/find data record|nicht gefunden|not found/i.test(e.message)) throw e;
  }
  delete reg.items[key]; save();
  console.log(`Verwaist entfernt: ${key} (cmid ${cmid})`);
  await sleepBetween(800);
}

// 4. Reihenfolge im Abschnitt erzwingen: moodle_update_label haengt aktualisierte Labels ans
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
for (const s of def.sections) {
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

// 5. Kursabschluss: alle Quizze und Boss-Check-Aufgaben — nur aufrufen, wenn sich die Menge der
// CMIDs seit dem letzten Lauf geaendert hat. Der Aufruf schlaegt fehl (❌), sobald irgendein Nutzer
// den Kurs bereits abgeschlossen hat; das ist dann eine WARNUNG statt eines Abbruchs, der Kurs ist
// sonst fertig gebaut. Die CMIDs kommen aus def.sections (nicht aus Registry-Key-Suffixen wie
// "-quiz") — ein verwaister oder umbenannter Registry-Eintrag zaehlt so nie mit, auch nicht in der
// kurzen Luecke zwischen dem Loeschen oben und diesem Schritt.
const quizCmids = [];
const assignmentCmids = [];
for (const s of def.sections) {
  for (const item of s.items) {
    if (item.type !== 'quiz' && item.type !== 'assignment') continue;
    const cmid = reg.items[item.key]?.cmid;
    if (typeof cmid !== 'number') continue;
    (item.type === 'quiz' ? quizCmids : assignmentCmids).push(cmid);
  }
}
const criteriaCmids = [...quizCmids, ...assignmentCmids].sort((a, b) => a - b).join(',');
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
