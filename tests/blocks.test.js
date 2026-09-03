import { BLOCK_SPECS, CATEGORY_COLORS, flattenBlocks, blocksToProgram } from '../src/lib/blocks.js';

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
