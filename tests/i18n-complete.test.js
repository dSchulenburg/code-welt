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
// Plan 3 (Eisen, 04.09.2026): plattform (s08) und treppe (s09) kommen dazu.
// Plan 4 (Gold, 17.09.2026): ecke, loecher, ziel; if, else, while, not, detect.
const MAGIC_WORDS = ['hi', 'hallo', 'weg', 'turm', 'mauer', 'wand', 'haus', 'bruecke', 'plattform', 'treppe', 'ecke', 'loecher', 'ziel'];
const MAGIC_RE = new RegExp(`\\b(?:${MAGIC_WORDS.join('|')})\\b`, 'g');

// Bezeichner aus dem Kurs-Code (Kanon IDENT_CANON in scripts/translate.mjs, Prompt-Regel 12).
// Sie stehen in de.js mitten in der Prosa ("laenge steht einmal oben", "index zaehlt 0, 1, 2 …")
// und meinen dieselbe Zeile, die die SuS im Editor vor sich haben: uebersetzt eine Sprache sie,
// findet niemand die Zeile wieder. Gross-/Kleinschreibung zaehlt wie bei den Zauberwoertern —
// "Stufen", "Länge", "Position" sind normale Substantive und werden sehr wohl uebersetzt.
const IDENT_CANON = ['laenge', 'stufen', 'index', 'pos', 'fill', 'if', 'else', 'while', 'not', 'detect'];
const IDENT_RE = new RegExp(`\\b(?:${IDENT_CANON.join('|')})\\b`, 'g');

// Ausnahme 04.09.2026 (Plan 3 Task 9, Station s08): In "Weit weg" ist "weg" das gewoehnliche
// Adverb und wird uebersetzt ("Far away", "Muy lejos", "Molto lontano", …). Die Faustregel
// "nur das kleingeschriebene Wort ist das Chat-Kommando" trennt hier nicht, weil auch das
// Adverb klein geschrieben wird — deshalb diese pfadgenaue Ausnahme statt einer weicheren Regel.
// Prompt-Regel 1 in scripts/translate.mjs nennt den Fall jetzt ausdruecklich.
const ZAUBERWORT_AUSNAHMEN = { 'stations.s08.quiz[1].answers[2].text': ['weg'] };

const deStrings = stringEntries(de);

// Zauberwort- und Bezeichner-Test pruefen dasselbe Muster: ein Wort, das im deutschen String
// steht, muss im uebersetzten String an derselben Stelle unveraendert wieder auftauchen.
function fehlendeWoerter(bundle, regex, ausnahmen = {}) {
  const fehlend = [];
  for (const [path, deText] of deStrings) {
    const woerter = [...new Set(deText.match(regex) || [])]
      .filter((w) => !(ausnahmen[path] || []).includes(w));
    if (!woerter.length) continue;
    const ziel = String(valueAt(bundle, path) ?? '');
    for (const wort of woerter) {
      // Handkorrektur 2026-09-04 (Re-Review T9): wort stammt aus dem Kanon und ist damit
      // aktuell unkritisch, aber ungeescapt in ein RegExp eingesetzt waere jedes kuenftige
      // Wort mit Regex-Sonderzeichen ein stiller Bug.
      const wortEscaped = wort.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!new RegExp(`\\b${wortEscaped}\\b`).test(ziel)) fehlend.push(`${path}: "${wort}" fehlt in "${ziel}"`);
    }
  }
  return fehlend;
}

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
    expect(fehlendeWoerter(bundle, MAGIC_RE, ZAUBERWORT_AUSNAHMEN)).toEqual([]);
  });
  test(`${code}: Code-Bezeichner stehen unveraendert an derselben Stelle wie in de`, () => {
    expect(fehlendeWoerter(bundle, IDENT_RE)).toEqual([]);
  });
}

// Arabisch-indische Ziffern (٠١٢٣٤٥٦٧٨٩, dazu die persische Variante ۰۱۲۳۴۵۶۷۸۹) sind fuer die
// Zielgruppe keine Hilfe: die Zahlen im Kurs stehen im Spiel, im Code und im deutschen Text
// lateinisch daneben. Der Uebersetzungslauf mischte beide Systeme (Review T9, 03.09.2026).
test('ar: nur lateinische Ziffern, keine arabisch-indischen', () => {
  const treffer = stringEntries(ar).filter(([, v]) => /[٠-٩۰-۹]/.test(v)).map(([p, v]) => `${p}: ${v}`);
  expect(treffer).toEqual([]);
});
