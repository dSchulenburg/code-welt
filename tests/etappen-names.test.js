import de from '../src/i18n/de.js';
import en from '../src/i18n/en.js';
import uk from '../src/i18n/uk.js';
import ar from '../src/i18n/ar.js';
import es from '../src/i18n/es.js';
import it from '../src/i18n/it.js'; // noch nicht in TRANSLATED — folgt, sobald it.js generiert ist

// Regressionstest fuer die sieben etappen.*.name-Werte (Minecraft-Ingame-Begriffe). Pinnt die
// korrekten Uebersetzungen fest, damit eine Regenerierung mit --force keinen falschen
// Ingame-Begriff still wieder reinbringt — konkreter Anlass: uk enderdrache stand nach der
// automatischen Uebersetzung faelschlich "Дракон Едему" (Genitiv von "Eden") statt des
// tatsaechlichen Minecraft-Begriffs "Дракон Енду" (Review Task 8, 03.09.2026, korrigiert von
// Hand, siehe Kopfkommentar in src/i18n/uk.js).
//
// Werte per 03.09.2026 aus den aktuellen Sprachdateien uebernommen (en/ar/es unveraendert,
// uk nach der Handkorrektur).
const EXPECTED = {
  en: { holz: 'Wood', stein: 'Stone', eisen: 'Iron', gold: 'Gold', diamant: 'Diamond', netherite: 'Netherite', enderdrache: 'Ender Dragon' },
  uk: { holz: 'Дерево', stein: 'Камінь', eisen: 'Залізо', gold: 'Золото', diamant: 'Алмаз', netherite: 'Незерит', enderdrache: 'Дракон Енду' },
  ar: { holz: 'خشب', stein: 'حجر', eisen: 'حديد', gold: 'ذهب', diamant: 'ألماس', netherite: 'نيذرايت', enderdrache: 'تنين الإندر' },
  es: { holz: 'Madera', stein: 'Piedra', eisen: 'Hierro', gold: 'Oro', diamant: 'Diamante', netherite: 'Netherita', enderdrache: 'Dragón del End' },
};

// Uebersetzte Sprachen. `it` fehlt noch: der API-Schluessel hatte am 03.09.2026 kein Guthaben
// mehr (Task 8). Nach `node scripts/translate.mjs --lang it` hier + in EXPECTED ergaenzen.
const TRANSLATED = { en, uk, ar, es };

for (const [code, bundle] of Object.entries(TRANSLATED)) {
  test(`${code}: etappen-Namen entsprechen den fixierten Minecraft-Ingame-Begriffen`, () => {
    const got = Object.fromEntries(Object.entries(bundle.etappen).map(([key, v]) => [key, v.name]));
    expect(got).toEqual(EXPECTED[code]);
  });
}

test('EXPECTED deckt exakt die sieben deutschen Etappen ab', () => {
  const deutscheSchluessel = Object.keys(de.etappen).sort();
  for (const code of Object.keys(TRANSLATED)) {
    expect(Object.keys(EXPECTED[code]).sort()).toEqual(deutscheSchluessel);
  }
});
