import de from '../src/i18n/de.js';
import en from '../src/i18n/en.js';
import uk from '../src/i18n/uk.js';
import ar from '../src/i18n/ar.js';
import es from '../src/i18n/es.js';
import it from '../src/i18n/it.js';

// "Boss-Check" ist der Produktbegriff fuer die Abschlussaufgabe einer Etappe. Er steht an vier
// Stellen je Sprache: als Ueberschrift ui.bossCheckHeading und als Titel der drei
// Etappen-Abschluesse (s03 Holz, s06 Stein, s09 Eisen). Sie muessen zusammenpassen — in der App
// stehen Ueberschrift und Titel direkt nebeneinander.
//
// Anlass (Review Task 9, 04.09.2026, zwei Befunde in einem):
//  * Der Uebersetzungslauf erfand pro Sprache eine eigene Variante ("Boss check", "Control final",
//    "Prova del boss"), waehrend die Etappen-Badges aus dem Chunk-Cache weiter "Boss-Check" sagten.
//  * In `ar` war ausserdem das Trennzeichen auseinandergelaufen: s03/s06 mit Doppelpunkt aus dem
//    Lauf vom 03.09., der neue s09-Titel ohne.
//
// TERM/SEP spiegeln BOSSCHECK_CANON in scripts/translate.mjs (Prompt-Regel 13). Kopie statt
// Import, weil scripts/translate.mjs beim Laden sofort main() startet — dasselbe Verfahren wie
// bei MAGIC_WORDS in tests/i18n-complete.test.js.
const CANON = {
  de: { term: 'Boss-Check', sep: ' ' },
  en: { term: 'Boss-Check', sep: ' ' },
  uk: { term: 'Бос-перевірка', sep: ': ' },
  ar: { term: 'اختبار الزعيم', sep: ': ' },
  es: { term: 'Boss-Check', sep: ' ' },
  it: { term: 'Boss-Check', sep: ' ' },
};

// Station -> Etappe, deren Abschluss sie ist.
const ABSCHLUESSE = { s03: 'holz', s06: 'stein', s09: 'eisen' };

const BUNDLES = { de, en, uk, ar, es, it };

for (const [code, bundle] of Object.entries(BUNDLES)) {
  const { term, sep } = CANON[code];

  test(`${code}: ui.bossCheckHeading ist der kanonische Begriff`, () => {
    expect(bundle.ui.bossCheckHeading).toBe(term);
  });

  test(`${code}: die drei Boss-Check-Titel nutzen Begriff und Trennzeichen gleich`, () => {
    // Der Etappenname kommt aus dem Buendel selbst — er ist in tests/etappen-names.test.js
    // gepinnt, hier geht es nur um Begriff und Trennzeichen davor.
    const erwartet = Object.fromEntries(
      Object.entries(ABSCHLUESSE).map(([sid, etappe]) => [sid, `${term}${sep}${bundle.etappen[etappe].name}`])
    );
    const gefunden = Object.fromEntries(
      Object.keys(ABSCHLUESSE).map((sid) => [sid, bundle.stations[sid].bossCheck.title])
    );
    expect(gefunden).toEqual(erwartet);
  });
}

test('jede uebersetzte Sprache deckt dieselben drei Boss-Checks ab wie de', () => {
  const deutsche = Object.keys(de.stations).filter((sid) => de.stations[sid].bossCheck);
  expect(deutsche.sort()).toEqual(Object.keys(ABSCHLUESSE).sort());
  for (const [code, bundle] of Object.entries(BUNDLES)) {
    const eigene = Object.keys(bundle.stations).filter((sid) => bundle.stations[sid].bossCheck);
    expect(eigene.sort(), code).toEqual(deutsche.sort());
  }
});
