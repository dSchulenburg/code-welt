import parcours from '../scripts/minecraft/parcours.json';
import { buildWorld, runProgram } from '../scripts/minecraft/parcours-sim.mjs';

const lane = (id) => parcours.lanes.find((l) => l.id === id);
const hat = (body) => [{ kind: 'onChat', word: 't', body }];
const detect = (what, dir) => ({ kind: 'agent.detect', what, dir });
const pave = { kind: 'if', cond: detect('block', 'down'),
  body: [{ kind: 'agent.move', dir: 'forward', n: 1 }], elseBody: [{ kind: 'agent.place', dir: 'down' }] };
const run = (id, body, opts) => { const l = lane(id); const w = buildWorld(l, parcours.groundTop); return { w, a: runProgram(w, l, hat(body), opts) }; };

test('Achsen: Blick nach Sueden, LEFT_TURN fuehrt nach Osten (+x), Schritt nach Sueden erhoeht z', () => {
  const { a } = run('ziel', [{ kind: 'agent.teleportToPlayer' }, { kind: 'agent.move', dir: 'forward', n: 1 }]);
  expect([a.x, a.z]).toEqual([4, 57]);
  const turned = run('ecke', [{ kind: 'agent.teleportToPlayer' }, { kind: 'agent.turn', dir: 'left' }]).a;
  expect(turned.facing).toBe('E');
});

test('ecke: 20 Durchlaeufe enden genau ueber der zweiten Goldmarke', () => {
  const { w, a } = run('ecke', [{ kind: 'agent.teleportToPlayer' }, { kind: 'repeat', n: 20, body: [
    { kind: 'if', cond: detect('block', 'forward'), body: [{ kind: 'agent.turn', dir: 'left' }] },
    { kind: 'agent.move', dir: 'forward', n: 1 },
  ] }]);
  expect([a.x, a.y, a.z]).toEqual([-11, 5, 66]);
  expect(w.get(-11, 4, 66)).toBe('GOLD_BLOCK');
});

test('loecher: 10 Durchlaeufe reichen nicht, 13 fuellen alle Loecher, erst 14 erreichen das letzte Feld', () => {
  const prog = (n) => [{ kind: 'agent.teleportToPlayer' }, { kind: 'agent.setItem', block: 'planks_oak', count: 64, slot: 1 }, { kind: 'repeat', n, body: [pave] }];
  const ten = run('loecher', prog(10));
  expect(ten.a.z).toBe(63);
  expect(ten.w.get(-4, 4, 64)).toBe('AIR');
  expect(run('loecher', prog(13)).a.z).toBe(65);
  const fourteen = run('loecher', prog(14));
  expect(fourteen.a.z).toBe(66);
  for (const z of [58, 60, 61, 64]) expect(fourteen.w.get(-4, 4, z)).toBe('PLANKS_OAK');
});

test('ziel: while not detect forward endet vor der Wand, alle Loecher gefuellt', () => {
  const { w, a } = run('ziel', [{ kind: 'agent.teleportToPlayer' }, { kind: 'agent.setItem', block: 'planks_oak', count: 64, slot: 1 },
    { kind: 'while', cond: { not: detect('block', 'forward') }, body: [pave] }]);
  expect(a.z).toBe(76);
  for (const z of [59, 62, 63, 67, 71, 72]) expect(w.get(4, 4, z)).toBe('PLANKS_OAK');
});

test('boss: das alte Programm laeuft am Redstone vorbei bis zur Sicherheitswand, das geaenderte stoppt darauf', () => {
  const body = (cond) => [{ kind: 'agent.teleportToPlayer' }, { kind: 'agent.setItem', block: 'planks_oak', count: 64, slot: 1 }, { kind: 'while', cond, body: [pave] }];
  expect(run('boss', body({ not: detect('block', 'forward') })).a.z).toBe(78);
  const { w, a } = run('boss', body({ not: detect('redstone', 'down') }));
  expect(a.z).toBe(68);
  expect(w.get(a.x, 4, a.z)).toBe('REDSTONE_BLOCK');
});

test('ohne not laeuft while kein einziges Mal (Fehlersuche s12)', () => {
  const { a } = run('ziel', [{ kind: 'agent.teleportToPlayer' }, { kind: 'while', cond: detect('block', 'forward'), body: [pave] }]);
  expect(a.z).toBe(56);
});

test('Endlosschleife wird erkannt statt zu haengen', () => {
  expect(() => run('ziel', [{ kind: 'agent.teleportToPlayer' }, { kind: 'while', cond: { not: detect('redstone', 'down') }, body: [pave] }], { maxSteps: 500 }))
    .toThrow(/Endlosschleife/);
});

test('unbekannte Blockart wirft', () => {
  expect(() => run('ziel', [{ kind: 'agent.destroy', dir: 'forward' }])).toThrow(/Simulator kennt agent\.destroy nicht/);
});

import { STATIONS } from '../src/data/stations.js';
import de from '../src/i18n/de.js';

// Tiefe Kopie mit geaenderter Stelle: die Tests pruefen genau das Programm, das die App zeigt.
const clone = (x) => JSON.parse(JSON.stringify(x));
function findKind(tree, kind) {
  for (const b of tree) {
    if (b.kind === kind) return b;
    const inner = findKind([...(b.body || []), ...(b.elseBody || [])], kind);
    if (inner) return inner;
  }
  return null;
}
const runStation = (id, blocks) => { const l = lane(id); const w = buildWorld(l, parcours.groundTop); return { w, a: runProgram(w, l, blocks) }; };

test('s10 (Stationsdaten) endet auf der Bahn ecke ueber der zweiten Goldmarke', () => {
  const { w, a } = runStation('ecke', STATIONS.s10.blocks);
  expect([a.x, a.z]).toEqual([-11, 66]);
  expect(w.get(a.x, 4, a.z)).toBe('GOLD_BLOCK');
});

test('s11: die Zahl der Station reicht nicht, die Zahl der Tipp-Luecke erreicht das letzte Feld', () => {
  const stationRun = runStation('loecher', STATIONS.s11.blocks);
  expect(stationRun.a.z).toBeLessThan(66);
  const accept = STATIONS.s11.exercises.find((e) => e.type === 'type').gaps[0].accept[0];
  const fixed = clone(STATIONS.s11.blocks);
  findKind(fixed, 'repeat').n = Number(accept);
  const fixedRun = runStation('loecher', fixed);
  expect(fixedRun.a.z).toBe(66);
  for (const z of [58, 60, 61, 64]) expect(fixedRun.w.get(-4, 4, z)).toBe('PLANKS_OAK');
  const oneLess = clone(STATIONS.s11.blocks);
  findKind(oneLess, 'repeat').n = Number(accept) - 1;
  expect(runStation('loecher', oneLess).a.z).toBeLessThan(66);
  expect(de.stations.s11.tipSolution).toContain(`range(${accept})`);
});

test('s11 Fehlersuche: FORWARD statt DOWN laesst den Agent auf der Goldmarke stehen', () => {
  const bug = clone(STATIONS.s11.blocks);
  findKind(bug, 'repeat').n = 14;
  findKind(bug, 'if').cond.dir = 'forward';
  expect(runStation('loecher', bug).a.z).toBe(56);
  expect(STATIONS.s11.exercises.find((e) => e.type === 'findbug').lines.some((l) => l.includes('AgentDetection.BLOCK, FORWARD'))).toBe(true);
});
