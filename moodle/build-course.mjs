#!/usr/bin/env node
// Legt den Kurs "Code-Welt" in der Box an oder aktualisiert ihn. Idempotent ueber registry.json.
//   node moodle/build-course.mjs            (APP_BASE=http://localhost:3030/code-welt/, REG_ENV=box)
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { callTool, extractId, sleepBetween, hasShortname } from './lib/mcp.mjs';
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
for (const s of def.sections) {
  for (const item of s.items) {
    const have = reg.items[item.key];
    if (item.type === 'label') {
      if (have) {
        const r = await callTool('moodle_update_label', { courseId, cmid: have.cmid, labelText: item.html });
        have.cmid = extractId(r, 'Neuer CMID'); save();     // Update = Delete+Recreate, CMID wandert
        console.log(`Label ${item.key}: aktualisiert (cmid ${have.cmid})`);
      } else {
        const r = await callTool('moodle_create_label', { courseId, sectionNum: s.num, labelText: item.html });
        reg.items[item.key] = { cmid: extractId(r, 'Modul-ID') }; save();
        console.log(`Label ${item.key}: angelegt (cmid ${reg.items[item.key].cmid})`);
      }
    }
    if (item.type === 'quiz') {
      if (have) {
        await callTool('moodle_update_quiz', { quizId: have.quizId, name: item.name });
        const missing = item.questions.slice(have.questions || 0);
        for (const q of missing) {
          await callTool('moodle_add_quiz_question_multichoice', { quizId: have.quizId, questionText: q.text, answers: q.answers, name: q.name, single: 1, shuffleAnswers: 1 });
          have.questions++; save();
          await sleepBetween(800);
        }
        if (missing.length > 0) {
          console.log(`Quiz ${item.key}: ${missing.length} fehlende Fragen nachgetragen`);
        } else {
          console.log(`Quiz ${item.key}: Name aktualisiert (${have.questions} Fragen bleiben)`);
        }
      } else {
        const r = await callTool('moodle_create_quiz', { courseId, sectionNum: s.num, quizName: item.name, intro: item.intro, attempts: 0, grademethod: 1, shufflequestions: 0 });
        const entry = { cmid: extractId(r, 'Modul-ID'), quizId: extractId(r, 'Quiz-ID'), questions: 0 };
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
      }
    }
    await sleepBetween(800);
  }
}

// 4. Kursabschluss: alle Quizze
const quizCmids = Object.entries(reg.items).filter(([k]) => k.endsWith('-quiz')).map(([, v]) => v.cmid);
await callTool('moodle_set_course_completion_criteria', { courseId, cmids: quizCmids.join(','), aggregation: 1 });
console.log(`Kursabschluss-Kriterien: ${quizCmids.length} Quizze`);
console.log(`\nFertig. Kurs: http://localhost:8080/course/view.php?id=${courseId}`);
