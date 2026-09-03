// format('Station {n}', { n: 2 }) -> 'Station 2'. Unbekannte Platzhalter bleiben stehen.
export function format(str, vars = {}) {
  return String(str).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}
