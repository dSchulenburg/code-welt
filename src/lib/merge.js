// Tiefe Zusammenfuehrung: Werte aus overlay ersetzen base, fehlende Felder bleiben aus base.
// Arrays werden als Ganzes ersetzt (eine uebersetzte Aufgabenliste ersetzt die deutsche).
export function deepMerge(base, overlay) {
  if (Array.isArray(base) || Array.isArray(overlay)) return overlay === undefined ? base : overlay;
  if (typeof base !== 'object' || base === null) return overlay === undefined ? base : overlay;
  const out = { ...base };
  if (overlay && typeof overlay === 'object') {
    for (const [k, v] of Object.entries(overlay)) {
      out[k] = k in base ? deepMerge(base[k], v) : v;
    }
  }
  return out;
}
