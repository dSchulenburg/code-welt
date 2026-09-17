import { STATIONS } from '../src/data/stations.js';
import { BLOCK_SPECS, flattenBlocks } from '../src/lib/blocks.js';

// Blockbeschreibung und Python einer Station beschreiben dasselbe Programm. Zeile fuer Zeile
// vergleichen waere falsch: die Uebungen (predict/parsons) duerfen bewusst abweichen, sie zeigen
// Ausschnitte. Geprueft wird deshalb nur, was beim Auseinanderlaufen sofort weh tut — bekannte
// Blockarten, benannte Hutbloecke, gleich viele Einstiegspunkte hier wie dort und (Plan 2 Task 5)
// dieselbe Reihenfolge der Befehle je Hut — plus dieselbe Verschachtelungstiefe.
//
// Warum die Tiefe eine eigene Zusicherung braucht: die Reihenfolge allein sieht nicht, in welchem
// Schleifenbauch ein Befehl liegt. Verschiebt man in s06 das agent.turn aus der aeusseren in die
// innere Schleife, bleibt die flache Reihenfolge Zeichen fuer Zeichen dieselbe — aus einem Ring
// wird aber ein Kringel. Genau diese Verschiebung faengt der Tiefenvergleich (Fix-Runde 1).
const withBlocks = Object.entries(STATIONS).filter(([, s]) => Array.isArray(s.blocks) && s.blocks.length > 0);

// Blockart -> Anfang der zugehoerigen Python-Zeile. `repeat` und `for` fuehren beide auf `for `:
// MakeCode schreibt "repeat n times" als `for index in range(n)` aus. Blockarten ohne Eintrag
// (Huete, spaetere Ausdrucksbloecke) erzeugen keine eigene Befehlszeile und zaehlen nicht mit.
// `setVar` hat keinen festen Praefix: seine Python-Zeile beginnt mit dem Variablennamen selbst
// (`laenge = `) — deshalb steht dort eine Funktion statt eines Strings (Plan 3 Task 5).
const KIND_TO_PY = {
  'agent.teleportToPlayer': 'agent.teleport_to_player(',
  'agent.setItem': 'agent.set_item(',
  'agent.move': 'agent.move(',
  'agent.turn': 'agent.turn(',
  'agent.place': 'agent.place(',
  'agent.destroy': 'agent.destroy(',
  'agent.detect': 'agent.detect(',
  for: 'for ',
  repeat: 'for ',
  if: 'if ',
  while: 'while ',
  fill: 'blocks.fill(',
  setVar: (b) => `${b.varName} = `,
};
const prefixOf = (b) => { const p = KIND_TO_PY[b.kind]; return typeof p === 'function' ? p(b) : p; };
const PY_PREFIXES = [...new Set([...Object.values(KIND_TO_PY).filter((p) => typeof p === 'string'), 'else:'])];

// Eine Stufe Python-Einrueckung. MakeCode schreibt mit vier Leerzeichen aus.
const INDENT = 4;

// Rumpf eines Hutes in Programmreihenfolge, jeder Befehl mit seiner Verschachtelungstiefe.
// Verschachtelte Rumpfe stehen inline an ihrer Stelle — genau so, wie die eingerueckten Zeilen
// im Python unter ihrer Schleifenzeile stehen. Tiefe 0 = direkt unter dem Hut.
function blockSteps(body, depth = 0, out = []) {
  for (const b of body) {
    const prefix = prefixOf(b);
    if (prefix) out.push({ py: prefix, depth });
    // Nur ein Block mit eigener Python-Zeile (for/repeat) macht seinen Rumpf eine Stufe tiefer.
    if (b.body) blockSteps(b.body, prefix ? depth + 1 : depth, out);
    // else: liegt auf der Tiefe des if, sein Rumpf eine Stufe tiefer — genau wie die
    // Python-Einrueckung.
    if (b.elseBody) { out.push({ py: 'else:', depth }); blockSteps(b.elseBody, depth + 1, out); }
  }
  return out;
}

const blockOrder = (body) => blockSteps(body).map((s) => s.py);

// Zuweisungszeile erkennen (setVar hat keinen festen Praefix in KIND_TO_PY): ein Bezeichner,
// dann " = ", z. B. "laenge = 5". Faengt so denselben Praefix ein wie prefixOf({kind:'setVar',...}).
const ASSIGN = /^([a-z_]+) = /;

// Python an den `def `-Grenzen zerlegen; je Funktion die Zeilen, die zu einer bekannten Blockart
// oder einer Zuweisung gehoeren, jeweils mit ihrer Einrueckungsstufe relativ zum Rumpf des `def`
// (vier Leerzeichen = Stufe 0). Die `player.on_chat(...)`-Zeile faellt heraus — sie ist der Hut,
// kein Befehl im Rumpf.
function pythonSteps(python) {
  return python.split(/^def /m).slice(1).map((chunk) => chunk
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      const assign = trimmed.match(ASSIGN);
      const py = assign ? `${assign[1]} = ` : PY_PREFIXES.find((p) => trimmed.startsWith(p));
      if (!py) return null;
      const spaces = line.length - line.trimStart().length;
      return { py, depth: spaces / INDENT - 1 };
    })
    .filter(Boolean));
}

const pythonOrder = (python) => pythonSteps(python).map((def) => def.map((s) => s.py));

test('mindestens eine Station traegt eine Blockbeschreibung (die Regeln duerfen nie vakuos sein)', () => {
  expect(withBlocks.length).toBeGreaterThan(0);
});

test('die Reihenfolge-Regel laeuft nicht auf leeren Listen: eine Station hat mehr als drei Befehle', () => {
  const longest = Math.max(...withBlocks.map(([, s]) => s.blocks.reduce((n, h) => n + blockOrder(h.body || []).length, 0)));
  expect(longest).toBeGreaterThan(3);
});

test('der Tiefenvergleich ist nicht vakuos: eine Station verschachtelt mindestens zwei Stufen tief', () => {
  const deepest = Math.max(...withBlocks.flatMap(([, s]) => s.blocks.flatMap((h) => blockSteps(h.body || []).map((step) => step.depth))));
  expect(deepest).toBeGreaterThanOrEqual(2);
});

for (const [id, s] of withBlocks) {
  test(`${id}: flattenBlocks laeuft durch, jede Blockart ist bekannt`, () => {
    expect(() => flattenBlocks(s.blocks)).not.toThrow();
  });

  test(`${id}: jeder Hut-Block traegt sein Zauberwort`, () => {
    // flattenBlocks liefert nur {kind, depth}; fuer die Slot-Pruefung die Baumknoten selbst holen.
    const nodes = [];
    (function walk(tree) { for (const b of tree) { nodes.push(b); if (b.body) walk(b.body); } })(s.blocks);
    const hatNodes = nodes.filter((b) => BLOCK_SPECS[b.kind]?.hat);
    expect(hatNodes.length, id).toBeGreaterThan(0);
    for (const h of hatNodes) {
      // Im Kurs gibt es nur onChat-Huete; ein function-Hut haette 'name' statt 'word'.
      expect(h.kind, id).toBe('onChat');
      expect(typeof h.word, `${id}/${h.kind}`).toBe('string');
      expect(h.word.length, `${id}/${h.kind}`).toBeGreaterThan(0);
    }
  });

  test(`${id}: so viele Hut-Bloecke wie player.on_chat-Zeilen im Python`, () => {
    const hats = flattenBlocks(s.blocks).filter((b) => BLOCK_SPECS[b.kind]?.hat).length;
    const onChat = (s.python.match(/player\.on_chat\(/g) || []).length;
    expect(hats, id).toBe(onChat);
  });

  test(`${id}: je Hut stehen die Befehle in derselben Reihenfolge wie im Python`, () => {
    const hats = s.blocks.filter((b) => BLOCK_SPECS[b.kind]?.hat);
    const defs = pythonOrder(s.python);
    // Huete und def-Bloecke werden der Reihe nach gepaart — beide stehen in Programmreihenfolge.
    expect(defs.length, `${id}: def-Bloecke`).toBe(hats.length);
    hats.forEach((h, i) => {
      expect(blockOrder(h.body || []), `${id}/${h.word}`).toEqual(defs[i]);
    });
  });

  test(`${id}: je Hut liegt jeder Befehl gleich tief verschachtelt wie im Python`, () => {
    const hats = s.blocks.filter((b) => BLOCK_SPECS[b.kind]?.hat);
    const defs = pythonSteps(s.python);
    expect(defs.length, `${id}: def-Bloecke`).toBe(hats.length);
    hats.forEach((h, i) => {
      // Erst die Einrueckung selbst pruefen: eine krumme Zeile (nicht durch vier teilbar) waere
      // sonst eine gebrochene Tiefe, die zufaellig gegen nichts stiesse.
      for (const step of defs[i]) {
        expect(Number.isInteger(step.depth), `${id}: Einrueckung nicht durch ${INDENT} teilbar`).toBe(true);
        expect(step.depth, `${id}: Zeile flacher als der def-Rumpf`).toBeGreaterThanOrEqual(0);
      }
      const want = defs[i].map((step) => step.depth);
      expect(blockSteps(h.body || []).map((step) => step.depth), `${id}/${h.word}`).toEqual(want);
    });
  });
}

test('setVar und fill werden in Reihenfolge und Tiefe mit dem Python verglichen', () => {
  const s = { blocks: [{ kind: 'onChat', word: 't', body: [{ kind: 'setVar', varName: 'stufen', value: 6 }, { kind: 'for', varName: 'index', to: { minus: ['stufen', 1] }, body: [{ kind: 'fill', block: 'cobblestone', from: { pos: [0, 0, 1] }, to: { pos: [0, 0, 3] }, op: 'replace' }] }] }],
    python: 'def on_t():\n    stufen = 6\n    for index in range(stufen):\n        blocks.fill(COBBLESTONE, pos(0, 0, 1), pos(0, 0, 3), FillOperation.REPLACE)\nplayer.on_chat("t", on_t)' };
  expect(blockOrder(s.blocks[0].body)).toEqual(['stufen = ', 'for ', 'blocks.fill(']);
  expect(pythonSteps(s.python)[0].map((x) => x.py)).toEqual(['stufen = ', 'for ', 'blocks.fill(']);
});

// Plan 4 Task 1: Bedingungen, not, else.
test('if, else: und while werden in Reihenfolge und Tiefe mit dem Python verglichen', () => {
  const s = { blocks: [{ kind: 'onChat', word: 't', body: [
    { kind: 'while', cond: { not: { kind: 'agent.detect', what: 'block', dir: 'forward' } }, body: [
      { kind: 'if', cond: { kind: 'agent.detect', what: 'block', dir: 'down' },
        body: [{ kind: 'agent.move', dir: 'forward', n: 1 }], elseBody: [{ kind: 'agent.place', dir: 'down' }] },
    ] },
  ] }],
  python: 'def on_t():\n    while not agent.detect(AgentDetection.BLOCK, FORWARD):\n        if agent.detect(AgentDetection.BLOCK, DOWN):\n            agent.move(FORWARD, 1)\n        else:\n            agent.place(DOWN)\nplayer.on_chat("t", on_t)' };
  const want = [['while ', 0], ['if ', 1], ['agent.move(', 2], ['else:', 1], ['agent.place(', 2]];
  expect(blockSteps(s.blocks[0].body).map((x) => [x.py, x.depth])).toEqual(want);
  expect(pythonSteps(s.python)[0].map((x) => [x.py, x.depth])).toEqual(want);
});
