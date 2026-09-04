#!/usr/bin/env node
/**
 * Uebersetzt die Stuetz-Ebene src/i18n/de.js in die fuenf Stuetzsprachen.
 *
 *   node scripts/translate.mjs --lang uk
 *   node scripts/translate.mjs --lang all
 *   node scripts/translate.mjs --lang ar,it --force
 *   node scripts/translate.mjs --lang all --plan            (nur zeigen, was liefe; keine API)
 *   node scripts/translate.mjs --lang all --prev-source 9ce29e7
 *
 * Jede erzeugte Datei traegt den sourceHash der deutschen Quelle. Stimmt er noch,
 * wird uebersprungen; weicht er ab, wird neu uebersetzt. --force erzwingt es.
 * ANTHROPIC_API_KEY aus der Umgebung, sonst aus ./.env oder ../docker/.env.
 * Muster: docker/esa-mathe/scripts/translate-lessons.mjs.
 *
 * Uebersetzt in Teilbaeumen (ui, glossary, etappen, stations.<sid>) mit je eigenem
 * kleinen JSON-Schema; faellt bei Grammatik-/Parse-Fehlern auf Prompt+JSON-Repair zurueck.
 * Teilbaum-Modus ist der Standard, kein Flag noetig.
 *
 * CHUNK-CACHE (Task 9, Plan 3, 04.09.2026): Jedes Buendel traegt zusaetzlich eine Zeile
 * `// chunkHashes: {…}`. Beim naechsten Lauf werden nur die Chunks uebersetzt, deren deutscher
 * Teilbaum sich geaendert hat; die uebrigen werden aus dem vorhandenen Buendel uebernommen —
 * mitsamt ihren Handkorrektur-Kommentaren (scripts/lib/translate-chunks.mjs). Buendel aus der
 * Zeit davor haben nur einen sourceHash; fuer sie sagt `--prev-source <git-ref>`, gegen welchen
 * Stand von de.js sie gerechnet werden sollen (`git show <ref>:src/i18n/de.js`). Ab dem zweiten
 * Lauf ist die Option unnoetig. `--plan` zeigt die Aufteilung, ohne die API anzufassen.
 * Stand 03.09.2026: alle sechs Sprachen (inkl. `it`) sind erzeugt. Die Fix-Runde 1 zu Task 9 hat
 * den Prompt um vier Kanon-Regeln erweitert (Zauberwoerter, Agent-Schreibweise, "Deutsch" als
 * Sprachname, lateinische Ziffern/geschlechtsneutrale Anrede) — siehe MAGIC_WORDS, AGENT_CANON,
 * BLOCKS_CANON, GERMAN_CANON weiter unten. Die Bundles tragen die zugehoerigen Handkorrekturen;
 * ein Neulauf ueberschreibt sie, deshalb danach `npm test` gegen tests/i18n-complete.test.js.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import {
  selectChunks, chunkHashesOf, nextChunkHashes, bundleAktuell, valueAt, setPath, schemaFrom,
  shapePaths, extractComments, renderBundle, commentsWithoutChunks,
} from './lib/translate-chunks.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODEL = 'claude-opus-5';
// Listenpreise Claude Opus 5, USD je 1 Mio. Token (Stand 04.09.2026).
const PREIS_IN = 5, PREIS_OUT = 25;
// Grobwert fuer die Kostenzeile VOR dem Lauf; der Betrag danach kommt aus den echten Tokenzahlen.
const SCHAETZUNG_JE_CHUNK = 0.12;
const KOSTENLOG = path.resolve(ROOT, '..', 'docker', '_assets', 'media-factory', 'cost-log.jsonl');
const TARGETS = ['en', 'uk', 'ar', 'es', 'it'];
const NAMES = { en: 'English', uk: 'Ukrainian', ar: 'Arabic (Modern Standard, simple)', es: 'Spanish', it: 'Italian' };

function parseArgs(argv) {
  const a = { force: false, lang: null, plan: false, chunk: null, prevSource: null, costNote: null, costAsset: null, costLog: KOSTENLOG };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--force') a.force = true;
    else if (argv[i] === '--plan') a.plan = true;
    else if (argv[i] === '--lang') a.lang = argv[++i];
    else if (argv[i] === '--chunk') a.chunk = argv[++i];
    else if (argv[i] === '--prev-source') a.prevSource = argv[++i];
    else if (argv[i] === '--cost-note') a.costNote = argv[++i];
    else if (argv[i] === '--cost-asset') a.costAsset = argv[++i];
    else if (argv[i] === '--cost-log') a.costLog = argv[++i];
    else { console.error(`unbekannte Option ${argv[i]}`); process.exit(1); }
  }
  return a;
}
function hash(s) { return crypto.createHash('sha256').update(s).digest('hex').slice(0, 12); }
function loadDotenv() {
  if (process.env.ANTHROPIC_API_KEY) return;
  for (const p of [path.join(ROOT, '.env'), path.resolve(ROOT, '..', 'docker', '.env')]) {
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"]*)"?\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
    if (process.env.ANTHROPIC_API_KEY) return;
  }
}
function readSourceHash(file) {
  if (!fs.existsSync(file)) return null;
  const m = fs.readFileSync(file, 'utf8').match(/sourceHash: ([0-9a-f]{12})/);
  return m ? m[1] : null;
}
function readChunkHashes(file) {
  if (!fs.existsSync(file)) return null;
  const m = fs.readFileSync(file, 'utf8').match(/^\/\/ chunkHashes: (\{.*\})\s*$/m);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}
/**
 * Laedt src/i18n/de.js aus einem Git-Stand. Fuer Buendel aus der Zeit vor dem Chunk-Cache:
 * sie tragen nur einen sourceHash, aus dem sich die Chunk-Hashes nicht rekonstruieren lassen.
 * Der Umweg ueber eine temporaere .mjs-Datei ist noetig, weil de.js ein ES-Modul ist und
 * import() eine Datei braucht — genau wie beim Laden der aktuellen Quelle.
 */
async function loadDeAt(ref) {
  const text = execFileSync('git', ['show', `${ref}:src/i18n/de.js`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  const tmp = path.join(os.tmpdir(), `code-welt-de-${hash(text)}.mjs`);
  fs.writeFileSync(tmp, text, 'utf8');
  try {
    return { data: (await import(pathToFileURL(tmp).href)).default, sourceHash: hash(text) };
  } finally { try { fs.unlinkSync(tmp); } catch { /* egal */ } }
}
// Eine Zeile ans Kostenlog der Media Factory. Fehlt die Datei, wird nichts angelegt —
// das Log gehoert dem docker-Repo, nicht diesem.
function logKosten(args, kosten, chunks, sprachen) {
  const datum = new Date().toISOString().slice(0, 10);
  const zeile = JSON.stringify({
    date: datum,
    generator: 'translate',
    model: MODEL,
    cost: Number(kosten.toFixed(3)),
    prompt: args.costNote || `${chunks} Chunks x ${sprachen} Sprachen`,
    project: 'code-welt',
    asset: args.costAsset || `i18n/${datum}`,
  });
  if (!fs.existsSync(args.costLog)) { console.log(`Kostenlog ${args.costLog} fehlt — nicht geschrieben:\n${zeile}`); return; }
  const alt = fs.readFileSync(args.costLog, 'utf8');
  fs.appendFileSync(args.costLog, (alt.endsWith('\n') || alt === '' ? '' : '\n') + zeile + '\n', 'utf8');
  console.log(`Kostenlog ${args.costLog}:\n${zeile}`);
}
// Kanonische Zielbegriffe, damit eine Neuuebersetzung (oder ein --force-Lauf) nicht still eine
// gleichwertige Alternativuebersetzung waehlt und die in tests/etappen-names.test.js bzw.
// tests/glossary-terms.test.js gepinnten Werte zerstoert. etappen: alle fuenf Sprachen (deckt
// tests/etappen-names.test.js komplett ab). glossary: nur die Sprachen mit einer per Handkorrektur
// pinnten Auswahl (Task 9, 03.09.2026: es "befehl" kam als "Comando" statt "Orden" zurueck, uk
// "zauberwort" als "Магічне слово" statt "Чарівне слово" — beides plausible Synonyme, aber nicht
// die im Kurs etablierten Begriffe).
const ETAPPEN_CANON = {
  en: { holz: 'Wood', stein: 'Stone', eisen: 'Iron', gold: 'Gold', diamant: 'Diamond', netherite: 'Netherite', enderdrache: 'Ender Dragon' },
  uk: { holz: 'Дерево', stein: 'Камінь', eisen: 'Залізо', gold: 'Золото', diamant: 'Алмаз', netherite: 'Незерит', enderdrache: 'Дракон Енду' },
  ar: { holz: 'خشب', stein: 'حجر', eisen: 'حديد', gold: 'ذهب', diamant: 'ألماس', netherite: 'نيذرايت', enderdrache: 'تنين الإندر' },
  es: { holz: 'Madera', stein: 'Piedra', eisen: 'Hierro', gold: 'Oro', diamant: 'Diamante', netherite: 'Netherita', enderdrache: 'Dragón del End' },
  it: { holz: 'Legno', stein: 'Pietra', eisen: 'Ferro', gold: 'Oro', diamant: 'Diamante', netherite: 'Netherite', enderdrache: "Drago dell'End" },
};
// 04.09.2026 (Plan 3 Task 9): die vier Eisen-Begriffe dazu, deckungsgleich mit
// tests/glossary-terms.test.js. fill bleibt fill (Minecraft-Befehl, siehe IDENT_CANON).
const GLOSSARY_CANON = {
  es: { befehl: 'Orden', programm: 'Programa', sequenz: 'Secuencia', zauberwort: 'Palabra mágica', bloecke: 'Bloques', fehler: 'Error', variable: 'Variable', koordinaten: 'Coordenadas', fill: 'fill', zaehler: 'Contador' },
  uk: { befehl: 'Команда', programm: 'Програма', sequenz: 'Послідовність', zauberwort: 'Чарівне слово', bloecke: 'Блоки', fehler: 'Помилка', variable: 'Змінна', koordinaten: 'Координати', fill: 'fill', zaehler: 'Лічильник' },
};
// Weiterer Kanon aus der Fix-Runde 1 zu Task 9 (03.09.2026). Jeder dieser vier Punkte war nach
// dem ersten Lauf in mindestens einer Sprache falsch und musste von Hand korrigiert werden
// (Vermerke stehen in den betroffenen src/i18n/*.js). Als Prompt-Regel, damit ein spaeterer Lauf
// die Korrekturen nicht wieder einreisst.
//
// Zauberwoerter sind Chat-Kommandos, die die SuS im Spiel tippen — Eingabe, keine Prosa. `it`
// hatte "haus" zu "casa" uebersetzt; damit ist die Aufgabe im Spiel unloesbar.
// tests/i18n-complete.test.js prueft sie pfadgenau gegen de.js.
// Plan 3 (Eisen, 04.09.2026): plattform (s08) und treppe (s09) kommen dazu.
const MAGIC_WORDS = ['hi', 'hallo', 'weg', 'turm', 'mauer', 'wand', 'haus', 'bruecke', 'plattform', 'treppe'];
// Bezeichner aus dem Kurs-Code. Sie stehen in de.js mitten in der Prosa ("laenge steht einmal
// oben", "index zaehlt 0, 1, 2 …") und meinen dort dieselbe Zeile im Editor, die die SuS vor
// sich haben. Uebersetzt eine Sprache sie, findet niemand die Zeile wieder. Anders als die
// Zauberwoerter sind sie keine Chat-Eingabe, sondern Namen im Programm — deshalb eine eigene
// Regel und ein eigener Test (tests/i18n-complete.test.js). `fill` ist zusaetzlich ein
// Glossarbegriff und bleibt auch dort als glossary.fill.term stehen.
const IDENT_CANON = ['laenge', 'stufen', 'index', 'pos', 'fill'];
// Schreibweise des Minecraft-Roboters. es/it beugen den Artikel davor, nicht den Namen
// ("El Agente", "L'Agente"); en/uk/ar halten ihn lateinisch und unflektiert, ar zusaetzlich ohne
// Artikel — der Lauf lieferte gemischt "الـ Agent", geklebtes "الAgent" und blankes "Agent".
const AGENT_CANON = { en: 'Agent', uk: 'Agent', ar: 'Agent', es: 'Agente', it: 'Agente' };
// "Bloecke" im Arabischen: مكعبات nur fuer Minecraft-Bloecke (Bausteine in der Welt) wie im Spiel,
// nicht كتل und nicht das Lehnwort بلوكات. MakeCode-Bloecke im Editor (Puzzleteile, die man zieht —
// glossary.bloecke, ui.blocksLabel, "Hut-Block") sind das nicht und behalten كتل/بلوكات
// (Handkorrektur 2026-09-04, Re-Review T9).
const BLOCKS_CANON = { ar: 'مكعبات' };
// "Boss-Check" ist der Produktbegriff fuer die Abschlussaufgabe einer Etappe (ui.bossCheckHeading,
// die drei stations.*.bossCheck.title, die sieben Etappen-Badges). en/es/it fuehren ihn lateinisch
// wie im Deutschen, uk/ar haben eine feste Uebersetzung. Der Lauf vom 04.09.2026 erfand pro Sprache
// eine eigene Variante ("Boss check", "Control final", "Prova del boss") — die Badges stammten aus
// dem Chunk-Cache und sagten weiter "Boss-Check", also stand beides nebeneinander in der App.
const BOSSCHECK_CANON = { en: 'Boss-Check', uk: 'Бос-перевірка', ar: 'اختبار الزعيم', es: 'Boss-Check', it: 'Boss-Check' };
// "Deutsch" als Sprachname. Der Agent versteht kein Deutsch — das Modell ersetzte den Sprachnamen
// mehrfach durch die Zielsprache ("does not understand English", "No entiende español").
const GERMAN_CANON = { en: 'German', uk: 'німецька', ar: 'الألمانية', es: 'alemán', it: 'tedesco' };
function canonLine(canon) {
  return canon ? Object.entries(canon).map(([k, v]) => `${k}→"${v}"`).join(', ') : '';
}
function systemPrompt(lang) {
  const etappenLine = canonLine(ETAPPEN_CANON[lang]);
  const glossaryLine = canonLine(GLOSSARY_CANON[lang]);
  const blocksLine = BLOCKS_CANON[lang]
    ? ` The German "Blöcke"/"Block" is "${BLOCKS_CANON[lang]}" (and its singular) everywhere it means Minecraft blocks — the cube-shaped building material placed in the world — not only in this glossary entry. It does NOT apply to MakeCode blocks in the code editor (the puzzle-piece code blocks students drag, including the hat block above an event handler): those keep the glossary.bloecke term instead.`
    : '';
  // Handkorrektur 2026-09-04 (Re-Review T9): AGENT_CANON/GERMAN_CANON nur interpolieren, wenn
  // fuer die Sprache ein Eintrag existiert (wie canonLine()) — sonst faellt die Regelzeile ganz
  // weg, statt "undefined" in den Prompt zu schreiben, falls TARGETS je eine Sprache ohne
  // Kanon-Eintrag bekommt.
  const agentLine = AGENT_CANON[lang]
    ? `3. Character names stay: Nour, Dani. The Minecraft robot is called "${AGENT_CANON[lang]}" in ${NAMES[lang]} — use exactly that spelling everywhere, including glossary.agent.term. Do not glue an article onto the name (Arabic: bare "Agent", never "الـ Agent" and never "الAgent") and do not transliterate it into another script.`
    : '';
  const bossLine = BOSSCHECK_CANON[lang]
    ? `13. "Boss-Check" is the fixed name of the task that closes a stage — it appears as the heading ui.bossCheckHeading, in the titles "Boss-Check <stage>" and in the badge texts. In ${NAMES[lang]} it is exactly "${BOSSCHECK_CANON[lang]}"${['en', 'es', 'it'].includes(lang) ? ' — the German-English coinage stays as it is, with the hyphen and both capitals' : ' — inflect it grammatically where the sentence needs it, but keep this wording'}. Never invent a variant such as "Boss check", "Control final" or "Prova del boss": headings, titles and badges must read the same.`
    : '';
  const germanLine = GERMAN_CANON[lang]
    ? `8. "Deutsch" as the name of the German language stays the name of German: "${GERMAN_CANON[lang]}". The students are learning German, so "the Agent does not understand German" must never turn into "does not understand ${NAMES[lang]}".`
    : '';
  return [
    `You translate a German learning app for a coding course (Minecraft Education, MakeCode, Python) into ${NAMES[lang]}.`,
    `Audience: vocational-school students aged 16-18 who are learning German (A2-B1) and speak ${NAMES[lang]} at home. The German stays visible next to your text; yours is the SUPPORT layer. Use short, plain sentences, informal "du"-register equivalent, no jargon beyond the coding terms.`,
    `HARD RULES:`,
    `1. Code words stay byte-identical: anything like agent.move(FORWARD, 3), agent.turn(LEFT_TURN), agent.place(BACK), player.on_chat, GRASS, FORWARD, LEFT_TURN, BACK, Python, MakeCode, Minecraft, Code Builder. The magic words count as code too — they are the chat commands the students type into Minecraft: ${MAGIC_WORDS.join(', ')}. Never translate them, never capitalize them, never inflect them: "haus" stays "haus", not "casa" and not "Haus". Careful: the capitalized German nouns Weg, Turm, Mauer, Wand, Haus in the same sentence are ordinary words and ARE translated; only the lowercase chat word stays. A word only counts as a magic word where the sentence is about typing it into the chat ("Schreibe treppe", "Du tippst plattform"). The same letters used as an ordinary German word are translated normally — "Weit weg" means "far away" and has nothing to do with the command weg.`,
    `2. Placeholders in curly braces like {n}, {done}, {total} stay verbatim.`,
    agentLine,
    `4. JSON keys are never translated; only string values. Booleans and numbers unchanged. Same shape, same array order, no added or removed keys.`,
    `5. Etappen names (Holz, Stein, Eisen, Gold, Diamant, Netherite, Enderdrache) are translated to the Minecraft in-game item/mob names in ${NAMES[lang]}. These are fixed, established course vocabulary, not a free translation choice — use EXACTLY these canonical forms, no synonyms, no added grammatical articles (e.g. no Arabic ال- prefix beyond what a canonical form already contains): ${etappenLine}.`,
    `6. Quotation marks inside values: use the target language's own quotation marks, never a straight ASCII double quote.`,
    `7. glossary.*.term is the target-language word for the concept (the app shows the German term next to it); only agent and python keep their names.${glossaryLine ? ` These are fixed, established course vocabulary — use EXACTLY these canonical terms, no synonyms: ${glossaryLine}.` : ''}${blocksLine}`,
    germanLine,
    `9. Digits: Latin 0-9 only. In Arabic do NOT use the Arabic-Indic digits ٠١٢٣٤٥٦٧٨٩ — the numeric values themselves stay unchanged.`,
    `10. Address the reader gender-neutrally wherever the target language inflects a participle or an adjective for the reader's gender. Ukrainian: "пройшов(ла)", or an impersonal form such as "Усі перевірки пройдено". Keep it short — no extra sentence, no doubled wording.`,
    `11. Respond with ONLY the JSON object.`,
    `12. Identifiers from the code stay byte-identical also in prose: ${IDENT_CANON.join(', ')}. They are the names of variables and functions the students see in their own Python code, written lowercase in running text ("laenge steht einmal oben", "index zaehlt 0, 1, 2"). Never translate, capitalize or inflect them — if the sentence needs a word for the concept, add your own word next to the identifier and leave the identifier itself untouched. The capitalized German nouns in the same sentences (Stufen, Position, Länge) are ordinary words and ARE translated.`,
    bossLine,
  ].filter(Boolean).join('\n');
}

// Teilbaeume: ui, glossary, etappen einzeln; stations pro Station (skaliert auf 20 Stationen).
function chunksOf(data) {
  const chunks = [];
  for (const key of ['ui', 'glossary', 'etappen']) if (data[key]) chunks.push({ path: [key], data: data[key] });
  for (const [sid, st] of Object.entries(data.stations || {})) chunks.push({ path: ['stations', sid], data: st });
  return chunks;
}

async function translateWithSchema(client, data, lang) {
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    system: systemPrompt(lang),
    messages: [{ role: 'user', content: `Translate the string values of this JSON from German into ${NAMES[lang]}. Keep the exact shape.\n\n${JSON.stringify(data, null, 2)}` }],
    output_config: { format: { type: 'json_schema', schema: schemaFrom(data) } },
  });
  const final = await stream.finalMessage();
  if (final.stop_reason === 'refusal') throw new Error('model refused');
  if (final.stop_reason === 'max_tokens') throw new Error('max_tokens hit');
  const text = final.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  return { json: JSON.parse(text), usage: final.usage };
}

// Escape literal (unescaped) ASCII double quotes that appear in the middle of
// a JSON string value. Triggered by German/Serbian quoting where the model
// writes „text" — `„` opens, `"` closes — but the straight closer is illegal
// inside a JSON string and must be \". Uses a tiny state machine: track
// whether we're inside a string; when we hit `"`, peek past whitespace to see
// if the next non-space is a structural token (`,`, `}`, `]`, `:`, or EOF).
// If yes, it's a real string terminator; otherwise, it's a stray quote and
// we escape it.
function repairStrayQuotes(text) {
  const out = [];
  let inString = false;
  let escape = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (escape) { out.push(c); escape = false; continue; }
    if (c === '\\') { out.push(c); escape = true; continue; }
    if (c === '"') {
      if (!inString) {
        out.push(c);
        inString = true;
      } else {
        let j = i + 1;
        while (j < text.length && /\s/.test(text[j])) j++;
        const next = j < text.length ? text[j] : null;
        if (next === null || next === ',' || next === '}' || next === ']' || next === ':') {
          out.push(c);
          inString = false;
        } else {
          out.push('\\', c);
        }
      }
      continue;
    }
    out.push(c);
  }
  return out.join('');
}

function extractJsonFromResponse(text) {
  let t = text.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');
  if (first === -1 || last === -1 || last < first) {
    throw new Error('No JSON object found in model response');
  }
  const payload = t.slice(first, last + 1);
  try {
    return JSON.parse(payload);
  } catch {
    return JSON.parse(repairStrayQuotes(payload));
  }
}

async function translateWithPrompting(client, data, lang, extraNudge = '') {
  const stream = client.messages.stream({
    model: MODEL, max_tokens: 32000,
    system: systemPrompt(lang) + (extraNudge ? '\n\n' + extraNudge : ''),
    messages: [{ role: 'user', content: `Translate the string values of this JSON from German into ${NAMES[lang]}. Keep the exact shape. Respond with ONLY the JSON object.\n\n${JSON.stringify(data, null, 2)}` }],
  });
  const final = await stream.finalMessage();
  if (final.stop_reason === 'refusal') throw new Error('model refused');
  const text = final.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  return { json: extractJsonFromResponse(text), usage: final.usage };
}

async function translateChunk(client, data, lang) {
  try {
    return await translateWithSchema(client, data, lang);
  } catch (err) {
    const msg = String(err?.message || '');
    const grammar = msg.includes('compiled grammar is too large');
    const syntax = err instanceof SyntaxError;
    if (!grammar && !syntax) throw err;
    process.stderr.write(`[fallback: schema→prompting, reason=${grammar ? 'grammar' : 'syntax'}] `);
    try {
      return await translateWithPrompting(client, data, lang);
    } catch (e2) {
      if (!(e2 instanceof SyntaxError)) throw e2;
      process.stderr.write('[fallback: prompting→prompting+nudge, reason=syntax] ');
      return await translateWithPrompting(client, data, lang,
        'NOTE: Your previous response had invalid JSON syntax. Escape double quotes inside strings as \\" and backslashes as \\\\. Return valid JSON only.');
    }
  }
}

// meta.extraHeader = handgeschriebene Kopfzeilen des alten Buendels (Sammelvermerke),
// meta.comments = Kommentare im Rumpf, bereits um die neu uebersetzten Chunks bereinigt.
// Formvergleich deutscher Teilbaum vs. Uebersetzung: fehlende und erfundene Schluessel.
function formFehler(deData, uebersetzt) {
  const soll = shapePaths(deData);
  const ist = shapePaths(uebersetzt ?? {});
  return [
    ...soll.filter((p) => !ist.includes(p)).map((p) => `fehlt: ${p}`),
    ...ist.filter((p) => !soll.includes(p)).map((p) => `zusaetzlich: ${p}`),
  ];
}

/**
 * Uebersetzt einen Chunk und prueft danach die Form. Stimmt sie nicht, folgt ein zweiter
 * Versuch mit ausdruecklichem Hinweis; erst dann ein Fehler.
 * Anlass (04.09.2026): `exercises[1].explain` fiel in allen fuenf Sprachen still weg, weil das
 * Schema es verbot (siehe schemaFrom in lib/translate-chunks.mjs). Aufgefallen ist es erst im
 * Testlauf nach dem bezahlten Lauf — diese Kontrolle faengt so etwas an Ort und Stelle ab.
 */
async function translateChunkGeprueft(client, key, data, lang) {
  let fehler = null;
  let ein = 0, aus = 0;
  for (let versuch = 1; versuch <= 2; versuch++) {
    const wrapped = { [key]: data };
    const { json, usage } = versuch === 1
      ? await translateChunk(client, wrapped, lang)
      : await translateWithPrompting(client, wrapped, lang,
        `NOTE: your previous answer had the wrong shape (${fehler.join('; ')}). Return every key of the input, in the same order, and no others.`);
    ein += usage.input_tokens; aus += usage.output_tokens;
    fehler = formFehler(data, json[key]);
    if (!fehler.length) return { json, usage: { input_tokens: ein, output_tokens: aus } };
    process.stderr.write(`[Form falsch: ${fehler.join('; ')}] `);
  }
  throw new Error(`Form stimmt nach zwei Versuchen nicht (${key}): ${fehler.join('; ')}`);
}

function serialize(data, meta) {
  const header = [
    '// AUTO-GENERATED by scripts/translate.mjs — NICHT von Hand bearbeiten.',
    `// Source: src/i18n/de.js   sourceHash: ${meta.sourceHash}`,
    `// chunkHashes: ${JSON.stringify(meta.chunkHashes)}`,
    `// Language: ${meta.lang}   model: ${meta.model}   generated: ${meta.generatedAt}`,
    '// Stuetz-Ebene: Deutsch bleibt daneben sichtbar. Bei Aenderung an de.js neu erzeugen.',
    ...(meta.extraHeader || []),
  ];
  return renderBundle(data, header, meta.comments);
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.lang) { console.error('--lang <code|code,code|all> fehlt'); process.exit(1); }
  const langs = args.lang === 'all' ? TARGETS : args.lang.split(',').map((s) => s.trim());
  for (const l of langs) if (!TARGETS.includes(l)) { console.error(`unbekannte Sprache ${l}`); process.exit(1); }

  const srcPath = path.join(ROOT, 'src', 'i18n', 'de.js');
  const raw = fs.readFileSync(srcPath, 'utf8');
  const sourceHash = hash(raw);
  const data = (await import(pathToFileURL(srcPath).href)).default;
  const chunks = chunksOf(data);
  const neueHashes = chunkHashesOf(chunks);

  // --chunk uebersetzt genau die genannten Teilbaeume neu und uebernimmt alle anderen aus dem
  // vorhandenen Buendel — die feine Klinge, wenn ein einzelner Chunk zu reparieren ist und ein
  // Volllauf weder noetig noch bezahlbar waere.
  let nurChunks = null;
  if (args.chunk) {
    nurChunks = new Set(args.chunk.split(',').map((s) => s.trim()));
    const bekannt = new Set(chunks.map((c) => c.path.join('.')));
    for (const k of nurChunks) if (!bekannt.has(k)) { console.error(`unbekannter Chunk ${k}`); process.exit(1); }
  }

  let prev = null;
  if (args.prevSource) {
    prev = await loadDeAt(args.prevSource);
    prev.hashes = chunkHashesOf(chunksOf(prev.data));
    console.log(`prev-source ${args.prevSource}: sourceHash ${prev.sourceHash}, ${Object.keys(prev.hashes).length} Chunks`);
  }

  // 1. Planen — ohne API. Was wird uebersetzt, was aus dem vorhandenen Buendel uebernommen?
  const plaene = [];
  for (const lang of langs) {
    const out = path.join(ROOT, 'src', 'i18n', `${lang}.js`);
    const da = fs.existsSync(out);
    const gespeichert = readChunkHashes(out);
    // Der sourceHash allein reicht als Abkuerzung nicht mehr: nach einem --chunk-Lauf kann er
    // aktuell sein, waehrend ein mitgeschleppter Chunk noch auf altem Stand steht. Gibt es eine
    // chunkHashes-Zeile, muss auch sie vollstaendig passen (bundleAktuell liefert dann true).
    if (!args.force && !nurChunks && da && readSourceHash(out) === sourceHash
        && bundleAktuell(gespeichert, neueHashes) !== false) { plaene.push({ lang, out, skip: true }); continue; }
    const vorhanden = da ? (await import(pathToFileURL(out).href)).default : null;
    let basis = {};
    if (args.force) basis = {};
    else if (gespeichert) basis = gespeichert;
    else if (prev && vorhanden) {
      basis = prev.hashes;
      const alt = readSourceHash(out);
      if (alt && alt !== prev.sourceHash) {
        console.log(`  ! ${lang}.js nennt sourceHash ${alt}, --prev-source liefert ${prev.sourceHash} — Chunk-Hashes werden trotzdem von ${args.prevSource} genommen (bewusst gesetzter Startpunkt).`);
      }
    }
    const { todo, keep } = nurChunks
      ? {
        todo: chunks.filter((c) => nurChunks.has(c.path.join('.'))),
        keep: chunks.filter((c) => !nurChunks.has(c.path.join('.'))),
      }
      : selectChunks(chunks, basis, args.force);
    // Ein "keep", das im vorhandenen Buendel gar nicht steht, waere ein Loch im Ergebnis.
    const echt = [], nachtrag = [];
    for (const c of keep) (valueAt(vorhanden, c.path) === undefined ? nachtrag : echt).push(c);
    if (nachtrag.length) console.log(`  ! ${lang}: ${nachtrag.map((c) => c.path.join('.')).join(', ')} fehlt im Buendel — wird uebersetzt`);
    plaene.push({ lang, out, vorhanden, basis, todo: [...todo, ...nachtrag], keep: echt, skip: false });
  }

  const namen = (cs) => (cs.length ? cs.map((c) => c.path.join('.')).join(', ') : '—');
  console.log('\nPlan:');
  for (const p of plaene) {
    if (p.skip) { console.log(`  ${p.lang}: skip — aktuell (sourceHash ${sourceHash})`); continue; }
    console.log(`  ${p.lang}: uebersetzen ${p.todo.length} [${namen(p.todo)}]`);
    console.log(`      uebernehmen ${p.keep.length} [${namen(p.keep)}]`);
  }
  const zuTun = plaene.filter((p) => !p.skip && p.todo.length);
  const summe = zuTun.reduce((a, p) => a + p.todo.length, 0);
  if (args.plan) { console.log(`\n--plan: keine API-Aufrufe. ${summe} Chunk-Uebersetzungen waeren faellig.`); return; }
  if (!summe) { console.log('\nNichts zu uebersetzen.'); return; }

  loadDotenv();
  if (!process.env.ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY fehlt'); process.exit(1); }
  const proSprache = [...new Set(zuTun.map((p) => p.todo.length))];
  const nText = proSprache.length === 1 ? `${proSprache[0]}` : `insgesamt ${summe}`;
  console.log(`\nKostenpflichtige Übersetzung: ${nText} Chunks × ${zuTun.length} Sprachen, Modell ${MODEL}, geschätzt ~$${(summe * SCHAETZUNG_JE_CHUNK).toFixed(2)}`);

  // 2. Uebersetzen.
  const client = new Anthropic();
  let tin = 0, tout = 0;
  for (const p of plaene) {
    if (p.skip) { console.log(`skip ${p.lang} — aktuell (sourceHash ${sourceHash})`); continue; }
    if (!p.todo.length) { console.log(`skip ${p.lang} — alle Chunks unveraendert`); continue; }
    const todoKeys = new Set(p.todo.map((c) => c.path.join('.')));
    console.log(`translate de → ${p.lang} … (${p.todo.length} neu, ${p.keep.length} uebernommen)`);
    const t0 = Date.now();
    let last;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const translated = {};
        let lin = 0, lout = 0;
        // In der Reihenfolge von de.js, damit die Schluessel im Buendel gleich stehen
        // (tests/i18n-complete.test.js vergleicht die Pfadliste der Reihe nach).
        for (const c of chunks) {
          const key = c.path.join('.');
          if (!todoKeys.has(key)) { setPath(translated, c.path, valueAt(p.vorhanden, c.path)); continue; }
          process.stdout.write(`  · ${key} … `);
          const { json, usage } = await translateChunkGeprueft(client, key, c.data, p.lang);
          setPath(translated, c.path, json[key]);
          lin += usage.input_tokens; lout += usage.output_tokens;
          console.log(`ok (in=${usage.input_tokens} out=${usage.output_tokens})`);
          await new Promise((r) => setTimeout(r, 300));
        }
        // Handkorrektur-Kommentare der uebernommenen Chunks retten.
        let extraHeader = [], comments = new Map();
        if (p.vorhanden) {
          const gelesen = extractComments(fs.readFileSync(p.out, 'utf8'), p.vorhanden);
          if (!gelesen) console.log(`  ! Kommentare in ${p.lang}.js nicht zuzuordnen — sie gehen verloren`);
          else { extraHeader = gelesen.extraHeader; comments = commentsWithoutChunks(gelesen.comments, [...todoKeys]); }
        }
        // Nur verdiente Hashes stempeln: was `--chunk` mitgeschleppt hat, behaelt seinen alten
        // Hash (oder gar keinen) und ist beim naechsten Lauf wieder faellig.
        const geschriebeneHashes = nextChunkHashes(p.basis, neueHashes, [...todoKeys]);
        fs.writeFileSync(p.out, serialize(translated, {
          sourceHash, chunkHashes: geschriebeneHashes, lang: p.lang, model: MODEL,
          generatedAt: new Date().toISOString(), extraHeader, comments,
        }), 'utf8');
        const luecken = Object.keys(neueHashes).filter((k) => geschriebeneHashes[k] !== neueHashes[k]);
        if (luecken.length) console.log(`  ! ${p.lang}: ${luecken.join(', ')} steht weiter auf altem Stand und ist beim naechsten Lauf faellig`);
        tin += lin; tout += lout;
        console.log(`${p.lang} ok (${((Date.now() - t0) / 1000).toFixed(1)}s, in=${lin} out=${lout})`);
        last = null; break;
      } catch (err) { last = err; await new Promise((r) => setTimeout(r, 2000 * attempt)); }
    }
    if (last) console.log(`FAIL: ${last.message}`);
  }
  const kosten = (tin / 1e6) * PREIS_IN + (tout / 1e6) * PREIS_OUT;
  console.log(`\nTokens: in=${tin} out=${tout} — ca. $${kosten.toFixed(3)} (${MODEL})`);
  if (tin || tout) logKosten(args, kosten, summe, zuTun.length);
}

main().catch((e) => { console.error(e); process.exit(1); });
