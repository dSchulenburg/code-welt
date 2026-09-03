// Kleine Simulation des Minecraft-Agents auf einem Raster fuer die Vorhersage-Uebung.
// x nach rechts, y nach unten (0 = oben). Nase: N E S W
const DIRS = ['N', 'E', 'S', 'W'];
const DELTA = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };

export function turn(dir, side) {
  const i = DIRS.indexOf(dir);
  return side === 'left' ? DIRS[(i + 3) % 4] : DIRS[(i + 1) % 4];
}

export function simulate(grid, start, program) {
  let { x, y, dir } = start;
  const trail = [{ x, y }];
  for (const raw of program) {
    const [cmd, arg] = String(raw).trim().split(/\s+/);
    if (cmd === 'left' || cmd === 'right') { dir = turn(dir, cmd); continue; }
    if (cmd === 'forward') {
      const n = Number(arg || 1);
      for (let k = 0; k < n; k++) {
        const nx = Math.min(grid.w - 1, Math.max(0, x + DELTA[dir][0]));
        const ny = Math.min(grid.h - 1, Math.max(0, y + DELTA[dir][1]));
        if (nx === x && ny === y) break; // Rand
        x = nx; y = ny;
        trail.push({ x, y });
      }
      continue;
    }
    throw new Error(`Unbekannter Befehl: ${cmd}`);
  }
  return { x, y, dir, trail };
}
