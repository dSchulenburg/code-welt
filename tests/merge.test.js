import { deepMerge } from '../src/lib/merge.js';

test('deepMerge nimmt Overlay-Werte und faellt sonst auf base zurueck', () => {
  const base = { a: 1, n: { x: 'de', y: 'de' }, arr: ['a', 'b'] };
  const over = { n: { x: 'uk' }, arr: ['c'] };
  expect(deepMerge(base, over)).toEqual({ a: 1, n: { x: 'uk', y: 'de' }, arr: ['c'] });
});

test('deepMerge veraendert base nicht', () => {
  const base = { n: { x: 'de' } };
  deepMerge(base, { n: { x: 'uk' } });
  expect(base.n.x).toBe('de');
});
