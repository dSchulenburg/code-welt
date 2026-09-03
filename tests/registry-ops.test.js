import { contentHash, needsUpdate, isOrderedSubsequence, orphanKeys } from '../moodle/lib/registry-ops.mjs';

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

test('contentHash fuer Aufgaben deckt Name, Intro und gradeMax ab, ist aber stabil ueber die Key-Reihenfolge', () => {
  const a1 = { type: 'assignment', key: 'boss-holz', name: 'Boss-Check Holz', intro: '<p>Baue ein L.</p>', gradeMax: 100 };
  const a2 = { intro: '<p>Baue ein L.</p>', gradeMax: 100, name: 'Boss-Check Holz', key: 'boss-holz', type: 'assignment' };
  expect(contentHash(a1)).toBe(contentHash(a2));

  const changedIntro = { ...a1, intro: '<p>Baue ein anderes L.</p>' };
  expect(contentHash(a1)).not.toBe(contentHash(changedIntro));

  const changedGrade = { ...a1, gradeMax: 50 };
  expect(contentHash(a1)).not.toBe(contentHash(changedGrade));

  const changedName = { ...a1, name: 'Boss-Check Holz (neu)' };
  expect(contentHash(a1)).not.toBe(contentHash(changedName));
});

test('contentHash fuer Seiten deckt Name und HTML ab, ist aber stabil ueber die Key-Reihenfolge', () => {
  const p1 = { type: 'page', key: 'page-setup', name: 'Setup', html: '<p>Text</p>' };
  const p2 = { html: '<p>Text</p>', name: 'Setup', key: 'page-setup', type: 'page' };
  expect(contentHash(p1)).toBe(contentHash(p2));

  const changedHtml = { ...p1, html: '<p>Anderer Text</p>' };
  expect(contentHash(p1)).not.toBe(contentHash(changedHtml));

  const changedName = { ...p1, name: 'Anderer Titel' };
  expect(contentHash(p1)).not.toBe(contentHash(changedName));
});

test('contentHash fuer Ordner ist konstant — Ordner werden nie aktualisiert, Name/Key fliessen nicht ein', () => {
  const f1 = { type: 'folder', key: 'weltdateien', name: 'Weltdateien' };
  const f2 = { type: 'folder', key: 'andere-datei', name: 'Ein ganz anderer Name' };
  expect(contentHash(f1)).toBe(contentHash(f2));
  expect(contentHash(f1)).toMatch(/^[0-9a-f]{12}$/);
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

test('orphanKeys liefert Registry-Keys, die in der aktuellen Kursdefinition nicht mehr vorkommen', () => {
  const registryItems = { 's02-station': {}, 's02-quiz': {}, 'teacher-setup': {} };
  const def = { sections: [{ items: [{ key: 's02-station' }, { key: 's02-quiz' }] }] };
  expect(orphanKeys(registryItems, def)).toEqual(['teacher-setup']);
});

test('orphanKeys liefert ein leeres Array, wenn alle Registry-Keys noch gebraucht werden', () => {
  const registryItems = { 's02-quiz': {} };
  const def = { sections: [{ items: [{ key: 's02-quiz' }] }, { items: [] }] };
  expect(orphanKeys(registryItems, def)).toEqual([]);
});

test('orphanKeys findet auch Keys, die erst in einem spaeteren Abschnitt gebraucht werden', () => {
  const registryItems = { 'boss-holz': {} };
  const def = { sections: [{ items: [] }, { items: [{ key: 'boss-holz' }] }] };
  expect(orphanKeys(registryItems, def)).toEqual([]);
});
