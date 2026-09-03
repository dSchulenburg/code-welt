import { STATIONS } from '../src/data/stations.js';
import { BLOCK_SPECS, flattenBlocks } from '../src/lib/blocks.js';

// Blockbeschreibung und Python einer Station beschreiben dasselbe Programm. Zeile fuer Zeile
// vergleichen waere falsch: die Uebungen (predict/parsons) duerfen bewusst abweichen, sie zeigen
// Ausschnitte. Geprueft wird deshalb nur, was beim Auseinanderlaufen sofort weh tut — bekannte
// Blockarten, benannte Hutbloecke, gleich viele Einstiegspunkte hier wie dort und (Plan 2 Task 5)
// dieselbe Reihenfolge der Befehle je Hut.
const withBlocks = Object.entries(STATIONS).filter(([, s]) => Array.isArray(s.blocks) && s.blocks.length > 0);

// Blockart -> Anfang der zugehoerigen Python-Zeile. `repeat` und `for` fuehren beide auf `for `:
// MakeCode schreibt "repeat n times" als `for index in range(n)` aus. Blockarten ohne Eintrag
// (Huete, spaetere Ausdrucksbloecke) erzeugen keine eigene Befehlszeile und zaehlen nicht mit.
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
};
const PY_PREFIXES = [...new Set(Object.values(KIND_TO_PY))];

// Rumpf eines Hutes in Programmreihenfolge. Verschachtelte Rumpfe stehen inline an ihrer Stelle —
// genau so, wie die eingerueckten Zeilen im Python unter ihrer Schleifenzeile stehen.
function blockOrder(body, out = []) {
  for (const b of body) {
    const prefix = KIND_TO_PY[b.kind];
    if (prefix) out.push(prefix);
    if (b.body) blockOrder(b.body, out);
  }
  return out;
}

// Python an den `def `-Grenzen zerlegen; je Funktion die Zeilen, die zu einer bekannten Blockart
// gehoeren. Die `player.on_chat(...)`-Zeile faellt heraus — sie ist der Hut, kein Befehl im Rumpf.
function pythonOrder(python) {
  return python.split(/^def /m).slice(1).map((chunk) => chunk
    .split('\n')
    .map((line) => PY_PREFIXES.find((p) => line.trim().startsWith(p)))
    .filter(Boolean));
}

test('mindestens eine Station traegt eine Blockbeschreibung (die Regeln duerfen nie vakuos sein)', () => {
  expect(withBlocks.length).toBeGreaterThan(0);
});

test('die Reihenfolge-Regel laeuft nicht auf leeren Listen: eine Station hat mehr als drei Befehle', () => {
  const longest = Math.max(...withBlocks.map(([, s]) => s.blocks.reduce((n, h) => n + blockOrder(h.body || []).length, 0)));
  expect(longest).toBeGreaterThan(3);
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
}
