import { STATIONS } from '../src/data/stations.js';
import { BLOCK_SPECS, flattenBlocks } from '../src/lib/blocks.js';

// Blockbeschreibung und Python einer Station beschreiben dasselbe Programm. Zeile fuer Zeile
// vergleichen waere falsch: die Uebungen (predict/parsons) duerfen bewusst abweichen, sie zeigen
// Ausschnitte. Geprueft wird deshalb nur, was beim Auseinanderlaufen sofort weh tut — bekannte
// Blockarten, benannte Hutbloecke und gleich viele Einstiegspunkte hier wie dort.
const withBlocks = Object.entries(STATIONS).filter(([, s]) => Array.isArray(s.blocks) && s.blocks.length > 0);

test('mindestens eine Station traegt eine Blockbeschreibung (die Regeln duerfen nie vakuos sein)', () => {
  expect(withBlocks.length).toBeGreaterThan(0);
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
}
