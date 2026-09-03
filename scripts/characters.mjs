#!/usr/bin/env node
/**
 * Erzeugt die Comic-Portraits der Story-Charaktere Nour und Dani ueber die
 * Gemini-REST-API (Nano Banana, Modell siehe DEFAULT_MODEL).
 *
 *   node scripts/characters.mjs --who nour --pose ref
 *   node scripts/characters.mjs --who dani --pose ref --dry-run
 *   node scripts/characters.mjs --who nour --pose erklaerend --ref src/assets/characters/nour-ref.png
 *
 * Phase A (dieser Task): nur `--pose ref`, je Figur EIN Referenzbild. Die fuenf
 * Posen je Figur (Phase B) brauchen zusaetzlich `--ref <Pfad zum Referenzbild>`,
 * das als Bildeingabe vor den Posen-Prompt gestellt wird.
 *
 * GOOGLE_API_KEY kommt aus der Umgebung, sonst aus ../docker/.env (Zeile
 * GOOGLE_API_KEY=...). Der Wert wird nie ausgegeben, geloggt oder committet.
 *
 * Vor jedem kostenpflichtigen Aufruf wird eine Kostenzeile gedruckt (keine
 * interaktive Abfrage - Dirks Freigabe fuer das Verfahren liegt laut Spec-
 * Nachtrag 2026-09-03 Entscheidung 7 bereits vor). Jeder erfolgreiche Aufruf
 * haengt eine Zeile an das projektuebergreifende Kostenlog im docker-Repo an
 * (_assets/media-factory/cost-log.jsonl, Form aus media-factory/cost-tracker.md).
 * Die Task-Summe wird aus genau diesem Log ueber alle bisherigen
 * `characters/*`-Eintraege mit project=code-welt aufsummiert (persistiert also
 * ueber mehrere Skriptaufrufe hinweg) und darf 5,00 USD nicht ueberschreiten -
 * ein Aufruf, der das Limit reissen wuerde, wird VOR dem API-Call abgebrochen.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'src', 'assets', 'characters');
const COST_LOG = path.resolve(ROOT, '..', 'docker', '_assets', 'media-factory', 'cost-log.jsonl');
const TASK_BUDGET_USD = 5.0;

// Live gegen `GET /v1beta/models` geprueft am 03.09.2026: `gemini-2.5-flash-image`
// ist gelistet (die in Docs/Skill genannte Variante `gemini-2.5-flash-preview-image`
// nicht mehr). Bereits produktiv genutzt (siehe cost-log.jsonl, esa-mathe-Eintraege
// vom 03.05.), daher als Default statt der Preview-Variante.
const DEFAULT_MODEL = 'gemini-2.5-flash-image';

// Bekannte Kosten pro Bild. Unbekannte Modell-IDs (z.B. neuere Pro-Varianten)
// fallen auf die teurere Pro-Schaetzung zurueck - lieber zu hoch schaetzen als
// den Deckel unbemerkt reissen.
const COST_PER_IMAGE = {
  'gemini-2.5-flash-image': 0.04,
  'gemini-2.5-flash-preview-image': 0.04,
  'gemini-3-pro-image-preview': 0.24,
  'gemini-3-pro-image': 0.24,
};
const FALLBACK_COST = 0.24;

const POSES = ['erklaerend', 'fragend', 'begeistert', 'nachdenklich', 'ueberrascht'];

// Posen-Kern aus dem Plan (Klammerzusaetze im Brief), ins Englische uebertragen
// fuer den Bildprompt.
const POSE_TEXT = {
  erklaerend: 'explaining, one hand raised',
  fragend: 'questioning, head tilted, finger on chin',
  begeistert: 'enthusiastic, both thumbs up',
  nachdenklich: 'thoughtful, hand resting on head',
  ueberrascht: 'surprised, open mouth',
};

// Prompt-Kerne exakt aus dem Plan (Spec-Nachtrag 2026-09-03, Entscheidung 7).
// Abweichung: Danis Plan-Text endet auf "same style" - das verweist auf Nours
// Stil-Beschreibung, die bei einem eigenstaendigen API-Aufruf ohne Kontext gar
// nicht vorliegt. "same style" ist deshalb hier durch dieselben Stil-Tags wie
// bei Nour ersetzt (STYLE_TAIL), inhaltlich identisch gemeint, aber tatsaechlich
// wirksam. Siehe Report, Abschnitt "Abweichungen vom Plan".
const STYLE_TAIL = 'comic illustration, flat colours, clean outlines, white background, bust portrait';
const CORE = {
  nour: `17-year-old student, warm confident smile, short dark curly hair, hoodie in forest green, ${STYLE_TAIL}`,
  dani: `17-year-old student, curious wide eyes, straight brown hair with a fringe, yellow t-shirt, ${STYLE_TAIL}`,
};

function parseArgs(argv) {
  const a = { who: null, pose: null, ref: null, model: DEFAULT_MODEL, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--who') a.who = argv[++i];
    else if (arg === '--pose') a.pose = argv[++i];
    else if (arg === '--ref') a.ref = argv[++i];
    else if (arg === '--model') a.model = argv[++i];
    else if (arg === '--dry-run') a.dryRun = true;
    else { console.error(`unbekanntes Argument: ${arg}`); process.exit(1); }
  }
  return a;
}

function loadApiKey() {
  if (process.env.GOOGLE_API_KEY) return process.env.GOOGLE_API_KEY;
  const p = path.resolve(ROOT, '..', 'docker', '.env');
  if (!fs.existsSync(p)) return null;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"]*)"?\s*$/);
    if (m && m[1] === 'GOOGLE_API_KEY' && m[2]) return m[2];
  }
  return null;
}

function costFor(model) {
  return COST_PER_IMAGE[model] ?? FALLBACK_COST;
}

// Summiert alle bisherigen Kostenlog-Zeilen dieses Tasks (project=code-welt,
// asset unter characters/) - persistiert ueber mehrere Prozessaufrufe hinweg,
// weil jeder Aufruf des Skripts das Log erneut liest.
function taskTotalSoFar() {
  if (!fs.existsSync(COST_LOG)) return 0;
  let sum = 0;
  for (const line of fs.readFileSync(COST_LOG, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    let entry;
    try { entry = JSON.parse(line); } catch { continue; }
    if (entry.project === 'code-welt' && typeof entry.asset === 'string' && entry.asset.startsWith('characters/')) {
      sum += Number(entry.cost ?? entry.est_cost_usd ?? 0) || 0;
    }
  }
  return sum;
}

function appendCostLog(entry) {
  fs.mkdirSync(path.dirname(COST_LOG), { recursive: true });
  fs.appendFileSync(COST_LOG, JSON.stringify(entry) + '\n', 'utf8');
}

function buildPrompt(who, pose) {
  const core = CORE[who];
  if (pose === 'ref') {
    return `${core}, neutral pose, looking at viewer, no text, no watermark`;
  }
  return `Same character as the reference image, ${core}, ${POSE_TEXT[pose]}, no text, no watermark`;
}

async function callGemini(model, apiKey, promptText, refImagePath) {
  const parts = [];
  // Referenzbild MUSS vor dem Posen-Prompt stehen (siehe Skill ai-image.md /
  // Brief), sonst wird es vom Modell nicht als Bildeingabe fuer "same
  // character" interpretiert.
  if (refImagePath) {
    const data = fs.readFileSync(refImagePath).toString('base64');
    parts.push({ inlineData: { mimeType: 'image/png', data } });
  }
  parts.push({ text: `Generate an image: ${promptText}` });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini API ${res.status}: ${errText.slice(0, 500)}`);
  }
  const json = await res.json();
  const imgPart = json?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!imgPart) {
    const textPart = json?.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
    throw new Error(`keine Bilddaten in der Antwort${textPart ? ` (Modelltext: ${textPart.slice(0, 300)})` : ''}`);
  }
  return Buffer.from(imgPart.inlineData.data, 'base64');
}

// Verkleinert auf 512x512 via sharp, wenn verfuegbar; sonst Originalgroesse
// speichern und das im Rueckgabewert vermerken (siehe Brief, Punkt Bildgroesse).
async function saveImage(buffer, outPath) {
  try {
    const { default: sharp } = await import('sharp');
    await sharp(buffer).resize(512, 512, { fit: 'cover' }).png().toFile(outPath);
    return { resized: true };
  } catch (err) {
    fs.writeFileSync(outPath, buffer);
    return { resized: false, reason: err.message };
  }
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.who || !['nour', 'dani'].includes(args.who)) {
    console.error('--who nour|dani fehlt oder ungueltig');
    process.exit(1);
  }
  if (!args.pose) {
    console.error('--pose ref|erklaerend|fragend|begeistert|nachdenklich|ueberrascht fehlt');
    process.exit(1);
  }
  if (args.pose !== 'ref' && !POSES.includes(args.pose)) {
    console.error(`unbekannte pose "${args.pose}" (erlaubt: ref, ${POSES.join(', ')})`);
    process.exit(1);
  }
  if (args.pose !== 'ref' && !args.ref) {
    console.error('--ref <Pfad zum Referenzbild> fehlt (bei allen Posen ausser ref)');
    process.exit(1);
  }

  const model = args.model;
  const cost = costFor(model);
  const priorTotal = taskTotalSoFar();
  const wouldBe = priorTotal + cost;

  console.log(
    `Kostenpflichtige Generierung: Generator ai-image, Modell ${model}, ` +
    `geschätzt ~$${cost.toFixed(2)}, Task-Summe bisher $${priorTotal.toFixed(2)}`
  );

  if (wouldBe > TASK_BUDGET_USD) {
    console.error(`Abbruch: Task-Summe würde auf $${wouldBe.toFixed(2)} steigen (Deckel $${TASK_BUDGET_USD.toFixed(2)}).`);
    process.exit(1);
  }

  const prompt = buildPrompt(args.who, args.pose);
  const assetName = `${args.who}-${args.pose}.png`;
  const outPath = path.join(OUT_DIR, assetName);

  if (args.dryRun) {
    console.log(`(dry-run) kein API-Aufruf. Zielpfad: ${outPath}`);
    console.log(`Prompt: ${prompt}`);
    return;
  }

  const apiKey = loadApiKey();
  if (!apiKey) {
    console.error('GOOGLE_API_KEY fehlt (weder Umgebung noch ../docker/.env)');
    process.exit(1);
  }

  const buffer = await callGemini(model, apiKey, prompt, args.pose === 'ref' ? null : args.ref);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const { resized, reason } = await saveImage(buffer, outPath);

  appendCostLog({
    date: new Date().toISOString().slice(0, 10),
    generator: 'ai-image',
    model,
    cost,
    prompt,
    project: 'code-welt',
    asset: `characters/${assetName}`,
  });

  console.log(`gespeichert: ${outPath}${resized ? ' (512x512)' : ` (Originalgröße, sharp nicht verfügbar: ${reason})`}`);
  console.log(`Task-Summe jetzt: $${wouldBe.toFixed(2)}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
