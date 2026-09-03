import { buildCourseDef } from '../moodle/course-def.mjs';
import de from '../src/i18n/de.js';
import uk from '../src/i18n/uk.js';

const def = buildCourseDef({ bundles: { de, uk }, appBase: 'http://app/code-welt/' });

test('Kursmetadaten mehrsprachig, Kurzname fest', () => {
  expect(def.shortname).toBe('code-welt');
  expect(def.fullname).toMatch(/^\{mlang de\}Code-Welt/);
  expect(def.fullname).toMatch(/\{mlang other\}/);
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
