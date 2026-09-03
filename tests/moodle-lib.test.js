import { extractId, hasShortname } from '../moodle/lib/mcp.mjs';
import { mlang, pick } from '../moodle/lib/mlang.mjs';
import { toEntities } from '../moodle/lib/entities.mjs';

test('extractId liest die Antwortformate des MCP', () => {
  expect(extractId('✅ Label erstellt!\n\n- **Text:** x\n- **Modul-ID:** 123', 'Modul-ID')).toBe(123);
  expect(extractId('✅ Quiz erfolgreich erstellt!\n- **Modul-ID (cmid):** 45\n- **Quiz-ID:** 9', 'Modul-ID')).toBe(45);
  expect(extractId('- **Quiz-ID:** 9', 'Quiz-ID')).toBe(9);
  expect(extractId('### Kurs\n- **ID:** 7\n', 'ID')).toBe(7);
  expect(() => extractId('nichts', 'Modul-ID')).toThrow(/Modul-ID/);
});

test('mlang baut sechs Bloecke plus other=de und laesst leere Sprachen aus', () => {
  const s = mlang({ de: 'Holz', en: 'Wood', uk: 'Дерево', ar: 'خشب', es: 'Madera', it: 'Legno' });
  expect(s).toBe('{mlang de}Holz{mlang}{mlang en}Wood{mlang}{mlang uk}Дерево{mlang}{mlang ar}خشب{mlang}{mlang es}Madera{mlang}{mlang it}Legno{mlang}{mlang other}Holz{mlang}');
  expect(mlang({ de: 'A', en: '' })).toBe('{mlang de}A{mlang}{mlang other}A{mlang}');
  expect(() => mlang({ en: 'x' })).toThrow(/de/);
});

test('pick zieht denselben Pfad aus allen Bundles', () => {
  const bundles = { de: { a: { b: 'Hallo' } }, en: { a: { b: 'Hello' } } };
  expect(pick(bundles, 'a.b')).toEqual({ de: 'Hallo', en: 'Hello' });
  expect(pick({ de: { arr: [{ t: 'x' }] } }, 'arr[0].t')).toEqual({ de: 'x' });
});

test('toEntities ersetzt nur deutsche Sonderzeichen', () => {
  expect(toEntities('Büro & Straße ÄÖÜ — Дерево خشب')).toBe('B&uuml;ro & Stra&szlig;e &Auml;&Ouml;&Uuml; — Дерево خشب');
});

test('hasShortname erkennt exakten Kurzname-Treffer aus der echten Kursliste', () => {
  const text = '## Gefundene Kurse\n\n### KI im Handel\n- **ID:** 1\n- **Kurzname:** ki-handel\n- **Kategorie ID:** 0\n';
  expect(hasShortname(text, 'ki-handel')).toBe(true);
  expect(hasShortname(text, 'ki-hand')).toBe(false);
  expect(hasShortname(text, 'code-welt')).toBe(false);
});
