import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  hashChunk,
  selectChunks,
  chunkHashesOf,
  bundleLines,
  extractComments,
  renderBundle,
  isInsideChunk,
  schemaFrom,
  shapePaths,
  nextChunkHashes,
  bundleAktuell,
} from '../scripts/lib/translate-chunks.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('selectChunks uebersetzt nur Chunks mit geaendertem Hash, ohne prevHashes alles', () => {
  const chunks = [
    { path: ['ui'], data: { a: 1 } },
    { path: ['stations', 's01'], data: { t: 'x' } },
    { path: ['stations', 's07'], data: { t: 'neu' } },
  ];
  const prev = { ui: hashChunk({ a: 1 }), 'stations.s01': hashChunk({ t: 'x' }) };
  const r = selectChunks(chunks, prev, false);
  expect(r.todo.map((c) => c.path.join('.'))).toEqual(['stations.s07']);
  expect(r.keep.map((c) => c.path.join('.'))).toEqual(['ui', 'stations.s01']);
  expect(selectChunks(chunks, {}, false).todo).toHaveLength(3);
  expect(selectChunks(chunks, prev, true).todo).toHaveLength(3);
});

test('hashChunk ist stabil, kurz und reagiert auf jede Aenderung', () => {
  expect(hashChunk({ a: 1 })).toBe(hashChunk({ a: 1 }));
  expect(hashChunk({ a: 1 })).toMatch(/^[0-9a-f]{12}$/);
  expect(hashChunk({ a: 1 })).not.toBe(hashChunk({ a: 2 }));
  // Reihenfolge der Schluessel zaehlt (JSON.stringify), damit eine Umsortierung in de.js
  // ebenfalls eine Neuuebersetzung ausloest — die Reihenfolge steht auch im Bundle.
  expect(hashChunk({ a: 1, b: 2 })).not.toBe(hashChunk({ b: 2, a: 1 }));
});

// Der Cache darf nur Haken setzen, die er verdient hat. `--chunk` uebernimmt auch Chunks, deren
// deutsche Quelle sich geaendert hat — stuende danach der AKTUELLE Hash in der Zeile, waere der
// Chunk fuer immer "aktuell" und wuerde nie wieder uebersetzt (Review-Befund 1 zu Task 9).
test('nextChunkHashes schreibt aktuelle Hashes nur fuer uebersetzte und geprueft gleiche Chunks', () => {
  const aktuell = { ui: 'aaaaaaaaaaaa', 'stations.s01': 'bbbbbbbbbbbb', 'stations.s02': 'cccccccccccc', 'stations.s09': 'dddddddddddd' };
  const gespeichert = { ui: 'aaaaaaaaaaaa', 'stations.s01': 'ALTALTALTALT', 'stations.s02': 'cccccccccccc' };
  const neu = nextChunkHashes(gespeichert, aktuell, ['stations.s09']);
  expect(neu).toEqual({
    ui: 'aaaaaaaaaaaa', //            uebernommen, Hash stimmte -> aktuell
    'stations.s01': 'ALTALTALTALT', // uebernommen trotz Aenderung -> alter Hash bleibt stehen
    'stations.s02': 'cccccccccccc', // uebernommen, Hash stimmte
    'stations.s09': 'dddddddddddd', // in diesem Lauf uebersetzt
  });
  // Ohne gespeicherten Hash und ohne Uebersetzung gibt es gar keinen Eintrag.
  expect(nextChunkHashes({}, { ui: 'aaaaaaaaaaaa' }, [])).toEqual({});
  expect(nextChunkHashes(null, { ui: 'aaaaaaaaaaaa' }, ['ui'])).toEqual({ ui: 'aaaaaaaaaaaa' });
});

test('ein mitgeschleppter Chunk ist beim naechsten Lauf wieder faellig', () => {
  const chunks = [
    { path: ['ui'], data: { a: 1 } },
    { path: ['stations', 's01'], data: { t: 'geaendert' } },
    { path: ['stations', 's09'], data: { t: 'neu' } },
  ];
  const aktuell = chunkHashesOf(chunks);
  // Stand vor dem Lauf: s01 hat sich geaendert, s09 ist neu.
  const gespeichert = { ui: aktuell.ui, 'stations.s01': hashChunk({ t: 'alt' }) };
  // `--chunk stations.s09`: nur s09 wird uebersetzt, s01 wird mitgeschleppt.
  const geschrieben = nextChunkHashes(gespeichert, aktuell, ['stations.s09']);
  const danach = selectChunks(chunks, geschrieben, false);
  expect(danach.todo.map((c) => c.path.join('.'))).toEqual(['stations.s01']);
  expect(bundleAktuell(geschrieben, aktuell)).toBe(false);
  // Waere der aktuelle Hash gestempelt worden, saehe der naechste Lauf nichts mehr:
  expect(selectChunks(chunks, aktuell, false).todo).toHaveLength(0);
});

test('bundleAktuell erkennt vollstaendige und unvollstaendige Buendel', () => {
  const aktuell = { ui: 'aaaaaaaaaaaa', 'stations.s01': 'bbbbbbbbbbbb' };
  expect(bundleAktuell(aktuell, aktuell)).toBe(true);
  expect(bundleAktuell({ ui: 'aaaaaaaaaaaa' }, aktuell)).toBe(false); // Chunk fehlt ganz
  expect(bundleAktuell({ ui: 'aaaaaaaaaaaa', 'stations.s01': 'ALT' }, aktuell)).toBe(false);
  expect(bundleAktuell(null, aktuell)).toBeNull(); // altes Format: sourceHash entscheidet allein
});

test('chunkHashesOf liefert die Hashes unter dem punktierten Pfad', () => {
  const chunks = [{ path: ['ui'], data: { a: 1 } }, { path: ['stations', 's01'], data: { t: 'x' } }];
  expect(chunkHashesOf(chunks)).toEqual({ ui: hashChunk({ a: 1 }), 'stations.s01': hashChunk({ t: 'x' }) });
});

test('isInsideChunk trennt Chunk-Pfade sauber, auch bei gemeinsamem Praefix', () => {
  expect(isInsideChunk('stations.s01', 'stations.s01')).toBe(true);
  expect(isInsideChunk('stations.s01#end', 'stations.s01')).toBe(true);
  expect(isInsideChunk('stations.s01.tasks[0].text', 'stations.s01')).toBe(true);
  expect(isInsideChunk('stations.s010.title', 'stations.s01')).toBe(false);
  expect(isInsideChunk('ui.check', 'stations.s01')).toBe(false);
});

// bundleLines ist die Grundlage der Kommentar-Uebernahme: jede Zeile bekommt einen Schluessel.
// Der Zeilentext muss Zeichen fuer Zeichen dem entsprechen, was JSON.stringify(data, null, 2)
// erzeugt — sonst findet extractComments() die Ankerzeile im vorhandenen Bundle nicht wieder.
test('bundleLines reproduziert JSON.stringify(data, null, 2) exakt', () => {
  const data = {
    ui: { a: 'x', n: 3, b: true, leer: {}, nichts: [] },
    stations: { s01: { tasks: [{ kind: 'auftrag', text: 'a"b' }, { kind: 'remix', text: 'ü' }] } },
  };
  expect(bundleLines(data).map((l) => l.text).join('\n')).toBe(JSON.stringify(data, null, 2));
});

test('bundleLines vergibt eindeutige Schluessel je Zeile', () => {
  const data = { ui: { a: 'x' }, stations: { s01: { tasks: [{ kind: 'auftrag' }] } } };
  const keys = bundleLines(data).map((l) => l.key);
  expect(new Set(keys).size).toBe(keys.length);
  expect(keys).toContain('stations.s01.tasks[0].kind');
});

test('extractComments und renderBundle erhalten Handkorrektur-Kommentare an ihrer Stelle', () => {
  const data = { ui: { a: 'x' }, stations: { s01: { title: 'T' } } };
  const datei = [
    '// AUTO-GENERATED by scripts/translate.mjs — NICHT von Hand bearbeiten.',
    '// Source: src/i18n/de.js   sourceHash: aaaaaaaaaaaa',
    '// Language: en   model: claude-opus-5   generated: 2026-09-04T00:00:00.000Z',
    '// Stuetz-Ebene: Deutsch bleibt daneben sichtbar. Bei Aenderung an de.js neu erzeugen.',
    '// Handkorrektur 2026-09-04: Sammelvermerk im Kopf.',
    '',
    'export default {',
    '  "ui": {',
    '    // Handkorrektur 2026-09-04: a bleibt x.',
    '    "a": "x"',
    '  },',
    '  "stations": {',
    '    "s01": {',
    '      "title": "T"',
    '    }',
    '  }',
    '};',
    '',
  ].join('\n');

  const gelesen = extractComments(datei, data);
  expect(gelesen).not.toBeNull();
  expect(gelesen.extraHeader).toEqual(['// Handkorrektur 2026-09-04: Sammelvermerk im Kopf.']);
  expect(gelesen.comments.get('ui.a')).toEqual(['    // Handkorrektur 2026-09-04: a bleibt x.']);

  const neu = renderBundle(data, datei.split('\n').slice(0, 5), gelesen.comments);
  expect(neu).toBe(datei);
});

test('extractComments meldet null, wenn die Datei nicht zu den Daten passt', () => {
  const datei = 'export default {\n  "ui": {\n    "a": "y"\n  }\n};\n';
  expect(extractComments(datei, { ui: { a: 'x' } })).toBeNull();
  expect(extractComments('const x = 1;\n', { ui: { a: 'x' } })).toBeNull();
});

// Regressionstest zum Schema-Fehler vom 04.09.2026: `exercises` ist in s08/s09
// `[{prompt}, {prompt, explain}]`. Wurde das items-Schema nur aus Element 0 gebildet, verbot
// `additionalProperties: false` dem Modell das Feld `explain` — es fehlte danach in allen fuenf
// Sprachen, ohne dass irgendwo ein Fehler auftrat.
test('schemaFrom erlaubt Schluessel, die erst in einem spaeteren Array-Element vorkommen', () => {
  const items = schemaFrom({ exercises: [{ prompt: 'a' }, { prompt: 'b', explain: 'c' }] }).properties.exercises.items;
  expect(Object.keys(items.properties)).toEqual(['prompt', 'explain']);
  expect(items.required).toEqual(['prompt']); // Durchschnitt: Element 0 hat kein explain
  expect(items.additionalProperties).toBe(false);
});

test('schemaFrom bildet Skalare und gleichfoermige Arrays unveraendert ab', () => {
  expect(schemaFrom('x')).toEqual({ type: 'string' });
  expect(schemaFrom(3)).toEqual({ type: 'number' });
  expect(schemaFrom(true)).toEqual({ type: 'boolean' });
  expect(schemaFrom([]).items).toEqual({});
  const antworten = schemaFrom([{ text: 'x', correct: true }, { text: 'y', correct: false }]);
  expect(antworten.items.required).toEqual(['text', 'correct']);
  expect(antworten.items.properties.correct).toEqual({ type: 'boolean' });
});

test('shapePaths listet Blattpfade mit Array-Index', () => {
  expect(shapePaths({ a: 'x', t: [{ k: 1 }, { k: 2, e: 'z' }] })).toEqual(['a', 't[0].k', 't[1].k', 't[1].e']);
});

// Regressionstest gegen die ausgelieferten Buendel: der Zeilenaufbau von bundleLines() muss zu
// den erzeugten Dateien passen, sonst faellt die Kommentar-Uebernahme beim naechsten Lauf still
// auf "keine Kommentare" zurueck und alle Handkorrektur-Vermerke waeren weg.
for (const code of ['en', 'uk', 'ar', 'es', 'it']) {
  test(`${code}.js laesst sich in Kommentare und Daten zerlegen`, async () => {
    const file = path.join(ROOT, 'src', 'i18n', `${code}.js`);
    const data = (await import(`../src/i18n/${code}.js`)).default;
    const gelesen = extractComments(fs.readFileSync(file, 'utf8'), data);
    expect(gelesen).not.toBeNull();
    // Und zurueckgeschrieben ergibt es wieder exakt die Datei.
    const kopf = fs.readFileSync(file, 'utf8').split('\n');
    const bis = kopf.findIndex((l) => l.startsWith('export default '));
    expect(renderBundle(data, kopf.slice(0, bis - 1), gelesen.comments)).toBe(fs.readFileSync(file, 'utf8'));
  });
}
