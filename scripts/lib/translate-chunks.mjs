/**
 * Chunk-Cache und Kommentar-Uebernahme fuer scripts/translate.mjs.
 *
 * Zwei Aufgaben, die zusammengehoeren:
 *
 * 1. **Chunk-Cache.** Ein erzeugtes Buendel traegt neben dem `sourceHash` der ganzen deutschen
 *    Datei eine Zeile `// chunkHashes: {"ui":"…","stations.s01":"…",…}`. Beim naechsten Lauf
 *    werden nur die Chunks uebersetzt, deren deutscher Teilbaum sich geaendert hat; die uebrigen
 *    werden aus dem vorhandenen Buendel uebernommen. Das spart Geld und — wichtiger — es haelt
 *    die Handkorrekturen in den unveraenderten Teilen fest.
 *
 * 2. **Kommentar-Uebernahme.** Die Buendel dokumentieren jede Handkorrektur mit einem datierten
 *    `//`-Kommentar in der Zeile davor. `JSON.stringify` kennt keine Kommentare, ein Neulauf
 *    wuerde sie also alle wegwerfen — auch in Chunks, die gar nicht neu uebersetzt wurden.
 *    `bundleLines()` gibt darum jeder Zeile der erzeugten Datei einen stabilen Schluessel,
 *    `extractComments()` haengt die Kommentare des alten Buendels an diese Schluessel, und
 *    `renderBundle()` schreibt sie an derselben Stelle wieder heraus. Kommentare in neu
 *    uebersetzten Chunks werden bewusst fallen gelassen — sie beschreiben einen Text, den es
 *    nicht mehr gibt.
 */
import crypto from 'node:crypto';

/** sha256 ueber die JSON-Form des Teilbaums, auf 12 Hex gekuerzt (wie der sourceHash). */
export function hashChunk(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex').slice(0, 12);
}

/** chunk = { path: string[], data }; prevHashes = { '<path.join(".")>': hash }. */
export function selectChunks(chunks, prevHashes, force) {
  const prev = prevHashes || {};
  const todo = [];
  const keep = [];
  for (const chunk of chunks) {
    const key = chunk.path.join('.');
    if (!force && prev[key] && prev[key] === hashChunk(chunk.data)) keep.push(chunk);
    else todo.push(chunk);
  }
  return { todo, keep };
}

/** Die Hash-Tabelle, die als `// chunkHashes:`-Zeile ins Buendel geschrieben wird. */
export function chunkHashesOf(chunks) {
  return Object.fromEntries(chunks.map((c) => [c.path.join('.'), hashChunk(c.data)]));
}

/**
 * Die `chunkHashes`-Zeile fuer das neu geschriebene Buendel.
 *
 * Ein Hash darf nur dort stehen, wo er verdient ist — sonst behauptet die Zeile einen Stand, den
 * die Datei nicht hat, und jeder weitere Lauf haelt den Chunk fuer aktuell:
 *
 * | Fall | was geschrieben wird |
 * |---|---|
 * | in diesem Lauf uebersetzt | aktueller Hash |
 * | uebernommen, gespeicherter Hash == aktueller | aktueller Hash (dasselbe) |
 * | uebernommen, gespeicherter Hash weicht ab (`--chunk`) | **der gespeicherte, alte** Hash |
 * | uebernommen, kein gespeicherter Hash | **kein Eintrag** — naechster Lauf uebersetzt ihn |
 *
 * `prevHashes` ist die Tabelle, die die keep-Entscheidung getragen hat: die gespeicherte Zeile
 * des Buendels, sonst die aus `--prev-source` abgeleitete.
 */
export function nextChunkHashes(prevHashes, currentHashes, translatedPaths) {
  const prev = prevHashes || {};
  const uebersetzt = new Set(translatedPaths || []);
  const out = {};
  for (const [key, aktuell] of Object.entries(currentHashes)) {
    if (uebersetzt.has(key) || prev[key] === aktuell) out[key] = aktuell;
    else if (prev[key] !== undefined) out[key] = prev[key];
  }
  return out;
}

/** Ist jeder aktuelle Chunk in der gespeicherten Tabelle mit demselben Hash vermerkt? */
export function bundleAktuell(prevHashes, currentHashes) {
  if (!prevHashes) return null; // altes Format ohne chunkHashes-Zeile: keine Aussage moeglich
  return Object.entries(currentHashes).every(([key, h]) => prevHashes[key] === h);
}

/** Wert an einem Pfad-Array (['stations','s01']) im Buendel. */
export function valueAt(obj, path) {
  return path.reduce((cur, key) => (cur == null ? cur : cur[key]), obj);
}

/** Wert an einem Pfad-Array setzen, fehlende Ebenen anlegen. */
export function setPath(target, path, value) {
  let cur = target;
  for (const p of path.slice(0, -1)) cur = (cur[p] ||= {});
  cur[path[path.length - 1]] = value;
}

/**
 * Gehoert der Zeilenschluessel `key` zum Chunk `chunkPath` (punktiert)? Der Chunk selbst, seine
 * Schlusszeile (`…#end`) und alles darunter gehoeren dazu — `stations.s010` aber nicht zu
 * `stations.s01`, deshalb wird das naechste Zeichen geprueft statt nur der Praefix.
 */
export function isInsideChunk(key, chunkPath) {
  if (key === chunkPath) return true;
  if (!key.startsWith(chunkPath)) return false;
  return ['.', '[', '#'].includes(key[chunkPath.length]);
}

/**
 * Zerlegt `JSON.stringify(data, null, 2)` in Zeilen mit Schluessel. Der Text jeder Zeile ist
 * exakt die Zeile, die JSON.stringify erzeugt (Test in tests/translate-chunks.test.js).
 * Schluessel: Blatt und oeffnende Zeile bekommen den Pfad, die schliessende Zeile `<pfad>#end`.
 */
export function bundleLines(data) {
  const lines = [];
  emit(data, '', '', 0, '', lines);
  return lines;
}

function emit(value, key, prefix, depth, suffix, lines) {
  const pad = '  '.repeat(depth);
  if (value === null || typeof value !== 'object') {
    lines.push({ key, text: pad + prefix + JSON.stringify(value) + suffix });
    return;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) { lines.push({ key, text: pad + prefix + '[]' + suffix }); return; }
    lines.push({ key, text: pad + prefix + '[' });
    value.forEach((v, i) => emit(v, `${key}[${i}]`, '', depth + 1, i === value.length - 1 ? '' : ',', lines));
    lines.push({ key: `${key}#end`, text: pad + ']' + suffix });
    return;
  }
  const entries = Object.entries(value);
  if (entries.length === 0) { lines.push({ key, text: pad + prefix + '{}' + suffix }); return; }
  lines.push({ key, text: pad + prefix + '{' });
  entries.forEach(([k, v], i) => {
    emit(v, key ? `${key}.${k}` : k, `${JSON.stringify(k)}: `, depth + 1, i === entries.length - 1 ? '' : ',', lines);
  });
  lines.push({ key: `${key}#end`, text: pad + '}' + suffix });
}

// Die vier Zeilen, die serialize() selbst schreibt — alles andere im Kopf ist Handarbeit und
// wird uebernommen.
const KOPFZEILEN = ['// AUTO-GENERATED', '// Source:', '// chunkHashes:', '// Language:', '// Stuetz-Ebene:'];

/**
 * Liest Kopf-Handkommentare und die Kommentare im Rumpf aus einem erzeugten Buendel.
 * `data` ist der Default-Export derselben Datei. Passt der Rumpf nicht Zeile fuer Zeile zu
 * `bundleLines(data)`, wird `null` geliefert — der Aufrufer schreibt dann ohne Kommentare
 * weiter, statt sie an falschen Stellen einzusetzen.
 */
export function extractComments(fileText, data) {
  const lines = fileText.split('\n').map((l) => (l.endsWith('\r') ? l.slice(0, -1) : l));
  const start = lines.findIndex((l) => l.startsWith('export default '));
  if (start === -1) return null;
  let ende = -1;
  for (let i = lines.length - 1; i >= start; i--) if (lines[i].trim() === '};') { ende = i; break; }
  if (ende === -1) return null;

  const extraHeader = lines
    .slice(0, start)
    .filter((l) => l.trim().startsWith('//') && !KOPFZEILEN.some((k) => l.startsWith(k)));

  const body = lines.slice(start, ende + 1);
  body[0] = body[0].replace(/^export default /, '');
  body[body.length - 1] = body[body.length - 1].replace(/;$/, '');

  const ref = bundleLines(data);
  const comments = new Map();
  let buffer = [];
  let j = 0;
  for (const line of body) {
    if (line.trim().startsWith('//')) { buffer.push(line); continue; }
    if (j >= ref.length || line !== ref[j].text) return null;
    if (buffer.length) { comments.set(ref[j].key, buffer); buffer = []; }
    j++;
  }
  if (j !== ref.length || buffer.length) return null;
  return { extraHeader, comments };
}

/** Kopfzeilen + `export default {…};` mit den Kommentaren an ihren Schluesselzeilen. */
export function renderBundle(data, headerLines, comments) {
  const ref = bundleLines(data);
  const out = [...headerLines, ''];
  ref.forEach((line, i) => {
    const c = comments && comments.get(line.key);
    if (c) out.push(...c);
    let text = line.text;
    if (i === 0) text = `export default ${text}`;
    if (i === ref.length - 1) text += ';';
    out.push(text);
  });
  out.push('');
  return out.join('\n');
}

/**
 * JSON-Schema aus Beispieldaten. Arrays: die Element-Schemata werden verschmolzen, nicht vom
 * ersten Element abgeleitet.
 *
 * Warum das wichtig ist (04.09.2026, Task 9 Plan 3): `exercises` in s08/s09 ist
 * `[{prompt}, {prompt, explain}]`. Die alte Fassung nahm `schemaFrom(data[0])` als items-Schema,
 * also `{prompt}` mit `additionalProperties: false` — das Modell DURFTE `explain` gar nicht
 * liefern und liess es in allen fuenf Sprachen weg. Der Fehler steckte von Anfang an im Skript,
 * gebissen hat er erst, als eine Station das erste uneinheitliche Array bekam.
 * `required` ist der Durchschnitt (sonst muesste Element 0 ein `explain` erfinden); dass das
 * Feld damit optional wird, faengt der Formvergleich in translate.mjs ab.
 */
export function schemaFrom(data) {
  if (typeof data === 'string') return { type: 'string' };
  if (typeof data === 'number') return { type: 'number' };
  if (typeof data === 'boolean') return { type: 'boolean' };
  if (Array.isArray(data)) return { type: 'array', items: data.length ? mergeSchemas(data.map(schemaFrom)) : {} };
  const properties = {}; const required = [];
  for (const [k, v] of Object.entries(data)) { properties[k] = schemaFrom(v); required.push(k); }
  return { type: 'object', properties, required, additionalProperties: false };
}

function mergeSchemas(list) {
  if (list.length === 1) return list[0];
  if (!list.every((s) => s.type === 'object' && s.properties)) return list[0];
  const properties = {};
  for (const s of list) {
    for (const [k, v] of Object.entries(s.properties)) properties[k] = properties[k] ? mergeSchemas([properties[k], v]) : v;
  }
  const required = Object.keys(properties).filter((k) => list.every((s) => s.required.includes(k)));
  return { type: 'object', properties, required, additionalProperties: false };
}

/**
 * Pfadliste eines Teilbaums — dieselbe Form wie in tests/i18n-complete.test.js. Damit vergleicht
 * translate.mjs die Antwort des Modells mit dem deutschen Original, bevor sie ins Buendel geht:
 * ein fehlender oder erfundener Schluessel faellt sofort auf und nicht erst im Testlauf.
 */
export function shapePaths(obj, prefix = '') {
  if (Array.isArray(obj)) return obj.flatMap((v, i) => shapePaths(v, `${prefix}[${i}]`));
  if (obj && typeof obj === 'object') return Object.entries(obj).flatMap(([k, v]) => shapePaths(v, prefix ? `${prefix}.${k}` : k));
  return [prefix];
}

/** Kommentare fallen lassen, die in einem neu uebersetzten Chunk stehen. */
export function commentsWithoutChunks(comments, chunkPaths) {
  const out = new Map();
  for (const [key, lines] of comments) {
    if (chunkPaths.some((p) => isInsideChunk(key, p))) continue;
    out.set(key, lines);
  }
  return out;
}
