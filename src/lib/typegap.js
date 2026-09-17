// Pruefung der Tipp-Luecke (Nachtrag Plan 4, Entscheidung 26). Rein, ohne React testbar.
// Leerzeichen zaehlen nie. Gross-/Kleinschreibung zaehlt: MakeCode meldet `redstone` statt
// `REDSTONE` als Fehler; die App sagt deshalb "Fast" statt "Richtig".
const squash = (s) => String(s ?? '').replace(/\s+/g, '');

export function judgeGap(input, accept) {
  const got = squash(input);
  if (got === '') return 'wrong';
  if (accept.some((a) => squash(a) === got)) return 'right';
  if (accept.some((a) => squash(a).toLowerCase() === got.toLowerCase())) return 'case';
  return 'wrong';
}

export function judgeAll(inputs, gaps) {
  const verdicts = gaps.map((g, i) => judgeGap(inputs[i], g.accept));
  const overall = verdicts.every((v) => v === 'right') ? 'right' : verdicts.includes('wrong') ? 'wrong' : 'case';
  return { verdicts, overall };
}
