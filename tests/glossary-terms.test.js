import de from '../src/i18n/de.js';
import es from '../src/i18n/es.js';
import uk from '../src/i18n/uk.js';

// Regressionstest fuer die glossary.*.term-Werte in es und uk. Pinnt die Handkorrekturen aus
// Plan 1 (Review Task 8, 03.09.2026: DE-Reste -> Zielsprache) fest, damit eine Neuuebersetzung
// (`translate.mjs --lang all`) sie nicht still durch einen deutschen Rest oder eine schlechtere
// Uebersetzung ersetzt. agent und python sind ausgenommen (Prompt-Regel 7: Namen bleiben
// unuebersetzt).
//
// 04.09.2026 (Plan 3 Task 9): die vier Eisen-Begriffe kommen dazu, Werte aus dem Lauf.
// `fill` bleibt `fill` — das ist der Minecraft-Befehl, den die SuS tippen, kein Wort zum
// Uebersetzen (steht deshalb auch in IDENT_CANON in scripts/translate.mjs).
const EXPECTED = {
  es: {
    befehl: 'Orden',
    programm: 'Programa',
    sequenz: 'Secuencia',
    zauberwort: 'Palabra mágica',
    bloecke: 'Bloques',
    fehler: 'Error',
    variable: 'Variable',
    koordinaten: 'Coordenadas',
    fill: 'fill',
    zaehler: 'Contador',
  },
  uk: {
    befehl: 'Команда',
    programm: 'Програма',
    sequenz: 'Послідовність',
    zauberwort: 'Чарівне слово',
    bloecke: 'Блоки',
    fehler: 'Помилка',
    variable: 'Змінна',
    koordinaten: 'Координати',
    fill: 'fill',
    zaehler: 'Лічильник',
  },
};

const TRANSLATED = { es, uk };

for (const [code, bundle] of Object.entries(TRANSLATED)) {
  test(`${code}: gepinnte Glossarbegriffe entsprechen den Handkorrekturen`, () => {
    const got = Object.fromEntries(
      Object.keys(EXPECTED[code]).map((key) => [key, bundle.glossary[key].term])
    );
    expect(got).toEqual(EXPECTED[code]);
  });
}

test('EXPECTED-Schluessel sind eine Teilmenge des deutschen Glossars (ohne agent/python)', () => {
  const deutscheSchluessel = Object.keys(de.glossary).sort();
  for (const code of Object.keys(TRANSLATED)) {
    for (const key of Object.keys(EXPECTED[code])) expect(deutscheSchluessel).toContain(key);
  }
});
