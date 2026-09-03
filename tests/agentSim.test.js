import { simulate, turn } from '../src/lib/agentSim.js';

const grid = { w: 5, h: 5 };

test('turn dreht im Uhrzeigersinn und dagegen', () => {
  expect(turn('N', 'left')).toBe('W');
  expect(turn('N', 'right')).toBe('E');
  expect(turn('W', 'left')).toBe('S');
  expect(turn('S', 'right')).toBe('W');
});

test('forward folgt der Nase; Beispiel aus Station 2', () => {
  const r = simulate(grid, { x: 2, y: 4, dir: 'N' }, ['forward 2', 'left', 'forward 1']);
  expect(r).toMatchObject({ x: 1, y: 2, dir: 'W' });
  expect(r.trail).toEqual([{ x: 2, y: 4 }, { x: 2, y: 3 }, { x: 2, y: 2 }, { x: 1, y: 2 }]);
});

test('Reihenfolge zaehlt: erst drehen, dann gehen landet woanders', () => {
  const a = simulate(grid, { x: 2, y: 4, dir: 'N' }, ['forward 2', 'left']);
  const b = simulate(grid, { x: 2, y: 4, dir: 'N' }, ['left', 'forward 2']);
  expect([a.x, a.y]).toEqual([2, 2]);
  expect([b.x, b.y]).toEqual([0, 4]);
});

test('Agent bleibt im Raster', () => {
  const r = simulate(grid, { x: 0, y: 0, dir: 'N' }, ['forward 3']);
  expect(r).toMatchObject({ x: 0, y: 0 });
});

test('unbekannter Befehl wirft', () => {
  expect(() => simulate(grid, { x: 0, y: 0, dir: 'N' }, ['jump'])).toThrow(/jump/);
});
