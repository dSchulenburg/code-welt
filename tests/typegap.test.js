import { judgeGap, judgeAll } from '../src/lib/typegap.js';

test('judgeGap: Leerzeichen zaehlen nicht, leer ist falsch', () => {
  expect(judgeGap('14', ['14'])).toBe('right');
  expect(judgeGap(' 1 4 ', ['14'])).toBe('right');
  expect(judgeGap('', ['14'])).toBe('wrong');
  expect(judgeGap('   ', ['14'])).toBe('wrong');
  expect(judgeGap('10', ['14'])).toBe('wrong');
});

test('judgeGap: falsche Gross-/Kleinschreibung ist "case", nicht richtig', () => {
  expect(judgeGap('REDSTONE', ['REDSTONE'])).toBe('right');
  expect(judgeGap('redstone', ['REDSTONE'])).toBe('case');
  expect(judgeGap('Redstone', ['REDSTONE'])).toBe('case');
  expect(judgeGap('redstne', ['REDSTONE'])).toBe('wrong');
});

test('judgeGap: jede Schreibweise aus accept zaehlt', () => {
  expect(judgeGap('agent.move(FORWARD,1)', ['agent.move(FORWARD, 1)'])).toBe('right');
  expect(judgeGap('b', ['a', 'b'])).toBe('right');
});

test('judgeAll: right nur wenn alle right; wrong schlaegt case', () => {
  const gaps = [{ accept: ['REDSTONE'] }, { accept: ['DOWN'] }];
  expect(judgeAll(['REDSTONE', 'DOWN'], gaps)).toEqual({ verdicts: ['right', 'right'], overall: 'right' });
  expect(judgeAll(['redstone', 'DOWN'], gaps)).toEqual({ verdicts: ['case', 'right'], overall: 'case' });
  expect(judgeAll(['redstone', 'UP'], gaps)).toEqual({ verdicts: ['case', 'wrong'], overall: 'wrong' });
});
