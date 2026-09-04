import { BLOCK_SPECS, CATEGORY_COLORS, flattenBlocks, blocksToProgram, slotText } from '../src/lib/blocks.js';

const tree = [{ kind: 'onChat', word: 'weg', body: [
  { kind: 'agent.teleportToPlayer' },
  { kind: 'agent.move', dir: 'forward', n: 2 },
  { kind: 'repeat', n: 2, body: [{ kind: 'agent.turn', dir: 'left' }, { kind: 'agent.move', dir: 'forward', n: 1 }] },
] }];

test('Kategoriefarben sind die des Editors', () => {
  expect(CATEGORY_COLORS.agent).toEqual({ fill: '#d83b01', stroke: '#a22c01', slot: '#b83201' });
  expect(CATEGORY_COLORS.loops.fill).toBe('#569138');
  expect(CATEGORY_COLORS.player.fill).toBe('#0078d7');
});
test('jede Blockart hat Kategorie und Label', () => {
  for (const [k, s] of Object.entries(BLOCK_SPECS)) {
    expect(CATEGORY_COLORS[s.cat], k).toBeDefined();
    expect(Array.isArray(s.label), k).toBe(true);
  }
});
test('flattenBlocks liefert Reihenfolge und Tiefe', () => {
  expect(flattenBlocks(tree).map((b) => `${b.kind}@${b.depth}`)).toEqual([
    'onChat@0', 'agent.teleportToPlayer@1', 'agent.move@1', 'repeat@1', 'agent.turn@2', 'agent.move@2',
  ]);
});
test('blocksToProgram entrollt Schleifen und ignoriert Nicht-Bewegung', () => {
  expect(blocksToProgram(tree)).toEqual(['forward 2', 'left', 'forward 1', 'left', 'forward 1']);
});
test('unbekannte Blockart wirft', () => {
  expect(() => flattenBlocks([{ kind: 'nope' }])).toThrow(/nope/);
});

// Plan 3 Task 1: Variable, Minus-Ausdruck, Position im Zahlen-/Pos-Slot; Zaehler aus setVar aufgeloest.
test('slotText zeigt Variable, Minus-Ausdruck und Position im Editor-Wortlaut', () => {
  expect(slotText({ kind: 'agent.move', dir: 'forward', n: 'laenge' }, { slot: 'n', kind: 'number' })).toBe('laenge');
  expect(slotText({ kind: 'for', varName: 'index', to: { minus: ['stufen', 1] } }, { slot: 'to', kind: 'number' })).toBe('stufen - 1');
  expect(slotText({ kind: 'fill', from: { pos: [0, -1, 1] } }, { slot: 'from', kind: 'pos' })).toBe('~0 ~-1 ~1');
  expect(slotText({ kind: 'fill', to: { pos: ['index', 'index', 3] } }, { slot: 'to', kind: 'pos' })).toBe('~index ~index ~3');
  expect(slotText({ kind: 'fill', op: 'replace' }, { slot: 'op', kind: 'dropdown' })).toBe('replace');
});

test('fill hat einen Operator-Slot, math hat eine Farbe', () => {
  expect(BLOCK_SPECS.fill.label.some((p) => typeof p === 'object' && p.slot === 'op')).toBe(true);
  expect(CATEGORY_COLORS.math.fill).toMatch(/^#[0-9a-f]{6}$/i);
});

test('blocksToProgram loest Variablen aus setVar auf (Bruecke: laenge = 5 → fuenf Schritte)', () => {
  const tree = [{ kind: 'onChat', word: 'bruecke', body: [
    { kind: 'setVar', varName: 'laenge', value: 5 },
    { kind: 'repeat', n: 'laenge', body: [{ kind: 'agent.move', dir: 'forward', n: 1 }, { kind: 'agent.place', dir: 'down' }] },
  ] }];
  expect(blocksToProgram(tree)).toEqual(['forward 1', 'forward 1', 'forward 1', 'forward 1', 'forward 1']);
});

test('blocksToProgram versteht for … to stufen - 1', () => {
  const tree = [{ kind: 'setVar', varName: 'stufen', value: 3 }, { kind: 'for', varName: 'index', to: { minus: ['stufen', 1] }, body: [{ kind: 'agent.move', dir: 'forward', n: 1 }] }];
  expect(blocksToProgram(tree)).toEqual(['forward 1', 'forward 1', 'forward 1']);
});

test('blocksToProgram wirft bei unbekannter Variable', () => {
  expect(() => blocksToProgram([{ kind: 'repeat', n: 'nix', body: [] }])).toThrow(/Unbekannte Variable: nix/);
});
