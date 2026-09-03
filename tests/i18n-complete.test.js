import de from '../src/i18n/de.js';
import en from '../src/i18n/en.js';
import uk from '../src/i18n/uk.js';
import ar from '../src/i18n/ar.js';
import es from '../src/i18n/es.js';
import it from '../src/i18n/it.js'; // noch nicht in TRANSLATED — folgt, sobald it.js generiert ist

function paths(obj, prefix = '') {
  if (Array.isArray(obj)) return obj.flatMap((v, i) => paths(v, `${prefix}[${i}]`));
  if (obj && typeof obj === 'object') return Object.entries(obj).flatMap(([k, v]) => paths(v, prefix ? `${prefix}.${k}` : k));
  return [prefix];
}

// Uebersetzte Sprachen. `it` fehlt noch: der API-Schluessel hatte am 03.09.2026 kein Guthaben
// mehr (Task 8). Nach `node scripts/translate.mjs --lang it` hier ergaenzen.
const TRANSLATED = { en, uk, ar, es };
const want = paths(de);

for (const [code, bundle] of Object.entries(TRANSLATED)) {
  test(`${code} hat exakt die Schluessel von de`, () => {
    expect(paths(bundle)).toEqual(want);
  });
  test(`${code}: Code-Woerter und Platzhalter bleiben erhalten`, () => {
    expect(bundle.stations.s02.quiz[0].answers[0].text).toMatch(/agent\.move\(FORWARD, 3\)/);
    expect(bundle.ui.station).toMatch(/\{n\}/);
    expect(bundle.ui.progress).toMatch(/\{done\}.*\{total\}/);
  });
  test(`${code}: quiz.correct bleibt boolean und genau einmal wahr`, () => {
    for (const q of bundle.stations.s02.quiz) expect(q.answers.filter((a) => a.correct === true)).toHaveLength(1);
  });
}
