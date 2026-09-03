// Content-Hash je Registry-Item: erkennt, ob sich Label-HTML oder Quiz-Inhalt (Name, Intro,
// Fragen) seit dem letzten build-course.mjs-Lauf geaendert hat. sha256, auf 12 Hex-Zeichen
// gekuerzt — es geht um Aenderungserkennung, nicht Kryptografie, Kollisionen sind hier unkritisch.
import { createHash } from 'node:crypto';

// Sortiert Objekt-Keys rekursiv, damit der Hash unabhaengig von der Konstruktions-Reihenfolge
// der Item-Objekte ist (z. B. wenn course-def.mjs Felder mal so, mal so anordnet).
function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

// Nur der inhaltlich relevante Ausschnitt geht in den Hash — bei Labels und Seiten das HTML
// (Seiten zusaetzlich der Name, da der Seitenname selbst sichtbarer Inhalt ist), bei Quizzen und
// Aufgaben Name+Intro(+Fragen bzw. +gradeMax). Ein separates questionsHash-Feld gibt es bewusst
// nicht: eine reine Namensaenderung loest damit ebenfalls eine Quiz-/Aufgaben-Neuanlage aus (siehe
// build-course.mjs, Abschnitt 3) statt eines billigen In-Place-Renames. Das ist in Kauf genommen,
// weil es die Fallunterscheidung im Build-Skript klein haelt und Namensaenderungen an bestehenden
// Quizzen/Aufgaben in der Praxis selten sind. Ordner haben keinen Update-Pfad (werden nie
// aktualisiert) — der Hash wird trotzdem berechnet (harmlos, ungenutzt fuer Ordner).
export function contentHash(item) {
  let payload;
  if (item.type === 'quiz') payload = { name: item.name, intro: item.intro, questions: item.questions };
  else if (item.type === 'assignment') payload = { name: item.name, intro: item.intro, gradeMax: item.gradeMax };
  else if (item.type === 'page') payload = { name: item.name, html: item.html };
  else payload = { html: item.html };
  return createHash('sha256').update(stableStringify(payload)).digest('hex').slice(0, 12);
}

// entry = Registry-Eintrag fuer diesen Item-Key (kann fehlen), item = aktuelle Definition aus
// course-def.mjs. true, wenn der Eintrag fehlt oder sein gespeicherter Hash vom aktuellen Inhalt
// abweicht. Ein Eintrag OHNE hash-Feld (Altbestand vor dieser Fix-Welle) ist NICHT automatisch
// "needsUpdate" — das behandelt build-course.mjs separat als "Hash jetzt erstmalig speichern,
// keine Aenderung", damit die Migration selbst keine Label-Neuanlage/Quiz-Neuanlage ausloest.
export function needsUpdate(entry, item) {
  return !entry || entry.hash !== contentHash(item);
}

// true, wenn alle Elemente aus `want` in `actual` in genau dieser relativen Reihenfolge
// vorkommen — andere Elemente duerfen beliebig dazwischen, davor oder danach stehen (z. B. das
// Ankuendigungsforum, das build-course.mjs nicht verwaltet). Leeres `want` ist immer erfuellt.
export function isOrderedSubsequence(want, actual) {
  let i = 0;
  for (const x of actual) {
    if (i < want.length && x === want[i]) i++;
  }
  return i === want.length;
}
