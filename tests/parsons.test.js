import { shuffleDeterministic, checkOrder } from '../src/lib/parsons.js';

const lines = ['a', 'b', 'c', 'd'];

test('shuffleDeterministic ist reproduzierbar und nie die Loesung', () => {
  const s1 = shuffleDeterministic(lines, 7);
  const s2 = shuffleDeterministic(lines, 7);
  expect(s1).toEqual(s2);
  expect(s1).not.toEqual(lines);
  expect([...s1].sort()).toEqual([...lines].sort());
});

test('checkOrder vergleicht Position fuer Position', () => {
  expect(checkOrder(['a', 'b', 'c', 'd'], lines)).toBe(true);
  expect(checkOrder(['b', 'a', 'c', 'd'], lines)).toBe(false);
  expect(checkOrder(['a', 'b', 'c'], lines)).toBe(false);
});
