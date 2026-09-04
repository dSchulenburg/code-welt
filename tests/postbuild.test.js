import { parseCmidLine, parseBadgeLines, applyForumResult, applyBadgeResults, badgeSpecsFromEtappen } from '../moodle/postbuild.mjs';

test('parseCmidLine liest cmid=<n> aus der create-forum.php-Ausgabe', () => {
  expect(parseCmidLine('cmid=12\n')).toBe(12);
  expect(parseCmidLine('irgendein Text davor cmid=345 danach')).toBe(345);
});

test('parseCmidLine wirft, wenn keine cmid=-Zeile vorkommt', () => {
  expect(() => parseCmidLine('nichts hier')).toThrow(/cmid=/);
});

test('parseBadgeLines liest alle badge=<key> id=<n>-Zeilen, ignoriert andere Ausgabezeilen', () => {
  const out = [
    'badge badge-holz: neu angelegt (id 3)',
    'badge=badge-holz id=3',
    'badge badge-stein: existiert bereits (id 4)',
    'badge=badge-stein id=4',
  ].join('\n');
  expect(parseBadgeLines(out)).toEqual([
    { key: 'badge-holz', id: 3 },
    { key: 'badge-stein', id: 4 },
  ]);
});

test('parseBadgeLines liefert ein leeres Array ohne Treffer', () => {
  expect(parseBadgeLines('nichts hier')).toEqual([]);
});

test('applyForumResult schreibt items["forum-nour"] mit der cmid und managedBy: "postbuild"', () => {
  const reg = { items: {} };
  applyForumResult(reg, 42);
  expect(reg.items['forum-nour']).toEqual({ cmid: 42, managedBy: 'postbuild' });
});

test('applyForumResult ueberschreibt einen bestehenden Eintrag (idempotent bei erneutem Lauf)', () => {
  const reg = { items: { 'forum-nour': { cmid: 1, managedBy: 'postbuild' } } };
  applyForumResult(reg, 1);
  expect(reg.items['forum-nour']).toEqual({ cmid: 1, managedBy: 'postbuild' });
});

// managedBy markiert das Forum als Nachlauf-Item, damit build-course.mjs' orphanKeys() (moodle/lib/
// registry-ops.mjs) es nicht als verwaist loescht -- siehe tests/registry-ops.test.js (Fix 3c).
test('applyForumResult setzt managedBy: "postbuild" auch bei einem Altbestand ohne das Feld', () => {
  const reg = { items: { 'forum-nour': { cmid: 108 } } };
  applyForumResult(reg, 122);
  expect(reg.items['forum-nour']).toEqual({ cmid: 122, managedBy: 'postbuild' });
});

test('applyBadgeResults legt reg.badges an und traegt beide Badges ein', () => {
  const reg = {};
  applyBadgeResults(reg, [{ key: 'badge-holz', id: 3 }, { key: 'badge-stein', id: 4 }]);
  expect(reg.badges).toEqual({ 'badge-holz': 3, 'badge-stein': 4 });
});

test('applyBadgeResults ergaenzt ein bestehendes badges-Objekt, statt es zu ersetzen', () => {
  const reg = { badges: { 'badge-holz': 3 } };
  applyBadgeResults(reg, [{ key: 'badge-stein', id: 4 }]);
  expect(reg.badges).toEqual({ 'badge-holz': 3, 'badge-stein': 4 });
});

// badgeSpecsFromEtappen: Badge-Spezifikationen kommen aus ETAPPEN, nicht aus String-Literalen im
// Skript (Final-Review-Fix B, Important 3). Fake-ETAPPEN/Fake-STATIONS/Fake-Register statt der
// echten Daten -- die Funktion ist reine Ableitung, braucht keinen echten Kursbau.
const fakeStations = {
  s01: {},
  s02: { bossCheck: { key: 'boss-holz' } },
};
const fakeEtappen = [
  { id: 'holz', stations: ['s01', 's02'], badge: { key: 'badge-holz', icon: 'holz.png' } },
  { id: 'eisen', stations: [], badge: { key: 'badge-eisen', icon: 'eisen.png' } },
];

test('badgeSpecsFromEtappen liefert key/icon/cmids je Etappe (Quizze der Stationen + Boss-Check der letzten Station)', () => {
  const items = { 's01-quiz': { cmid: 10 }, 's02-quiz': { cmid: 11 }, 'boss-holz': { cmid: 12 } };
  const { specs, skipped } = badgeSpecsFromEtappen(fakeEtappen, fakeStations, items);
  expect(specs).toEqual([{ etappeId: 'holz', key: 'badge-holz', icon: 'holz.png', cmids: [10, 11, 12] }]);
  expect(skipped).toEqual([{ id: 'eisen', reason: 'keine Stationen (noch nicht gebaut)' }]);
});

test('badgeSpecsFromEtappen ueberspringt eine Etappe, wenn eine ihrer Stationen (oder deren Boss-Check) noch keine cmid im Register hat', () => {
  const items = { 's01-quiz': { cmid: 10 } }; // s02-quiz fehlt
  const { specs, skipped } = badgeSpecsFromEtappen(fakeEtappen, fakeStations, items);
  expect(specs.find((s) => s.etappeId === 'holz')).toBeUndefined();
  expect(skipped).toContainEqual({ id: 'holz', reason: "Register: items['s02-quiz'].cmid fehlt" });
});
