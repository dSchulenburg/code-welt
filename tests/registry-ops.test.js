import { contentHash, needsUpdate, isOrderedSubsequence } from '../moodle/lib/registry-ops.mjs';

test('contentHash ist stabil ueber die Key-Reihenfolge im Item (Label)', () => {
  const a = { type: 'label', key: 'x', html: '<p>Hallo</p>' };
  const b = { html: '<p>Hallo</p>', key: 'x', type: 'label' };
  expect(contentHash(a)).toBe(contentHash(b));
});

test('contentHash aendert sich, wenn sich das Label-HTML aendert', () => {
  const a = { type: 'label', html: '<p>Hallo</p>' };
  const b = { type: 'label', html: '<p>Hallo Welt</p>' };
  expect(contentHash(a)).not.toBe(contentHash(b));
});

test('contentHash ist ein 12-stelliger Hex-String', () => {
  const h = contentHash({ type: 'label', html: '<p>x</p>' });
  expect(h).toMatch(/^[0-9a-f]{12}$/);
});

test('contentHash fuer Quiz deckt Name, Intro und Fragen ab, ignoriert aber Feld-Reihenfolge in verschachtelten Objekten', () => {
  const q1 = { type: 'quiz', name: 'Check', intro: '', questions: [{ name: 'q1', text: 't', answers: [{ text: 'a', fraction: 100 }] }] };
  const q2 = { questions: [{ answers: [{ fraction: 100, text: 'a' }], text: 't', name: 'q1' }], intro: '', name: 'Check', type: 'quiz' };
  expect(contentHash(q1)).toBe(contentHash(q2));

  const q3 = { ...q1, questions: [{ ...q1.questions[0], text: 'anders' }] };
  expect(contentHash(q1)).not.toBe(contentHash(q3));

  const q4 = { ...q1, name: 'Anderer Name' };
  expect(contentHash(q1)).not.toBe(contentHash(q4));
});

test('needsUpdate ist true, wenn kein Eintrag existiert', () => {
  expect(needsUpdate(undefined, { type: 'label', html: '<p>x</p>' })).toBe(true);
});

test('needsUpdate ist false, wenn der gespeicherte Hash zum aktuellen Inhalt passt', () => {
  const item = { type: 'label', html: '<p>x</p>' };
  const entry = { cmid: 1, hash: contentHash(item) };
  expect(needsUpdate(entry, item)).toBe(false);
});

test('needsUpdate ist true, wenn sich der Inhalt seit dem gespeicherten Hash geaendert hat', () => {
  const item = { type: 'label', html: '<p>x</p>' };
  const entry = { cmid: 1, hash: contentHash(item) };
  const changed = { type: 'label', html: '<p>y</p>' };
  expect(needsUpdate(entry, changed)).toBe(true);
});

test('needsUpdate ist true fuer einen Eintrag ohne hash-Feld (Altbestand)', () => {
  const item = { type: 'label', html: '<p>x</p>' };
  const entry = { cmid: 1 };
  expect(needsUpdate(entry, item)).toBe(true);
});

test('isOrderedSubsequence ist true, wenn want in genau dieser Reihenfolge in actual vorkommt, egal was dazwischen steht', () => {
  expect(isOrderedSubsequence([69, 54], [50, 69, 54])).toBe(true);
  expect(isOrderedSubsequence([69, 54], [69, 50, 54])).toBe(true);
  expect(isOrderedSubsequence([69, 54], [69, 54])).toBe(true);
  expect(isOrderedSubsequence([], [50, 69, 54])).toBe(true);
});

test('isOrderedSubsequence ist false bei falscher Reihenfolge oder fehlenden Elementen', () => {
  expect(isOrderedSubsequence([69, 54], [54, 69])).toBe(false);
  expect(isOrderedSubsequence([69, 54], [69])).toBe(false);
  expect(isOrderedSubsequence([69, 54], [50])).toBe(false);
});
