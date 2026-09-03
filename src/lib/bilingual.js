// Zweisprachige Beschriftung fuer Ueberschriften: "Deutsch · Stuetze".
// Buttons bleiben deutsch (Nachtrag Plan 2, Entscheidung 2).
export function pair(de, support) {
  if (!support || support === de) return de;
  return `${de} · ${support}`;
}
