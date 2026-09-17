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
  for (const z of [58, 60, 62, 64]) expect(fourteen.w.get(-4, 4, z)).toBe('PLANKS_OAK');
});

test('ziel: while not detect forward endet vor der Wand, alle Loecher gefuellt', () => {
  const { w, a } = run('ziel', [{ kind: 'agent.teleportToPlayer' }, { kind: 'agent.setItem', block: 'planks_oak', count: 64, slot: 1 },
    { kind: 'while', cond: { not: detect('block', 'forward') }, body: [pave] }]);
  expect(a.z).toBe(76);
  for (const z of [59, 61, 63, 67, 71, 73]) expect(w.get(4, 4, z)).toBe('PLANKS_OAK');
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
  for (const z of [58, 60, 62, 64]) expect(fixedRun.w.get(-4, 4, z)).toBe('PLANKS_OAK');
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

test('s12 (Stationsdaten) laeuft auf der Bahn ziel bis vor die Wand', () => {
  expect(runStation('ziel', STATIONS.s12.blocks).a.z).toBe(76);
});

test('Boss-Check Gold: s12 unveraendert laeuft vorbei; die Bedingung aus der Tipp-Luecke stoppt auf dem Redstone', () => {
  expect(runStation('boss', STATIONS.s12.blocks).a.z).toBe(78);
  const [what, dir] = STATIONS.s12.exercises.find((e) => e.type === 'type').gaps.map((g) => g.accept[0].toLowerCase());
  const changed = clone(STATIONS.s12.blocks);
  findKind(changed, 'while').cond = { not: { kind: 'agent.detect', what, dir } };
  const { w, a } = runStation('boss', changed);
  expect(a.z).toBe(68);
  expect(w.get(a.x, 4, a.z)).toBe('REDSTONE_BLOCK');
});

test('s12 Fehlersuche: ohne not laeuft der Agent nicht los', () => {
  const bug = clone(STATIONS.s12.blocks);
  findKind(bug, 'while').cond = findKind(bug, 'while').cond.not;
  expect(runStation('ziel', bug).a.z).toBe(56);
  expect(STATIONS.s12.exercises.find((e) => e.type === 'findbug').lines[0]).toBe('while agent.detect(AgentDetection.BLOCK, FORWARD):');
});

// Final-Review Plan 4 (17.09.2026): Jedes Loch ist ein einzelnes Feld, damit die Zahl der Loecher,
// die die SuS sehen, die Zahl ist, mit der sie rechnen ("10 Felder und 4 Loecher").
test('Loecher liegen einzeln: kein Loch ist laenger als ein Feld, keine zwei Loecher grenzen aneinander', () => {
  const erwartet = { loecher: [58, 60, 62, 64], ziel: [59, 61, 63, 67, 71, 73], boss: [58, 61, 65, 71] };
  for (const [id, zs] of Object.entries(erwartet)) {
    const holes = lane(id).fills.filter((f) => f.block === 'AIR' && f.from[1] < parcours.groundTop + 1);
    for (const f of holes) expect(f.from[2], `${id}: Loch ${f.from[2]} ist ein Feld lang`).toBe(f.to[2]);
    const z = holes.map((f) => f.from[2]).sort((a, b) => a - b);
    expect(z, id).toEqual(zs);
    for (let i = 1; i < z.length; i++) expect(z[i] - z[i - 1], `${id}: ${z[i - 1]} und ${z[i]}`).toBeGreaterThan(1);
  }
});

// Fehlerbilder aus content/lehrkraft/ds10.md und ds11.md (Final-Review Plan 4): Jeder Satz dort
// ueber das Verhalten des Agent ist hier gemessen.
test('ds10 Fehlerbild: DOWN statt FORWARD ist fast immer wahr, der Agent dreht sich jedes Mal und endet vor der Bahn', () => {
  const bug = clone(STATIONS.s10.blocks);
  findKind(bug, 'if').cond.dir = 'down';
  const { a } = runStation('ecke', bug);
  expect([a.x, a.z]).toEqual([-22, 55]);
  expect(a.z).toBeLessThan(lane('ecke').start[2]);
});

test('ds10 Fehlerbild: agent.move unter if eingerueckt, der Agent bleibt auf dem Goldblock', () => {
  const bug = clone(STATIONS.s10.blocks);
  const loop = findKind(bug, 'repeat');
  loop.body[0].body.push(loop.body.pop());
  const { w, a } = runStation('ecke', bug);
  expect([a.x, a.z]).toEqual([-21, 56]);
  expect(w.get(a.x, 4, a.z)).toBe('GOLD_BLOCK');
});

test('ds10 Fehlerbild: Start mit Blick nach Norden oder Osten laeuft nach Norden aus der Bahn, nach Westen kommt zufaellig an', () => {
  // Annahme wie im Simulator-Kopf: teleport_to_player uebernimmt die Blickrichtung des Spielers.
  for (const facing of ['N', 'E']) {
    const l = { ...lane('ecke'), facing };
    const a = runProgram(buildWorld(l, parcours.groundTop), l, STATIONS.s10.blocks);
    expect(a.facing, facing).toBe('N');
    expect([a.x, a.z], facing).toEqual([-21, 36]);
  }
  // Mit Blick nach Westen steht vorn die Wand, LEFT_TURN fuehrt nach Sueden: zufaellig richtig.
  const west = { ...lane('ecke'), facing: 'W' };
  expect((({ x, z }) => [x, z])(runProgram(buildWorld(west, parcours.groundTop), west, STATIONS.s10.blocks))).toEqual([-11, 66]);
});

test('ds11 Fehlerbild: if und else vertauscht, place(DOWN) auf den Goldblock tut nichts, der Agent geht nie los', () => {
  const bug = clone(STATIONS.s11.blocks);
  const branch = findKind(bug, 'if');
  [branch.body, branch.elseBody] = [branch.elseBody, branch.body];
  for (const n of [10, 14]) {
    findKind(bug, 'repeat').n = n;
    const { w, a } = runStation('loecher', bug);
    expect(a.z, `range(${n})`).toBe(56);
    expect(w.get(-4, 4, 58), `range(${n})`).toBe('AIR');
  }
});

test('ds11 zweiter Lauf: gefuellte Loecher bleiben gefuellt, danach reichen weniger Durchlaeufe', () => {
  const l = lane('loecher');
  const mit = (n) => { const b = clone(STATIONS.s11.blocks); findKind(b, 'repeat').n = n; return b; };
  // Erster Lauf mit der Stationszahl range(10); dieselbe Welt geht in den zweiten Lauf.
  const nachErstemLauf = () => {
    const w = buildWorld(l, parcours.groundTop);
    expect(runProgram(w, l, STATIONS.s11.blocks).z).toBe(63);
    return w;
  };
  const w = nachErstemLauf();
  for (const z of [58, 60, 62]) expect(w.get(-4, 4, z)).toBe('PLANKS_OAK');
  expect(w.get(-4, 4, 64)).toBe('AIR');
  expect(runProgram(w, l, mit(10)).z).toBe(65);
  expect(runProgram(nachErstemLauf(), l, mit(11)).z).toBe(66);
  // Gegenprobe: auf einer frisch gebauten Bahn braucht es weiter 14.
  expect(runProgram(buildWorld(l, parcours.groundTop), l, mit(13)).z).toBe(65);
});
