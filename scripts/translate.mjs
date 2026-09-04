#!/usr/bin/env node
/**
 * Uebersetzt die Stuetz-Ebene src/i18n/de.js in die fuenf Stuetzsprachen.
 *
 *   node scripts/translate.mjs --lang uk
 *   node scripts/translate.mjs --lang all
 *   node scripts/translate.mjs --lang ar,it --force
 *
 * Jede erzeugte Datei traegt den sourceHash der deutschen Quelle. Stimmt er noch,
 * wird uebersprungen; weicht er ab, wird neu uebersetzt. --force erzwingt es.
 * ANTHROPIC_API_KEY aus der Umgebung, sonst aus ./.env oder ../docker/.env.
 * Muster: docker/esa-mathe/scripts/translate-lessons.mjs.
 *
 * Uebersetzt in Teilbaeumen (ui, glossary, etappen, stations.<sid>) mit je eigenem
 * kleinen JSON-Schema; faellt bei Grammatik-/Parse-Fehlern auf Prompt+JSON-Repair zurueck.
 * Teilbaum-Modus ist der Standard, kein Flag noetig.
 * Stand 03.09.2026: alle sechs Sprachen (inkl. `it`) sind erzeugt. Die Fix-Runde 1 zu Task 9 hat
 * den Prompt um vier Kanon-Regeln erweitert (Zauberwoerter, Agent-Schreibweise, "Deutsch" als
 * Sprachname, lateinische Ziffern/geschlechtsneutrale Anrede) — siehe MAGIC_WORDS, AGENT_CANON,
 * BLOCKS_CANON, GERMAN_CANON weiter unten. Die Bundles tragen die zugehoerigen Handkorrekturen;
 * ein Neulauf ueberschreibt sie, deshalb danach `npm test` gegen tests/i18n-complete.test.js.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODEL = 'claude-opus-5';
const TARGETS = ['en', 'uk', 'ar', 'es', 'it'];
const NAMES = { en: 'English', uk: 'Ukrainian', ar: 'Arabic (Modern Standard, simple)', es: 'Spanish', it: 'Italian' };

function parseArgs(argv) {
  const a = { force: false, lang: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--force') a.force = true;
    else if (argv[i] === '--lang') a.lang = argv[++i];
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
function schemaFrom(data) {
  if (typeof data === 'string') return { type: 'string' };
  if (typeof data === 'number') return { type: 'number' };
  if (typeof data === 'boolean') return { type: 'boolean' };
  if (Array.isArray(data)) return { type: 'array', items: data.length ? schemaFrom(data[0]) : {} };
  const properties = {}; const required = [];
  for (const [k, v] of Object.entries(data)) { properties[k] = schemaFrom(v); required.push(k); }
  return { type: 'object', properties, required, additionalProperties: false };
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
const GLOSSARY_CANON = {
  es: { befehl: 'Orden', programm: 'Programa', sequenz: 'Secuencia', zauberwort: 'Palabra mágica', bloecke: 'Bloques', fehler: 'Error' },
  uk: { befehl: 'Команда', programm: 'Програма', sequenz: 'Послідовність', zauberwort: 'Чарівне слово', bloecke: 'Блоки', fehler: 'Помилка' },
};
// Weiterer Kanon aus der Fix-Runde 1 zu Task 9 (03.09.2026). Jeder dieser vier Punkte war nach
// dem ersten Lauf in mindestens einer Sprache falsch und musste von Hand korrigiert werden
// (Vermerke stehen in den betroffenen src/i18n/*.js). Als Prompt-Regel, damit ein spaeterer Lauf
// die Korrekturen nicht wieder einreisst.
//
// Zauberwoerter sind Chat-Kommandos, die die SuS im Spiel tippen — Eingabe, keine Prosa. `it`
// hatte "haus" zu "casa" uebersetzt; damit ist die Aufgabe im Spiel unloesbar.
// tests/i18n-complete.test.js prueft sie pfadgenau gegen de.js.
const MAGIC_WORDS = ['hi', 'hallo', 'weg', 'turm', 'mauer', 'wand', 'haus', 'bruecke'];
// Schreibweise des Minecraft-Roboters. es/it beugen den Artikel davor, nicht den Namen
// ("El Agente", "L'Agente"); en/uk/ar halten ihn lateinisch und unflektiert, ar zusaetzlich ohne
// Artikel — der Lauf lieferte gemischt "الـ Agent", geklebtes "الAgent" und blankes "Agent".
const AGENT_CANON = { en: 'Agent', uk: 'Agent', ar: 'Agent', es: 'Agente', it: 'Agente' };
// "Bloecke" im Arabischen: مكعبات nur fuer Minecraft-Bloecke (Bausteine in der Welt) wie im Spiel,
// nicht كتل und nicht das Lehnwort بلوكات. MakeCode-Bloecke im Editor (Puzzleteile, die man zieht —
// glossary.bloecke, ui.blocksLabel, "Hut-Block") sind das nicht und behalten كتل/بلوكات
// (Handkorrektur 2026-09-04, Re-Review T9).
const BLOCKS_CANON = { ar: 'مكعبات' };
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
  const germanLine = GERMAN_CANON[lang]
    ? `8. "Deutsch" as the name of the German language stays the name of German: "${GERMAN_CANON[lang]}". The students are learning German, so "the Agent does not understand German" must never turn into "does not understand ${NAMES[lang]}".`
    : '';
  return [
    `You translate a German learning app for a coding course (Minecraft Education, MakeCode, Python) into ${NAMES[lang]}.`,
    `Audience: vocational-school students aged 16-18 who are learning German (A2-B1) and speak ${NAMES[lang]} at home. The German stays visible next to your text; yours is the SUPPORT layer. Use short, plain sentences, informal "du"-register equivalent, no jargon beyond the coding terms.`,
    `HARD RULES:`,
    `1. Code words stay byte-identical: anything like agent.move(FORWARD, 3), agent.turn(LEFT_TURN), agent.place(BACK), player.on_chat, GRASS, FORWARD, LEFT_TURN, BACK, Python, MakeCode, Minecraft, Code Builder. The magic words count as code too — they are the chat commands the students type into Minecraft: ${MAGIC_WORDS.join(', ')}. Never translate them, never capitalize them, never inflect them: "haus" stays "haus", not "casa" and not "Haus". Careful: the capitalized German nouns Weg, Turm, Mauer, Wand, Haus in the same sentence are ordinary words and ARE translated; only the lowercase chat word stays.`,
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
  ].filter(Boolean).join('\n');
}

// Teilbaeume: ui, glossary, etappen einzeln; stations pro Station (skaliert auf 20 Stationen).
function chunksOf(data) {
  const chunks = [];
  for (const key of ['ui', 'glossary', 'etappen']) if (data[key]) chunks.push({ path: [key], data: data[key] });
  for (const [sid, st] of Object.entries(data.stations || {})) chunks.push({ path: ['stations', sid], data: st });
  return chunks;
}
function setPath(target, path, value) {
  let cur = target;
  for (const p of path.slice(0, -1)) cur = (cur[p] ||= {});
  cur[path[path.length - 1]] = value;
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

function serialize(data, meta) {
  return [
    '// AUTO-GENERATED by scripts/translate.mjs — NICHT von Hand bearbeiten.',
    `// Source: src/i18n/de.js   sourceHash: ${meta.sourceHash}`,
    `// Language: ${meta.lang}   model: ${meta.model}   generated: ${meta.generatedAt}`,
    '// Stuetz-Ebene: Deutsch bleibt daneben sichtbar. Bei Aenderung an de.js neu erzeugen.',
    '',
    'export default ' + JSON.stringify(data, null, 2) + ';',
    '',
  ].join('\n');
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.lang) { console.error('--lang <code|code,code|all> fehlt'); process.exit(1); }
  loadDotenv();
  if (!process.env.ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY fehlt'); process.exit(1); }
  const langs = args.lang === 'all' ? TARGETS : args.lang.split(',').map((s) => s.trim());
  for (const l of langs) if (!TARGETS.includes(l)) { console.error(`unbekannte Sprache ${l}`); process.exit(1); }

  const srcPath = path.join(ROOT, 'src', 'i18n', 'de.js');
  const raw = fs.readFileSync(srcPath, 'utf8');
  const sourceHash = hash(raw);
  const data = (await import(pathToFileURL(srcPath).href)).default;
  const client = new Anthropic();
  let tin = 0, tout = 0;

  for (const lang of langs) {
    const out = path.join(ROOT, 'src', 'i18n', `${lang}.js`);
    if (!args.force && readSourceHash(out) === sourceHash) { console.log(`skip ${lang} — aktuell (sourceHash ${sourceHash})`); continue; }
    console.log(`translate de → ${lang} …`);
    const t0 = Date.now();
    let last;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const translated = {};
        let lin = 0, lout = 0;
        for (const c of chunksOf(data)) {
          const wrapped = { [c.path.join('.')]: c.data };
          process.stdout.write(`  · ${c.path.join('.')} … `);
          const { json, usage } = await translateChunk(client, wrapped, lang);
          setPath(translated, c.path, json[c.path.join('.')]);
          lin += usage.input_tokens; lout += usage.output_tokens;
          console.log(`ok (in=${usage.input_tokens} out=${usage.output_tokens})`);
          await new Promise((r) => setTimeout(r, 300));
        }
        fs.writeFileSync(out, serialize(translated, { sourceHash, lang, model: MODEL, generatedAt: new Date().toISOString() }), 'utf8');
        tin += lin; tout += lout;
        console.log(`${lang} ok (${((Date.now() - t0) / 1000).toFixed(1)}s, in=${lin} out=${lout})`);
        last = null; break;
      } catch (err) { last = err; await new Promise((r) => setTimeout(r, 2000 * attempt)); }
    }
    if (last) console.log(`FAIL: ${last.message}`);
  }
  console.log(`\nTokens: in=${tin} out=${tout} — ca. $${((tin / 1e6) * 5 + (tout / 1e6) * 25).toFixed(3)} (${MODEL})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
