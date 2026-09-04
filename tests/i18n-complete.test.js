import de from '../src/i18n/de.js';
import en from '../src/i18n/en.js';
import uk from '../src/i18n/uk.js';
import ar from '../src/i18n/ar.js';
import es from '../src/i18n/es.js';
import it from '../src/i18n/it.js';

function paths(obj, prefix = '') {
  if (Array.isArray(obj)) return obj.flatMap((v, i) => paths(v, `${prefix}[${i}]`));
  if (obj && typeof obj === 'object') return Object.entries(obj).flatMap(([k, v]) => paths(v, prefix ? `${prefix}.${k}` : k));
  return [prefix];
}

// Wie paths(), liefert aber nur String-Blaetter mitsamt Wert.
function stringEntries(obj, prefix = '') {
  if (Array.isArray(obj)) return obj.flatMap((v, i) => stringEntries(v, `${prefix}[${i}]`));
  if (obj && typeof obj === 'object') return Object.entries(obj).flatMap(([k, v]) => stringEntries(v, prefix ? `${prefix}.${k}` : k));
  return typeof obj === 'string' ? [[prefix, obj]] : [];
}

// "stations.s06.tasks[0].text" -> Wert im Bundle.
function valueAt(bundle, path) {
  return path.split(/\.|\[|\]/).filter(Boolean).reduce((cur, key) => (cur == null ? cur : cur[key]), bundle);
}

// Uebersetzte Sprachen. `it` seit 03.09.2026 vollstaendig (Nachtrag zu Task 8).
const TRANSLATED = { en, uk, ar, es, it };
const want = paths(de);

// Zauberwoerter = die Chat-Kommandos, die die SuS im Spiel tippen (Kanon MAGIC_WORDS in
// scripts/translate.mjs). Sie sind Eingaben an Minecraft, keine Prosa: uebersetzt eine Sprache
// sie, ist die Aufgabe im Spiel unloesbar (Review T9, 03.09.2026: it schrieb "casa" statt "haus").
// Gross-/Kleinschreibung zaehlt — "Weg", "Turm", "Mauer", "Wand", "Haus" sind im Deutschen die
// normalen Substantive und werden sehr wohl uebersetzt; nur das kleingeschriebene Chat-Wort nicht.
const MAGIC_WORDS = ['hi', 'hallo', 'weg', 'turm', 'mauer', 'wand', 'haus', 'bruecke'];
const MAGIC_RE = new RegExp(`\\b(?:${MAGIC_WORDS.join('|')})\\b`, 'g');
const deStrings = stringEntries(de);

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
  test(`${code}: Zauberwoerter stehen unveraendert an derselben Stelle wie in de`, () => {
    const fehlend = [];
    for (const [path, deText] of deStrings) {
      const woerter = [...new Set(deText.match(MAGIC_RE) || [])];
      if (!woerter.length) continue;
      const ziel = String(valueAt(bundle, path) ?? '');
      for (const wort of woerter) {
        if (!new RegExp(`\\b${wort}\\b`).test(ziel)) fehlend.push(`${path}: "${wort}" fehlt in "${ziel}"`);
      }
    }
    expect(fehlend).toEqual([]);
  });
}

// Arabisch-indische Ziffern (٠١٢٣٤٥٦٧٨٩, dazu die persische Variante ۰۱۲۳۴۵۶۷۸۹) sind fuer die
// Zielgruppe keine Hilfe: die Zahlen im Kurs stehen im Spiel, im Code und im deutschen Text
// lateinisch daneben. Der Uebersetzungslauf mischte beide Systeme (Review T9, 03.09.2026).
test('ar: nur lateinische Ziffern, keine arabisch-indischen', () => {
  const treffer = stringEntries(ar).filter(([, v]) => /[٠-٩۰-۹]/.test(v)).map(([p, v]) => `${p}: ${v}`);
  expect(treffer).toEqual([]);
});
