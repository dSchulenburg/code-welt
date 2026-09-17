import { STATIONS } from '../src/data/stations.js';

// Final-Review Plan 4 (17.09.2026): Der Simulator (tests/parcours-sim.test.js) rechnet mit den
// Bloecken einer Station, die SuS lesen aber das Python. tests/blocks-consistency.test.js sieht
// nur Reihenfolge und Tiefe der Befehle, nicht die Werte darin: range(14) im Python neben
// repeat 10 in den Bloecken fiele dort nicht auf. Dieser Test bindet die Werte, auf die es in
// Gold ankommt: die Zahl in range, die Bedingung in if/while (was, wohin, not) und bei s11 die
// Tipp-Luecke an die Schleifenzeile der Station.

const GOLD = ['s10', 's11', 's12'];

function walk(tree, out = []) {
  for (const b of tree) {
    out.push(b);
    walk([...(b.body || []), ...(b.elseBody || [])], out);
  }
  return out;
}

const RANGE = /^\s*for index in range\((\d+)\):\s*$/;
const COND = /^\s*(if|while) (not )?agent\.detect\(AgentDetection\.(\w+), (\w+)\):\s*$/;

function fromPython(py) {
  const lines = py.split('\n');
  return {
    ranges: lines.map((l) => l.match(RANGE)).filter(Boolean).map((m) => Number(m[1])),
    conds: lines.map((l) => l.match(COND)).filter(Boolean)
      .map((m) => ({ kind: m[1], not: Boolean(m[2]), what: m[3].toLowerCase(), dir: m[4].toLowerCase() })),
  };
}

function fromBlocks(blocks) {
  const all = walk(blocks);
  return {
    ranges: all.filter((b) => b.kind === 'repeat').map((b) => b.n),
    conds: all.filter((b) => b.kind === 'if' || b.kind === 'while').map((b) => {
      const inner = b.cond.not || b.cond;
      return { kind: b.kind, not: Boolean(b.cond.not), what: inner.what, dir: inner.dir };
    }),
  };
}

for (const sid of GOLD) {
  test(`${sid}: range(n) im Python ist die Zahl im repeat-Block`, () => {
    const st = STATIONS[sid];
    expect(fromPython(st.python).ranges).toEqual(fromBlocks(st.blocks).ranges);
  });

  test(`${sid}: agent.detect in if/while hat dieselbe Bedingung wie der Block (was, wohin, not)`, () => {
    const st = STATIONS[sid];
    const py = fromPython(st.python).conds;
    expect(py.length).toBeGreaterThan(0);
    expect(py).toEqual(fromBlocks(st.blocks).conds);
  });
}

test('s11: die Tipp-Luecke mit accept[0] ist die Schleife der Station, nur mit der neuen Zahl', () => {
  const st = STATIONS.s11;
  const type = st.exercises.find((e) => e.type === 'type');
  const filled = type.code.replace('___', type.gaps[0].accept[0]).split('\n');
  const n = Number(filled[0].match(RANGE)?.[1]);
  expect(n).toBe(Number(type.gaps[0].accept[0]));

  // Schleife der Station: von der for-Zeile bis vor player.on_chat, eine Stufe ausgerueckt.
  const lines = st.python.split('\n');
  const from = lines.findIndex((l) => RANGE.test(l));
  const to = lines.findIndex((l) => l.startsWith('player.on_chat'));
  const loop = lines.slice(from, to).map((l) => l.replace(/^ {4}/, ''));
  const stationN = Number(loop[0].match(RANGE)[1]);
  expect(filled).toEqual(loop.map((l, i) => (i === 0 ? l.replace(`range(${stationN})`, `range(${n})`) : l)));
});
