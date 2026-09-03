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
 * Stand 03.09.2026: alle sechs Sprachen (inkl. `it`) sind erzeugt.
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
function systemPrompt(lang) {
  return [
    `You translate a German learning app for a coding course (Minecraft Education, MakeCode, Python) into ${NAMES[lang]}.`,
    `Audience: vocational-school students aged 16-18 who are learning German (A2-B1) and speak ${NAMES[lang]} at home. The German stays visible next to your text; yours is the SUPPORT layer. Use short, plain sentences, informal "du"-register equivalent, no jargon beyond the coding terms.`,
    `HARD RULES:`,
    `1. Code words stay byte-identical: anything like agent.move(FORWARD, 3), agent.turn(LEFT_TURN), agent.place(BACK), player.on_chat, GRASS, FORWARD, LEFT_TURN, BACK, "weg" (the chat word), Python, MakeCode, Minecraft, Code Builder.`,
    `2. Placeholders in curly braces like {n}, {done}, {total} stay verbatim.`,
    `3. Character names stay: Nour, Dani. The word "Agent" for the Minecraft robot may be translated the way Minecraft Education names it in ${NAMES[lang]}, otherwise keep "Agent".`,
    `4. JSON keys are never translated; only string values. Booleans and numbers unchanged. Same shape, same array order, no added or removed keys.`,
    `5. Etappen names (Holz, Stein, Eisen, Gold, Diamant, Netherite, Enderdrache) are translated to the Minecraft in-game names in ${NAMES[lang]} (e.g. wood, stone, iron, gold, diamond, netherite, ender dragon; uk: Дерево, Камінь, Залізо, Золото, Алмаз, Незерит, Дракон Енду).`,
    `6. Quotation marks inside values: use the target language's own quotation marks, never a straight ASCII double quote.`,
    `7. glossary.*.term is the target-language word for the concept (the app shows the German term next to it); only agent and python keep their names.`,
    `8. Respond with ONLY the JSON object.`,
  ].join('\n');
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
