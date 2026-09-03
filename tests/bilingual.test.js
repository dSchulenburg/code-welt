import { pair } from '../src/lib/bilingual.js';

test('pair haengt die Stuetze mit Mittelpunkt an', () => {
  expect(pair('Die Geschichte', 'Історія')).toBe('Die Geschichte · Історія');
});
test('pair laesst gleiche oder fehlende Stuetze weg', () => {
  expect(pair('Check', 'Check')).toBe('Check');
  expect(pair('Check', undefined)).toBe('Check');
  expect(pair('Check', null)).toBe('Check');
});
