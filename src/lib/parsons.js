// Sortier-Puzzle (Parsons-Problem): Zeilen mischen und Reihenfolge pruefen.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleDeterministic(lines, seed = 1) {
  if (lines.length < 2) return [...lines];
  const rnd = mulberry32(seed);
  let out;
  let guard = 0;
  do {
    out = [...lines];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    guard++;
  } while (out.every((l, i) => l === lines[i]) && guard < 20);
  if (out.every((l, i) => l === lines[i])) out = [...lines.slice(1), lines[0]];
  return out;
}

export function checkOrder(current, solution) {
  return current.length === solution.length && current.every((l, i) => l === solution[i]);
}
