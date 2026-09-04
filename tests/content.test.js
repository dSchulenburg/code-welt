import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ETAPPEN, STATIONS } from '../src/data/stations.js';
import de from '../src/i18n/de.js';
import content from '../src/content/de.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BADGES_DIR = path.join(HERE, '..', 'src', 'assets', 'badges');

test('Etappen in Kursreihenfolge, jede Station genau einer Etappe zugeordnet', () => {
  expect(ETAPPEN.map((e) => e.id)).toEqual(['holz', 'stein', 'eisen', 'gold', 'diamant', 'netherite', 'enderdrache']);
  for (const e of ETAPPEN) for (const sid of e.stations) expect(STATIONS[sid].etappe).toBe(e.id);
});

test('jede Station hat Stuetz-Ebene und Leit-Ebene mit vollstaendigem Schema', () => {
  for (const [id, s] of Object.entries(STATIONS)) {
    const t = de.stations[id];
    const c = content.stations[id];
    expect(t, id).toBeDefined();
    expect(c, id).toBeDefined();
    expect(typeof t.title).toBe('string');
    expect(typeof t.storyShort).toBe('string');
    expect(Object.keys(t.bridge)).toEqual(['game', 'code']);
    expect(t.tasks.map((x) => x.kind)).toEqual(['auftrag', 'nochEiner', 'remix']);
    expect(t.exercises).toHaveLength(s.exercises.length);
    expect(t.quiz.length).toBeGreaterThanOrEqual(3);
    for (const q of t.quiz) expect(q.answers.filter((a) => a.correct)).toHaveLength(1);
    expect(c.story.length).toBeGreaterThanOrEqual(3);
    expect(c.story.every((l) => ['nour', 'dani'].includes(l.who))).toBe(true);
    expect(c.tips).toHaveLength(3);
    expect(typeof s.python).toBe('string');
    expect(s.python.length).toBeGreaterThan(20);
  }
});

test('Etappennamen und UI-Strings vorhanden', () => {
  for (const e of ETAPPEN) expect(typeof de.etappen[e.id].name).toBe('string');
  for (const k of ['appTitle', 'home', 'support', 'supportShow', 'supportHide', 'station', 'check', 'next', 'prev', 'play', 'langLabel', 'bossCheckHeading', 'bossCheckHint'])
    expect(typeof de.ui[k], k).toBe('string');
});

test('jede Station hat eine iframeHeight ab 800', () => {
  for (const [id, s] of Object.entries(STATIONS)) expect(s.iframeHeight, id).toBeGreaterThanOrEqual(800);
});

test('in jeder Etappe mit drei oder mehr Stationen traegt genau die letzte Station einen bossCheck', () => {
  // Vor Task 4/5 hat Holz nur s02 (Etappen mit < 3 Stationen sind hiervon nicht betroffen).
  for (const e of ETAPPEN) {
    if (e.stations.length < 3) continue;
    const withBossCheck = e.stations.filter((sid) => STATIONS[sid].bossCheck);
    expect(withBossCheck, e.id).toEqual([e.stations[e.stations.length - 1]]);
  }
});

test('jede Station mit bossCheck hat i18n bossCheck.title/subtitle/task und einen key/gradeMax', () => {
  for (const [id, s] of Object.entries(STATIONS)) {
    if (!s.bossCheck) continue;
    expect(typeof s.bossCheck.key, id).toBe('string');
    expect(typeof s.bossCheck.gradeMax, id).toBe('number');
    const bc = de.stations[id].bossCheck;
    expect(typeof bc.title, id).toBe('string');
    expect(typeof bc.subtitle, id).toBe('string');
    expect(typeof bc.task, id).toBe('string');
  }
});

test('jede Etappe hat ein Badge (Daten + i18n Name/Beschreibung)', () => {
  for (const e of ETAPPEN) {
    expect(e.badge, e.id).toBeDefined();
    expect(typeof e.badge.key, e.id).toBe('string');
    expect(typeof e.badge.icon, e.id).toBe('string');
    const b = de.etappen[e.id].badge;
    expect(typeof b.name, e.id).toBe('string');
    expect(typeof b.description, e.id).toBe('string');
  }
});

// Nur Etappen mit gebauten Stationen (Holz, Stein) muessen schon eine echte SVG haben --
// postbuild.mjs (badgeSpecsFromEtappen) und scripts/badge-icons.mjs ueberspringen Etappen ohne
// Stationen (Eisen, Gold, ...) ausdruecklich als "noch nicht gebaut", nicht als Fehler; dieselbe
// Grenze gilt hier, sonst wuerde dieser Test schon jetzt an den Zukunfts-Etappen scheitern.
test('badge.icon jeder gebauten Etappe zeigt auf eine vorhandene SVG in src/assets/badges/', () => {
  for (const e of ETAPPEN) {
    if (e.stations.length === 0) continue;
    const stem = e.badge.icon.replace(/\.png$/, '');
    expect(existsSync(path.join(BADGES_DIR, `${stem}.svg`)), `${e.id}: src/assets/badges/${stem}.svg`).toBe(true);
  }
});

test('story-mood ist, wenn gesetzt, aus der erlaubten Menge; mindestens eine Zeile im ganzen Content traegt eine mood (Regel darf nie vakuos sein)', () => {
  const ALLOWED = ['erklaerend', 'fragend', 'begeistert', 'nachdenklich', 'ueberrascht'];
  let anyMoodSet = false;
  for (const [id, c] of Object.entries(content.stations)) {
    for (const line of c.story) {
      if (line.mood !== undefined) {
        anyMoodSet = true;
        expect(ALLOWED, `${id}: ${line.who}`).toContain(line.mood);
      }
    }
  }
  expect(anyMoodSet).toBe(true);
});
