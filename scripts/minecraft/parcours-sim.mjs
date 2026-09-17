// Parcours-Simulator (Nachtrag Plan 4, Entscheidung 28). Fuehrt eine Block-Beschreibung aus
// src/data/stations.js auf einer Bahn aus scripts/minecraft/parcours.json aus.
// Achsen wie in Minecraft und MakeCode (minecraft.makecode.com/reference/positions/pos):
// +x = Osten, +z = Sueden. Mit Blick nach Sueden fuehrt LEFT_TURN nach Osten.
// Annahmen, die Dirk im Spiel prueft (Nachtrag Abschnitt 5): Der Agent faellt nicht, wenn er
// ueber ein Loch geht; agent.place(DOWN) fuellt nur Luft; detect(BLOCK) ist fuer Luft falsch.
const STEP = { S: [0, 1], E: [1, 0], N: [0, -1], W: [-1, 0] };
const LEFT = { S: 'E', E: 'N', N: 'W', W: 'S' };
const RIGHT = { S: 'W', W: 'N', N: 'E', E: 'S' };
const key = (x, y, z) => `${x},${y},${z}`;
const range = (a, b) => { const out = []; for (let i = Math.min(a, b); i <= Math.max(a, b); i++) out.push(i); return out; };

export function buildWorld(lane, groundTop = 4) {
  const cells = new Map();
  for (const f of lane.fills) {
    for (const x of range(f.from[0], f.to[0])) for (const y of range(f.from[1], f.to[1])) for (const z of range(f.from[2], f.to[2])) {
      cells.set(key(x, y, z), f.block);
    }
  }
  for (const p of lane.places) cells.set(key(...p.at), p.block);
  return {
    get: (x, y, z) => cells.get(key(x, y, z)) ?? (y <= groundTop ? 'GRASS' : 'AIR'),
    set: (block, x, y, z) => { cells.set(key(x, y, z), block); },
  };
}

export function runProgram(world, lane, blocks, { maxSteps = 1000 } = {}) {
  const agent = { x: lane.start[0], y: lane.start[1] + 1, z: lane.start[2], facing: lane.facing, steps: 0 };
  const vars = {};
  let item = null;

  const tick = () => { if (++agent.steps > maxSteps) throw new Error(`Endlosschleife: mehr als ${maxSteps} Schritte`); };
  const cell = (dir) => {
    if (dir === 'down') return [agent.x, agent.y - 1, agent.z];
    if (dir === 'forward') { const [dx, dz] = STEP[agent.facing]; return [agent.x + dx, agent.y, agent.z + dz]; }
    throw new Error(`Simulator kennt Richtung ${dir} nicht`);
  };
  const count = (v) => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && v in vars) return vars[v];
    throw new Error(`Simulator kennt Zaehler ${JSON.stringify(v)} nicht`);
  };
  const test = (c) => {
    if (c.not) return !test(c.not);
    if (c.kind !== 'agent.detect') throw new Error(`Simulator kennt Bedingung ${JSON.stringify(c)} nicht`);
    const block = world.get(...cell(c.dir));
    if (c.what === 'block') return block !== 'AIR';
    if (c.what === 'redstone') return block === 'REDSTONE_BLOCK';
    throw new Error(`Simulator kennt detect ${c.what} nicht`);
  };

  const exec = (body) => {
    for (const b of body) {
      tick();
      switch (b.kind) {
        case 'agent.teleportToPlayer':
          Object.assign(agent, { x: lane.start[0], y: lane.start[1] + 1, z: lane.start[2], facing: lane.facing });
          break;
        case 'agent.setItem': item = String(b.block).toUpperCase(); break;
        case 'setVar': vars[b.varName] = b.value; break;
        case 'repeat': for (let i = 0, n = count(b.n); i < n; i++) exec(b.body || []); break;
        case 'if': exec(test(b.cond) ? (b.body || []) : (b.elseBody || [])); break;
        case 'while':
          while (test(b.cond)) { exec(b.body || []); tick(); }
          break;
        case 'agent.move':
          if (b.dir !== 'forward') throw new Error(`Simulator kennt agent.move ${b.dir} nicht`);
          for (let i = 0; i < (b.n ?? 1); i++) {
            const [x, y, z] = cell('forward');
            if (world.get(x, y, z) === 'AIR') Object.assign(agent, { x, z });
          }
          break;
        case 'agent.turn': agent.facing = (b.dir === 'left' ? LEFT : RIGHT)[agent.facing]; break;
        case 'agent.place': {
          const [x, y, z] = cell(b.dir);
          if (world.get(x, y, z) === 'AIR' && item) world.set(item, x, y, z);
          break;
        }
        default: throw new Error(`Simulator kennt ${b.kind} nicht`);
      }
    }
  };

  for (const h of blocks) exec(h.body || []);
  return agent;
}
