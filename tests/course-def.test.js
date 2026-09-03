import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCourseDef } from '../moodle/course-def.mjs';
import { assertNameLengths } from '../moodle/lib/limits.mjs';
import { STATIONS } from '../src/data/stations.js';
import de from '../src/i18n/de.js';
import en from '../src/i18n/en.js';
import uk from '../src/i18n/uk.js';
import ar from '../src/i18n/ar.js';
import es from '../src/i18n/es.js';
import it from '../src/i18n/it.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const def = buildCourseDef({ bundles: { de, uk }, appBase: 'http://app/code-welt/' });
// Volle Sechs-Sprachen-Definition wie im echten Build (moodle/build-course.mjs) — nur damit sind
// die {mlang}-Laengen im Laengen-Guard-Test unten realistisch (Fix-Report Task 3b).
const defAll = buildCourseDef({ bundles: { de, en, uk, ar, es, it }, appBase: 'http://app/code-welt/' });

test('Kursmetadaten mehrsprachig, Kurzname fest', () => {
  expect(def.shortname).toBe('code-welt');
  expect(def.fullname).toMatch(/^\{mlang de\}Code-Welt/);
  expect(def.fullname).toMatch(/\{mlang other\}/);
});

test('Kurszusammenfassung in allen sechs Sprachen', () => {
  expect(def.summary).toMatch(/\{mlang uk\}/);
  expect(def.summary).toMatch(/\{mlang it\}/);
});

test('neun Abschnitte, Lehrkraft versteckt, Etappennamen aus den Bundles', () => {
  expect(def.sections.map((s) => s.num)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  expect(def.sections[1].visible).toBe(0);
  expect(def.sections[2].name).toContain('{mlang de}Holz{mlang}');
  expect(def.sections[2].name).toContain(`{mlang uk}${uk.etappen.holz.name}{mlang}`);
});

test('Station 2 liefert Label mit sechs iframe-Varianten und Quiz mit vier Fragen', () => {
  const holz = def.sections[2];
  const label = holz.items.find((i) => i.key === 's02-station');
  expect(label.type).toBe('label');
  expect(label.html).toContain('{mlang uk}<');
  expect(label.html).toContain('http://app/code-welt/?lang=uk#/station/s02');
  expect(label.html).toContain('{mlang other}<');
  const quiz = holz.items.find((i) => i.key === 's02-quiz');
  expect(quiz.type).toBe('quiz');
  expect(quiz.questions).toHaveLength(4);
  expect(quiz.questions[0].answers.filter((a) => a.fraction === 100)).toHaveLength(1);
  expect(quiz.questions[0].text).toMatch(/\{mlang uk\}/);
  expect(quiz.questions[0].text).not.toMatch(/[äöüÄÖÜß]/);
});

test('Willkommen: Sprachwahl-Label ohne mlang, alle Sprachen untereinander', () => {
  const welcome = def.sections[0].items.find((i) => i.key === 'welcome-lang');
  expect(welcome.html).not.toContain('{mlang');
  expect(welcome.html).toContain('Українська');
  expect(welcome.html).toContain('العربية');
});

test('iframe-Hoehe kommt aus iframeHeight der Station, ar bekommt +10%', () => {
  const holz = def.sections[2];
  const label = holz.items.find((i) => i.key === 's02-station');
  expect(STATIONS.s02.iframeHeight).toBe(1400);
  expect(label.html).toContain('height="1400"');
  expect(label.html).toContain('height="1540"');
});

test('Boss-Check-Aufgabe erscheint nach dem Quiz der Station mit bossCheck', () => {
  const stations = { ...STATIONS, s02: { ...STATIONS.s02, bossCheck: { key: 'boss-holz', gradeMax: 100 } } };
  const bundles = {
    de: {
      ...de,
      ui: { ...de.ui, bossCheckHint: 'Löse die Aufgabe ohne Tipp-Leiter.' },
      stations: { ...de.stations, s02: { ...de.stations.s02, bossCheck: { title: 'Boss-Check Holz', subtitle: 'Das L', task: 'Baue ein L aus Blöcken.' } } },
    },
    uk: {
      ...uk,
      ui: { ...uk.ui, bossCheckHint: 'Виконай завдання без драбинки підказок.' },
      stations: { ...uk.stations, s02: { ...uk.stations.s02, bossCheck: { title: 'Бос-перевірка Дерево', subtitle: 'Літера Л', task: 'Побудуй літеру Л із блоків.' } } },
    },
  };
  const withBoss = buildCourseDef({ bundles, appBase: 'http://app/code-welt/', stations });
  const holz = withBoss.sections[2];
  const quizIdx = holz.items.findIndex((i) => i.key === 's02-quiz');
  const assignmentIdx = holz.items.findIndex((i) => i.key === 'boss-holz');
  expect(quizIdx).toBeGreaterThanOrEqual(0);
  expect(assignmentIdx).toBe(quizIdx + 1);
  const item = holz.items[assignmentIdx];
  expect(item.type).toBe('assignment');
  expect(item.gradeMax).toBe(100);
  // Name bleibt kurz (nur der Titel, ohne Untertitel — Fix-Report Task 3b: Moodle-Spaltenlaenge).
  expect(item.name).toContain('{mlang uk}Бос-перевірка Дерево{mlang}');
  expect(item.name).toContain('{mlang other}Boss-Check Holz{mlang}');
  expect(item.name).not.toContain('Das L');
  // Untertitel steht fett am Anfang der Intro, vor dem Aufgabentext (mlang-Reihenfolge: de vor uk).
  expect(item.intro).toMatch(/^<p><strong>\{mlang de\}Das L\{mlang\}\{mlang uk\}Літера Л\{mlang\}\{mlang other\}Das L\{mlang\}<\/strong><\/p>/);
  expect(item.intro).toContain('{mlang uk}');
  expect(item.intro).toContain('Виконай завдання без драбинки підказок.');
  expect(item.intro).not.toMatch(/[äöüÄÖÜß]/);
});

test('Lehrkraft-Abschnitt: Ordner zuerst, dann Seiten in Dateireihenfolge, README ausgeschlossen', () => {
  const fixtureDir = path.join(HERE, 'fixtures', 'lehrkraft');
  const withPages = buildCourseDef({ bundles: { de, uk }, appBase: 'http://app/code-welt/', lehrkraftDir: fixtureDir });
  const teacher = withPages.sections[1];
  expect(teacher.items[0]).toMatchObject({ key: 'weltdateien', type: 'folder', name: 'Weltdateien' });
  const pages = teacher.items.slice(1);
  expect(pages.map((p) => p.type)).toEqual(['page', 'page']);
  expect(pages.map((p) => p.name)).toEqual(['Erste Seite', 'Zweite Seite']);
  expect(pages[1].html).toContain('f&uuml;r sp&auml;ter');
  expect(pages.some((p) => p.name === 'Anleitung')).toBe(false);
});

test('Lehrkraft-Abschnitt mit echten Daten: Ordner, dann acht Seiten in Dateireihenfolge', () => {
  // Seit Task 7 (Plan 2) liegen echte Lehrkraft-Seiten unter content/lehrkraft: Setup,
  // Weltbauplan und die sechs Stundenverlaeufe DS 1-6. Der fruehere Test ging noch von einem
  // leeren Ordner (nur README) aus.
  const teacher = def.sections[1];
  expect(teacher.items).toHaveLength(9);
  expect(teacher.items[0]).toMatchObject({ key: 'weltdateien', type: 'folder', name: 'Weltdateien' });
  const pages = teacher.items.slice(1);
  expect(pages.every((p) => p.type === 'page')).toBe(true);
  expect(pages.map((p) => p.key)).toEqual([
    'page-00-setup', 'page-01-welt-ankunft',
    'page-ds01', 'page-ds02', 'page-ds03', 'page-ds04', 'page-ds05', 'page-ds06',
  ]);
  expect(pages.map((p) => p.name)).toEqual([
    'Setup: Minecraft Education einrichten',
    'Weltbauplan: codewelt-ankunft',
    'DS 1 – Die neue Welt',
    'DS 2 – Reihenfolge zählt',
    'DS 3 – Zauberwörter',
    'DS 4 – Wiederholen',
    'DS 5 – Schleife in der Schleife',
    'DS 6 – Das Haus',
  ]);
});

// Fix-Report Task 3b: assign.name/quiz.name/page.name/folder.name/course_sections.name sind in
// Moodle varchar(255) (per SHOW COLUMNS auf der Box gemessen), course.fullname char(1333) (auf
// dieser Moodle-Version fuer {mlang}-Mehrsprachigkeit verlaengert, siehe limits.mjs). Sieben
// {mlang}-Bloecke aus einem zu langen Boss-Check-Titel sprengten assign.name (boss-holz: 276
// Zeichen, boss-stein: 304) und liessen build-course.mjs erst bei moodle_create_assignment mit
// "Error writing to database" abbrechen.
test('kein Abschnitts- oder Aktivitaetsname ueberschreitet die Moodle-Spaltenlaenge (defAll, sechs Sprachen)', () => {
  expect(() => assertNameLengths(defAll)).not.toThrow();
  expect(defAll.fullname.length).toBeLessThanOrEqual(1333);
  for (const s of defAll.sections) {
    expect(s.name.length, `Abschnitt ${s.num}`).toBeLessThanOrEqual(255);
    for (const item of s.items) {
      if (['quiz', 'assignment', 'page', 'folder'].includes(item.type)) {
        expect(item.name.length, item.key).toBeLessThanOrEqual(255);
      }
    }
  }
});

test('assertNameLengths schlaegt bei einem 40-Zeichen-Boss-Check-Titel in allen sechs Sprachen an (Guard-Nachweis)', () => {
  const stations = { ...STATIONS, s02: { ...STATIONS.s02, bossCheck: { key: 'boss-guard-test', gradeMax: 100 } } };
  const longTitle = 'X'.repeat(40);
  const bundles = {};
  for (const [code, bundle] of Object.entries({ de, en, uk, ar, es, it })) {
    bundles[code] = {
      ...bundle,
      stations: { ...bundle.stations, s02: { ...bundle.stations.s02, bossCheck: { title: longTitle, subtitle: 'Y', task: 'Z' } } },
    };
  }
  const tooLong = buildCourseDef({ bundles, appBase: 'http://app/code-welt/', stations });
  expect(() => assertNameLengths(tooLong)).toThrow(/boss-guard-test/);
});
