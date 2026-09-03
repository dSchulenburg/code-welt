import { ETAPPEN, STATIONS } from '../src/data/stations.js';
import de from '../src/i18n/de.js';
import content from '../src/content/de.js';

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
  for (const k of ['appTitle', 'home', 'support', 'supportShow', 'supportHide', 'station', 'check', 'next', 'prev', 'play', 'langLabel'])
    expect(typeof de.ui[k], k).toBe('string');
});
