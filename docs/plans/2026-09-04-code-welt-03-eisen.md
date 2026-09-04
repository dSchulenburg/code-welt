# Code-Welt · Plan 3 von 6: Eisen (DS 7–9) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die Etappe Eisen komplett: drei Stationen (DS 7–9) in sechs Sprachen mit Variable, Koordinaten/`fill` und Zähler, drei neue Übungstypen für „Python lesen", Boss-Check und Badge Eisen, Erkundungsgebiet in der Welt `ankunft`, Lehrkraft-Seiten, erweiterte Smokes, bereit für Dirks Probelauf Eisen in der Box.

**Architecture:** Alles baut auf Plan 1 und 2 auf: Stationen sind Daten in drei Dateien (`src/data/stations.js` Struktur, `src/i18n/de.js` Stütze, `src/content/de.js` Leit-Ebene); das Bauskript legt daraus den Box-Kurs an, der Postbuild die Badges. Neu sind drei Übungskomponenten nach dem Muster von `ParsonsPuzzle`, vier Erweiterungen der SVG-Block-Ansicht (Variablen-Pille, Minus-Ausdruck, pos-Pille, Operator-Slot), ein zweiter Chat-Befehl im Weltbauskript und ein Chunk-Cache im Übersetzungsskript, damit Holz und Stein beim Übersetzen nicht neu erzeugt werden.

**Tech Stack:** wie Plan 2 (React 18, Vite 6, Vitest 3, Testing Library, playwright-core + Edge, `@anthropic-ai/sdk`, Moodle-MCP der Box, PHP im Container `ki-kurs-moodle`, `sharp`, `marked`).

**Spec:** `docs/specs/2026-09-04-code-welt-plan3-nachtrag.md` (Entscheidungen 13–22, Bogen, Datenmodell, Welt-Maße, Editor-Prüfpunkte, DoD). Hauptspec `docs/specs/2026-09-02-code-welt-minecraft-kurs-design.md`, Plan-2-Nachtrag `docs/specs/2026-09-03-code-welt-plan2-nachtrag.md` gelten weiter.

## Global Constraints

- Repo `C:\Users\mail\entwicklung\code-welt`, Branch `main`. Vor jedem Commit `git branch --show-current`. Nur die eigenen Dateien stagen (`git add <pfade>`, nie `-A`).
- Sprachen `de, en, uk, ar, es, it`; `de` kanonisch; Stütz-Ebene `src/i18n/de.js` wird übersetzt, Leit-Ebene `src/content/de.js` nie.
- Einfache Sprache A2–B1 in allen deutschen Lerntexten: Sätze bis 12 Wörter, Präsens, du, ein Gedanke pro Satz, Code-Wörter unverändert.
- Zauberwörter (Chat-Kommandos) nie übersetzen, nie großschreiben: `hi hallo weg turm mauer wand haus bruecke plattform treppe`. Bezeichner `laenge stufen index pos fill` bleiben in Prosa aller Sprachen unverändert.
- Story-Figuren: Nour (erklärt, ermutigt), Dani (fragt, macht typische Fehler, feiert); jede Story-Zeile trägt `mood` aus `erklaerend | fragend | begeistert | nachdenklich | ueberrascht`. Der Agent spricht nie.
- Python-Beispiele folgen der MakeCode-Python-API (`player.on_chat`, `agent.teleport_to_player`, `agent.set_item`, `agent.move(FORWARD|BACK|UP|DOWN, n)`, `agent.place(DIR)`, `blocks.fill(block, pos(x, y, z), pos(x, y, z), FillOperation.REPLACE)`, `for index in range(n):`), sind als **Entwurf** markiert (Kommentar wie in `stations.js` s01–s06) und werden von Dirk im Browser-Editor gegengeprüft (Nachtrag Abschnitt 5).
- Ecken-Regel aus Plan 2 gilt für Agent-Bauten weiter: „Nach dem Drehen legt der Agent zuerst den Eck-Block." In Eisen dreht der Agent nicht; die Regel ist hier nur für Remix-Ideen relevant.
- Block-Ansicht: Farben und Labels aus `src/lib/blocks.js`; Blocktext Monospace 600 12pt; Dropdown-Pille dunkel, freie Zahl/Text weiß, Variable rot (`variables`), Rechenausdruck in `math`.
- Multilang in Moodle: sechs `{mlang}`-Blöcke plus `{mlang other}`; HTML-Felder mit `toEntities`, Klartextnamen mit echten Umlauten und ≤ 255 Zeichen (Guard `moodle/lib/limits.mjs`); Quizfragen mit `fraction` 0–1.
- Bauskript idempotent (Register `moodle/registry.json[box]`); nach einem Rebuild `bash moodle/apply-completion.sh`, dann `npm run moodle:postbuild`. Box immer mit beiden Compose-Dateien starten.
- Kostenpflichtige Läufe nur mit Kostenanzeige; Übersetzung Deckel **3 USD**, Protokoll in `C:\Users\mail\entwicklung\docker\_assets\media-factory\cost-log.jsonl` (`generator: "translate"`, `project: "code-welt"`). `ANTHROPIC_API_KEY`/`GOOGLE_API_KEY` nie ausgeben, nie committen.
- Tests grün vor jedem Commit (`npm test`); Commit-Trailer:
  ```
  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_012kXnMiLuDz6YFsehfiupdK
  ```
- Kein Deploy, kein Produktions-Moodle (`moodle`-MCP). Die Box (`moodle-box`, Kurs 10) ist frei.
- Parallelität: Task 1 zuerst. Tasks 2–4 nacheinander (alle ändern `StationView.jsx`, `styles.css`, die sechs `ui`-Bündel). Tasks 5–6 und 8 können parallel zu 2–4 laufen (disjunkte Dateien). Task 7 nach 5–6. Task 9 nach 2–6. Task 10 nach 2–7. Task 11 zuletzt.

---

## Dateistruktur

| Datei | Verantwortung |
|---|---|
| `src/lib/blocks.js` | + `CATEGORY_COLORS.math`, `fill`-Slot `op`, `slotText` für Variable/Minus/pos, `blocksToProgram(tree, out, vars)` mit Variablen |
| `src/components/BlockView.jsx` | + Pillen-Varianten: Variable (rot), Minus-Ausdruck (math), pos (weiß, `~x ~y ~z`) |
| `src/components/MatchBlocksPython.jsx` | Zuordnung Block ↔ Python-Zeile (Klick-Paare) |
| `src/components/FillCode.jsx` | Lückencode mit Chips |
| `src/components/FindBug.jsx` | Fehlersuche (eine Zeile ist falsch) |
| `src/components/StationView.jsx` | + Dispatch `match`, `fill`, `findbug`; reicht `explain` durch |
| `src/styles.css` | + Klassen `.match-*`, `.gap`, `.chip`, `.findbug-list` |
| `src/data/stations.js` | + `ETAPPEN[eisen].stations`, Stationen s07–s09 mit `blocks`, `exercises`, `bossCheck` (s09) |
| `src/content/de.js` | + Story/Konzept/Tipps s07–s09 |
| `src/i18n/{de,en,uk,ar,es,it}.js` | + `ui`-Schlüssel der drei Übungstypen (Task 2–4 von Hand in allen sechs), Stationen s07–s09, Glossar +4, Badge Eisen (Task 9 übersetzt) |
| `src/assets/badges/eisen.svg` | Badge-Icon Eisen (200×200, Eisenbarren) |
| `content/lehrkraft/{00-setup,01-welt-ankunft,ds07,ds08,ds09}.md` | Setup-Absatz Koordinaten, Bauplan Erkundungsgebiet, Stundenverläufe |
| `scripts/minecraft/welt-ankunft-bau.py` | + Chat-Befehl `erkunden` (Fluss, Schlucht, zwei Klippen, Goldmarken) |
| `scripts/lib/translate-chunks.mjs` | `hashChunk`, `selectChunks` (Chunk-Cache) |
| `scripts/translate.mjs` | + Chunk-Cache, `MAGIC_WORDS` erweitert, `IDENT_CANON`, Kostenzeile |
| `scripts/smoke.mjs` | + Übungen je Station vorhanden |
| `moodle/smoke-box.mjs` | + Reihenfolge Abschnitt 4, drei Badges |
| `moodle/smoke-learner.mjs` | + `BOSS_TEXT.eisen` |
| `tests/blockview.test.jsx`, `tests/blocks.test.js` | Block-Ansicht-Erweiterungen |
| `tests/match-component.test.jsx`, `tests/fill-component.test.jsx`, `tests/findbug-component.test.jsx` | Komponententests |
| `tests/blocks-consistency.test.js` | + `setVar`, `fill` |
| `tests/content.test.js` | + Übungstypen `match`/`fill`/`findbug` mit Formregeln |
| `tests/course-def.test.js` | + Abschnitt 4 Eisen, Boss-Check Eisen |
| `tests/i18n-complete.test.js` | + Zauberwörter `plattform`, `treppe`; Bezeichner-Test |
| `tests/glossary-terms.test.js` | + vier neue Begriffe es/uk |
| `tests/translate-chunks.test.js` | Chunk-Cache |
| `tests/lehrkraft-pages.test.js` | Lehrkraft-Seiten DS 7–9 werden gerendert |

---

### Task 1: Block-Ansicht — Variable, Minus-Ausdruck, pos-Pille, Operator-Slot

**Files:**
- Modify: `src/lib/blocks.js` (`CATEGORY_COLORS`, `BLOCK_SPECS.fill`, `slotText`, `blocksToProgram`)
- Modify: `src/components/BlockView.jsx` (Pillen-Varianten)
- Test: `tests/blocks.test.js`, `tests/blockview.test.jsx`

**Interfaces:**
- Consumes: `BLOCK_SPECS`, `CATEGORY_COLORS`, `slotText`, `blocksToProgram` aus `src/lib/blocks.js`.
- Produces (später von Task 5–6 als Daten genutzt):
  - Zahlen-Slot (`kind: 'number'`) akzeptiert `number | string | { minus: [string, number] }`. String = Variablenname → rote Pille; `{ minus }` → Pille in `math`-Farbe mit Text `stufen - 1`.
  - Positions-Slot (`kind: 'pos'`) mit Wert `{ pos: [x, y, z] }`, jedes Element `number | string`; Anzeige `~0 ~-1 ~1` (Variable erscheint als Name: `~index ~0 ~1`).
  - `BLOCK_SPECS.fill.label = ['fill with', {slot:'block',kind:'dropdown'}, 'from', {slot:'from',kind:'pos'}, 'to', {slot:'to',kind:'pos'}, {slot:'op',kind:'dropdown'}]`, `op` Default `replace`.
  - `CATEGORY_COLORS.math = { fill: '#712672', stroke: '#4f1a4f', slot: '#4f1a4f' }` (pxt-Standard für Math; Dirk vergleicht im Editor, Nachtrag Abschnitt 5).
  - `blocksToProgram(tree, out = [], vars = {})`: `setVar` schreibt `vars[varName] = value`; Zähler von `repeat.n`/`for.to` werden mit `resolveCount(v, vars)` aufgelöst (Zahl → Zahl, String → `vars[name]`, `{ minus: [name, k] }` → `vars[name] - k`; unbekannte Variable wirft `Error('Unbekannte Variable: <name>')`).

- [ ] **Step 1: Failing tests für `slotText` und `blocksToProgram`** in `tests/blocks.test.js` anhängen:

```js
import { slotText, blocksToProgram, BLOCK_SPECS, CATEGORY_COLORS } from '../src/lib/blocks.js';

test('slotText zeigt Variable, Minus-Ausdruck und Position im Editor-Wortlaut', () => {
  expect(slotText({ kind: 'agent.move', dir: 'forward', n: 'laenge' }, { slot: 'n', kind: 'number' })).toBe('laenge');
  expect(slotText({ kind: 'for', varName: 'index', to: { minus: ['stufen', 1] } }, { slot: 'to', kind: 'number' })).toBe('stufen - 1');
  expect(slotText({ kind: 'fill', from: { pos: [0, -1, 1] } }, { slot: 'from', kind: 'pos' })).toBe('~0 ~-1 ~1');
  expect(slotText({ kind: 'fill', to: { pos: ['index', 'index', 3] } }, { slot: 'to', kind: 'pos' })).toBe('~index ~index ~3');
  expect(slotText({ kind: 'fill', op: 'replace' }, { slot: 'op', kind: 'dropdown' })).toBe('replace');
});

test('fill hat einen Operator-Slot, math hat eine Farbe', () => {
  expect(BLOCK_SPECS.fill.label.some((p) => typeof p === 'object' && p.slot === 'op')).toBe(true);
  expect(CATEGORY_COLORS.math.fill).toMatch(/^#[0-9a-f]{6}$/i);
});

test('blocksToProgram loest Variablen aus setVar auf (Bruecke: laenge = 5 → fuenf Schritte)', () => {
  const tree = [{ kind: 'onChat', word: 'bruecke', body: [
    { kind: 'setVar', varName: 'laenge', value: 5 },
    { kind: 'repeat', n: 'laenge', body: [{ kind: 'agent.move', dir: 'forward', n: 1 }, { kind: 'agent.place', dir: 'down' }] },
  ] }];
  expect(blocksToProgram(tree)).toEqual(['forward 1', 'forward 1', 'forward 1', 'forward 1', 'forward 1']);
});

test('blocksToProgram versteht for … to stufen - 1', () => {
  const tree = [{ kind: 'setVar', varName: 'stufen', value: 3 }, { kind: 'for', varName: 'index', to: { minus: ['stufen', 1] }, body: [{ kind: 'agent.move', dir: 'forward', n: 1 }] }];
  expect(blocksToProgram(tree)).toEqual(['forward 1', 'forward 1', 'forward 1']);
});

test('blocksToProgram wirft bei unbekannter Variable', () => {
  expect(() => blocksToProgram([{ kind: 'repeat', n: 'nix', body: [] }])).toThrow(/Unbekannte Variable: nix/);
});
```

- [ ] **Step 2: Failing tests für die Pillen** in `tests/blockview.test.jsx` anhängen:

```js
test('Variable im Zahlen-Slot ist eine rote Pille, Minus-Ausdruck eine math-Pille, pos eine weisse Pille mit Tilden', () => {
  const tree = [{ kind: 'onChat', word: 'treppe', body: [
    { kind: 'setVar', varName: 'stufen', value: 6 },
    { kind: 'for', varName: 'index', to: { minus: ['stufen', 1] }, body: [
      { kind: 'fill', block: 'cobblestone', from: { pos: ['index', 0, 1] }, to: { pos: ['index', 'index', 3] }, op: 'replace' },
    ] },
  ] }];
  const { container } = render(<BlockView blocks={tree} />);
  const forRow = container.querySelector('[data-kind="for"]');
  expect(forRow.querySelector('[data-slot="to"] rect').getAttribute('fill')).toBe('#712672');
  expect(forRow.querySelector('[data-slot="to"] text').textContent).toBe('stufen - 1');
  const fillRow = container.querySelector('[data-kind="fill"]');
  expect(fillRow.querySelector('[data-slot="from"] rect').getAttribute('fill')).toBe('#fff');
  expect(fillRow.querySelector('[data-slot="from"] text').textContent).toBe('~index ~0 ~1');
  expect(fillRow.querySelector('[data-slot="op"] text').textContent).toBe('replace');
  const moveVar = render(<BlockView blocks={[{ kind: 'agent.move', dir: 'forward', n: 'laenge' }]} />).container;
  expect(moveVar.querySelector('[data-slot="n"] rect').getAttribute('fill')).toBe('#ea2b1f');
  expect(moveVar.querySelector('[data-slot="n"] text').textContent).toBe('laenge');
});

test('ein einzelner Statement-Block ohne Hut wird gezeichnet (Zuordnungs-Uebung)', () => {
  const { container } = render(<BlockView blocks={[{ kind: 'setVar', varName: 'laenge', value: 5 }]} />);
  expect(container.querySelectorAll('[data-kind]')).toHaveLength(1);
  expect(container.querySelector('[data-kind="setVar"] path')).not.toBeNull();
  expect(container.textContent).toMatch(/set/);
});
```

- [ ] **Step 3: Rot sehen** — `npx vitest run tests/blocks.test.js tests/blockview.test.jsx`. Erwartet: die neuen Tests scheitern (`slotText` liefert `[object Object]`, `blocksToProgram` entrollt `'laenge'` 0-mal bzw. wirft nicht, `CATEGORY_COLORS.math` fehlt). Der Einzelblock-Test darf schon grün sein (Layout kennt Statement-Rows) — dann bleibt er als Regressionsschutz.

- [ ] **Step 4: `src/lib/blocks.js` erweitern**

```js
// in CATEGORY_COLORS ergaenzen (pxt-Standardfarbe fuer Math; Editor-Vergleich durch Dirk):
  math:      { fill: '#712672', stroke: '#4f1a4f', slot: '#4f1a4f' },

// BLOCK_SPECS.fill ersetzen:
  fill: { cat: 'blocks', label: ['fill with', { slot: 'block', kind: 'dropdown' }, 'from', { slot: 'from', kind: 'pos' }, 'to', { slot: 'to', kind: 'pos' }, { slot: 'op', kind: 'dropdown' }] },

// slotText ersetzen:
export function slotText(b, slot) {
  const v = b[slot.slot];
  if (slot.slot === 'word' || slot.slot === 'name') return `"${v}"`;
  if (slot.slot === 'op') return String(v ?? 'replace');
  if (v && typeof v === 'object' && Array.isArray(v.minus)) return `${v.minus[0]} - ${v.minus[1]}`;
  if (v && typeof v === 'object' && Array.isArray(v.pos)) return v.pos.map((c) => `~${c}`).join(' ');
  return String(v ?? '');
}

// Art der Pille, aus dem Wert abgeleitet (BlockView faerbt danach):
//   'var'  Variablenname in einem Zahlen-Slot, 'math' Minus-Ausdruck, 'pos' Position,
//   'dropdown'/'number'/'text'/'var' sonst wie im Spec.
export function slotKind(b, slot) {
  const v = b[slot.slot];
  if (slot.kind === 'pos') return 'pos';
  if (v && typeof v === 'object' && Array.isArray(v.minus)) return 'math';
  if (slot.kind === 'number' && typeof v === 'string') return 'var';
  return slot.kind;
}

// Zaehler eines Schleifenblocks: Zahl, Variablenname oder { minus: [name, k] }.
function resolveCount(v, vars) {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    if (!(v in vars)) throw new Error(`Unbekannte Variable: ${v}`);
    return vars[v];
  }
  if (v && Array.isArray(v.minus)) return resolveCount(v.minus[0], vars) - v.minus[1];
  throw new Error(`Unbekannter Zaehler: ${JSON.stringify(v)}`);
}

// blocksToProgram: Signatur (tree, out = [], vars = {}); setVar merkt sich den Wert,
// repeat/for loesen ihren Zaehler ueber resolveCount(...) auf; rekursive Aufrufe reichen vars weiter.
```

Im Rumpf von `blocksToProgram`: vor der `agent.move`-Verzweigung `if (b.kind === 'setVar') { vars[b.varName] = b.value; continue-Äquivalent (else-if-Kette) }`; `repeat`: `const n = resolveCount(b.n, vars)`; `for`: `const to = resolveCount(b.to, vars)`; alle rekursiven Aufrufe mit `(…, out, vars)`.

- [ ] **Step 5: `BlockView.jsx` Pillen** — im Slot-Zweig `slotKind(row.b, part)` statt `part.kind` verwenden:

```jsx
const kind = slotKind(row.b, part);
const dark = kind === 'dropdown';
const varSlot = kind === 'var';
const mathSlot = kind === 'math';
const fill = dark ? col.slot : varSlot ? CATEGORY_COLORS.variables.fill : mathSlot ? CATEGORY_COLORS.math.fill : '#fff';
const ink = dark || varSlot || mathSlot ? '#fff' : '#111';
```

`slotKind` importieren; `measure()` bleibt (nutzt `slotText`).

- [ ] **Step 6: Grün sehen** — `npx vitest run tests/blocks.test.js tests/blockview.test.jsx`, danach `npm test` (161 + 7 neue).

- [ ] **Step 7: Commit** `feat(blocks): variables, minus expression, pos pill and fill operator in block view`.

---

### Task 2: Übung „Zuordnung Blöcke ↔ Python" (`MatchBlocksPython`)

**Files:**
- Create: `src/components/MatchBlocksPython.jsx`
- Modify: `src/components/StationView.jsx:60-66` (Dispatch + `explain`-Props), `src/styles.css`, `src/i18n/{de,en,uk,ar,es,it}.js` (`ui`)
- Test: `tests/match-component.test.jsx`

**Interfaces:**
- Consumes: `BlockView` (Task 1), `shuffleDeterministic` aus `src/lib/parsons.js`, `Support`.
- Produces: `MatchBlocksPython({ exercise, prompt, supportPrompt, ui, showSupport, seed = 7 })` mit `exercise = { type: 'match', pairs: [{ block, python }] }`; Wurzel `<section className="exercise match" data-testid="match">`; Block-Buttons `data-testid="match-block-<i>"`, Zeilen-Buttons `data-testid="match-line-<originalIndex>"`; Prüfen-Button `data-testid="match-check"`; Ergebnis `<p role="status">`.
- Neue `ui`-Schlüssel in **allen sechs** Bündeln (Handübersetzung mit Vermerk `// Handübersetzung 04.09.2026 (Plan 3 Task 2), Task 9 ersetzt sie`): `checkButton` („Prüfen"), `matchPrompt` („Welcher Block gehört zu welcher Zeile? Klick erst den Block, dann die Zeile."), `matchRight` („Richtig! Jeder Block hat seine Zeile."), `matchWrong` („Noch nicht. Schau auf die Zahlen und Namen in den Blöcken."). Englisch: „Check", „Which block matches which line? Click the block first, then the line.", „Correct! Every block has its line.", „Not yet. Look at the numbers and names in the blocks." — uk/ar/es/it sinngemäß, kurz.
- `StationView`: `props` bekommt zusätzlich `explain: t.exercises[i].explain, supportExplain: st?.exercises?.[i]?.explain`; Dispatch-Zeile `if (ex.type === 'match') return <MatchBlocksPython key={`${id}-${i}`} {...props} />;`.

- [ ] **Step 1: Failing test** `tests/match-component.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import MatchBlocksPython from '../src/components/MatchBlocksPython.jsx';

const ui = { matchPrompt: 'Welcher Block gehört zu welcher Zeile?', checkButton: 'Prüfen', matchRight: 'Richtig!', matchWrong: 'Noch nicht.' };
const exercise = { type: 'match', pairs: [
  { block: { kind: 'setVar', varName: 'laenge', value: 5 }, python: 'laenge = 5' },
  { block: { kind: 'repeat', n: 'laenge', body: [] }, python: 'for index in range(laenge):' },
  { block: { kind: 'agent.place', dir: 'down' }, python: 'agent.place(DOWN)' },
] };

function setup() {
  return render(<MatchBlocksPython exercise={exercise} prompt="Ordne zu." ui={ui} showSupport={false} seed={7} />);
}

test('zeigt jeden Block als SVG und jede Python-Zeile gemischt, aber vollstaendig', () => {
  setup();
  expect(screen.getAllByTestId(/^match-block-/)).toHaveLength(3);
  const lines = screen.getAllByTestId(/^match-line-/).map((el) => el.textContent);
  expect(lines.sort()).toEqual(['agent.place(DOWN)', 'for index in range(laenge):', 'laenge = 5']);
  expect(document.querySelectorAll('[data-kind="setVar"]')).toHaveLength(1);
});

test('richtige Paare → matchRight, ein falsches Paar → matchWrong', () => {
  setup();
  for (let i = 0; i < 3; i++) {
    fireEvent.click(screen.getByTestId(`match-block-${i}`));
    fireEvent.click(screen.getByTestId(`match-line-${i}`));
  }
  fireEvent.click(screen.getByTestId('match-check'));
  expect(screen.getByRole('status').textContent).toBe('Richtig!');
  // Paar 0 umbiegen: Block 0 → Zeile 1
  fireEvent.click(screen.getByTestId('match-block-0'));
  fireEvent.click(screen.getByTestId('match-line-1'));
  fireEvent.click(screen.getByTestId('match-check'));
  expect(screen.getByRole('status').textContent).toBe('Noch nicht.');
});

test('eine Zeile kann nur einem Block gehoeren: neue Zuordnung loest die alte', () => {
  setup();
  fireEvent.click(screen.getByTestId('match-block-0'));
  fireEvent.click(screen.getByTestId('match-line-2'));
  fireEvent.click(screen.getByTestId('match-block-1'));
  fireEvent.click(screen.getByTestId('match-line-2'));
  expect(screen.getByTestId('match-block-0').getAttribute('data-paired')).toBe('');
  expect(screen.getByTestId('match-block-1').getAttribute('data-paired')).toBe('2');
});
```

- [ ] **Step 2: Rot sehen** — `npx vitest run tests/match-component.test.jsx` (Modul fehlt).

- [ ] **Step 3: Komponente**

```jsx
import { useState } from 'react';
import BlockView from './BlockView.jsx';
import Support from './Support.jsx';
import { shuffleDeterministic } from '../lib/parsons.js';

// Zuordnung Block ↔ Python-Zeile. Links die Bloecke in Datenreihenfolge, rechts die Zeilen
// deterministisch gemischt (gleicher Seed wie Parsons: Snapshot-stabil). Ein Paar entsteht durch
// Klick auf Block, dann Zeile; eine Zeile gehoert immer nur einem Block.
export default function MatchBlocksPython({ exercise, prompt, supportPrompt, ui, showSupport, seed = 7 }) {
  const pairs = exercise.pairs;
  const [order] = useState(() => shuffleDeterministic(pairs.map((_, i) => i), seed));
  const [selected, setSelected] = useState(null);      // Index des angeklickten Blocks
  const [assign, setAssign] = useState({});            // blockIndex -> lineIndex (Original)
  const [result, setResult] = useState(null);

  const pick = (blockIdx) => { setSelected(blockIdx); setResult(null); };
  const drop = (lineIdx) => {
    if (selected === null) return;
    const next = {};
    for (const [b, l] of Object.entries(assign)) if (l !== lineIdx) next[b] = l;
    next[selected] = lineIdx;
    setAssign(next); setSelected(null); setResult(null);
  };
  const check = () => setResult(pairs.every((_, i) => assign[i] === i));

  return (
    <section className="exercise match" data-testid="match">
      <p className="prompt">{ui.matchPrompt}</p>
      <p>{prompt}</p>
      <Support show={showSupport}>{supportPrompt}</Support>
      <div className="match-cols">
        <div className="match-blocks">
          {pairs.map((p, i) => (
            <button type="button" key={i} className={`match-block${selected === i ? ' selected' : ''}${assign[i] !== undefined ? ' paired' : ''}`}
              data-testid={`match-block-${i}`} data-paired={assign[i] !== undefined ? String(assign[i]) : ''} onClick={() => pick(i)}>
              <BlockView blocks={[p.block]} />
              {assign[i] !== undefined && <span className="match-badge">{order.indexOf(assign[i]) + 1}</span>}
            </button>
          ))}
        </div>
        <ol className="match-lines">
          {order.map((lineIdx, n) => (
            <li key={lineIdx}>
              <button type="button" className={`match-line${Object.values(assign).includes(lineIdx) ? ' paired' : ''}`}
                data-testid={`match-line-${lineIdx}`} onClick={() => drop(lineIdx)}>
                <span className="match-num">{n + 1}</span><code>{pairs[lineIdx].python}</code>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <button type="button" className="btn" data-testid="match-check" onClick={check}>{ui.checkButton}</button>
      {result !== null && <p className={result ? 'ok' : 'nope'} role="status">{result ? ui.matchRight : ui.matchWrong}</p>}
    </section>
  );
}
```

- [ ] **Step 4: CSS** in `src/styles.css` hinter `.parsons-btns`:

```css
.match-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; direction: ltr; }
@media (max-width: 700px) { .match-cols { grid-template-columns: 1fr; } }
.match-block, .match-line { display: flex; align-items: center; gap: 8px; width: 100%; text-align: left; font: inherit; background: #fff; border: 2px solid var(--line); border-radius: 8px; padding: 6px 8px; margin: 4px 0; cursor: pointer; }
.match-block.selected { border-color: var(--accent); }
.match-block.paired, .match-line.paired { border-style: dashed; }
.match-block .blockview { max-width: 240px; }
.match-lines { list-style: none; padding: 0; margin: 0; }
.match-num, .match-badge { display: inline-block; min-width: 22px; text-align: center; border-radius: 11px; background: var(--accent); color: var(--accent-ink); font-weight: bold; }
.match-line code { white-space: pre-wrap; direction: ltr; unicode-bidi: normal; }
```

- [ ] **Step 5: StationView + ui-Schlüssel** (alle sechs Bündel; `de.js` zuerst, die anderen mit Vermerk). Dispatch:

```jsx
const props = { exercise: ex, prompt: t.exercises[i].prompt, supportPrompt: st?.exercises?.[i]?.prompt, explain: t.exercises[i].explain, supportExplain: st?.exercises?.[i]?.explain, ui, sui, showSupport: !!(support && showSupport) };
if (ex.type === 'predict') return <AgentGrid key={`${id}-${i}`} {...props} />;
if (ex.type === 'parsons') return <ParsonsPuzzle key={`${id}-${i}`} {...props} />;
if (ex.type === 'match') return <MatchBlocksPython key={`${id}-${i}`} {...props} />;
```

- [ ] **Step 6: Grün sehen** — `npx vitest run tests/match-component.test.jsx`, dann `npm test` (`i18n-complete` verlangt die neuen `ui`-Schlüssel in allen Bündeln).

- [ ] **Step 7: Commit** `feat(app): match exercise blocks vs python`.

---

### Task 3: Übung „Lückencode" (`FillCode`)

**Files:**
- Create: `src/components/FillCode.jsx`
- Modify: `src/components/StationView.jsx` (Dispatch), `src/styles.css`, `src/i18n/{de,en,uk,ar,es,it}.js` (`ui`)
- Test: `tests/fill-component.test.jsx`

**Interfaces:**
- Produces: `FillCode({ exercise, prompt, supportPrompt, ui, showSupport })` mit `exercise = { type: 'fill', code, gaps: [{ options: string[], correct: string }] }`; `code` enthält je Lücke genau ein `___` (Reihenfolge = `gaps`). Wurzel `<section className="exercise fill" data-testid="fill">`; Chips `data-testid="fill-gap-<g>-option-<o>"`; Prüfen `data-testid="fill-check"`; Ergebnis `<p role="status">`.
- `ui`-Schlüssel (alle sechs Bündel): `fillPrompt` („Wähle für jede Lücke die passende Antwort."), `fillRight` („Richtig! Der Code läuft."), `fillWrong` („Noch nicht. Eine Lücke passt nicht."). Englisch: „Choose the right answer for each gap.", „Correct! The code runs.", „Not yet. One gap does not fit."
- Dispatch: `if (ex.type === 'fill') return <FillCode key={`${id}-${i}`} {...props} />;`

- [ ] **Step 1: Failing test** `tests/fill-component.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import FillCode from '../src/components/FillCode.jsx';

const ui = { fillPrompt: 'Wähle für jede Lücke.', checkButton: 'Prüfen', fillRight: 'Richtig!', fillWrong: 'Noch nicht.' };
const exercise = { type: 'fill', code: 'stufen = ___\nfor index in range(stufen):\n    blocks.fill(COBBLESTONE, pos(index, 0, 1), pos(index, ___, 3), FillOperation.REPLACE)',
  gaps: [{ options: ['4', '6', 'index'], correct: '6' }, { options: ['0', 'index', 'stufen'], correct: 'index' }] };

test('zeigt den Code mit einer Chip-Gruppe je Luecke, Code bleibt Code', () => {
  const { container } = render(<FillCode exercise={exercise} prompt="Fülle aus." ui={ui} showSupport={false} />);
  expect(container.querySelectorAll('.gap')).toHaveLength(2);
  expect(screen.getAllByTestId(/^fill-gap-0-option-/)).toHaveLength(3);
  expect(container.querySelector('pre').textContent).toMatch(/for index in range\(stufen\):/);
  expect(container.querySelector('pre').textContent).not.toMatch(/___/);
});

test('Pruefen ohne Auswahl → fillWrong; richtige Chips → fillRight; ein falscher Chip → fillWrong', () => {
  render(<FillCode exercise={exercise} prompt="Fülle aus." ui={ui} showSupport={false} />);
  fireEvent.click(screen.getByTestId('fill-check'));
  expect(screen.getByRole('status').textContent).toBe('Noch nicht.');
  fireEvent.click(screen.getByTestId('fill-gap-0-option-1')); // '6'
  fireEvent.click(screen.getByTestId('fill-gap-1-option-1')); // 'index'
  fireEvent.click(screen.getByTestId('fill-check'));
  expect(screen.getByRole('status').textContent).toBe('Richtig!');
  fireEvent.click(screen.getByTestId('fill-gap-1-option-2')); // 'stufen'
  fireEvent.click(screen.getByTestId('fill-check'));
  expect(screen.getByRole('status').textContent).toBe('Noch nicht.');
  expect(screen.getByTestId('fill-gap-1-option-2').className).toMatch(/nope/);
});
```

- [ ] **Step 2: Rot sehen** — `npx vitest run tests/fill-component.test.jsx`.

- [ ] **Step 3: Komponente**

```jsx
import { useState } from 'react';
import Support from './Support.jsx';

// Lueckencode: der Code wird an "___" geteilt; jede Luecke ist eine Chip-Gruppe (Auswahl statt
// Tippen, A2). Nach "Pruefen" faerbt sich jeder gewaehlte Chip ok/nope; Gesamtergebnis darunter.
export default function FillCode({ exercise, prompt, supportPrompt, ui, showSupport }) {
  const parts = exercise.code.split('___');
  const [choice, setChoice] = useState(() => exercise.gaps.map(() => null));
  const [result, setResult] = useState(null);
  const choose = (g, o) => { const next = [...choice]; next[g] = o; setChoice(next); setResult(null); };
  const check = () => setResult(exercise.gaps.every((gap, g) => choice[g] !== null && gap.options[choice[g]] === gap.correct));

  return (
    <section className="exercise fill" data-testid="fill">
      <p className="prompt">{ui.fillPrompt}</p>
      <p>{prompt}</p>
      <Support show={showSupport}>{supportPrompt}</Support>
      <pre className="fill-code"><code>
        {parts.map((text, g) => (
          <span key={g}>
            {text}
            {g < exercise.gaps.length && (
              <span className="gap" role="group">
                {exercise.gaps[g].options.map((opt, o) => {
                  const picked = choice[g] === o;
                  const verdict = result === null || !picked ? '' : opt === exercise.gaps[g].correct ? ' ok' : ' nope';
                  return (
                    <button type="button" key={o} className={`chip${picked ? ' selected' : ''}${verdict}`} aria-pressed={picked}
                      data-testid={`fill-gap-${g}-option-${o}`} onClick={() => choose(g, o)}>{opt}</button>
                  );
                })}
              </span>
            )}
          </span>
        ))}
      </code></pre>
      <button type="button" className="btn" data-testid="fill-check" onClick={check}>{ui.checkButton}</button>
      {result !== null && <p className={result ? 'ok' : 'nope'} role="status">{result ? ui.fillRight : ui.fillWrong}</p>}
    </section>
  );
}
```

- [ ] **Step 4: CSS**

```css
.fill-code { direction: ltr; unicode-bidi: normal; text-align: left; white-space: pre-wrap; background: #1e1e1e; color: #eee; padding: 10px 12px; border-radius: 8px; }
.gap { display: inline-flex; gap: 4px; margin: 0 4px; vertical-align: middle; }
.chip { font: inherit; font-family: inherit; padding: 2px 8px; border-radius: 12px; border: 2px solid #888; background: #333; color: #eee; cursor: pointer; }
.chip.selected { border-color: var(--accent); background: #444; }
.chip.ok { border-color: #1f7a2e; }
.chip.nope { border-color: #9b2c2c; }
```

- [ ] **Step 5: StationView-Dispatch + `ui`-Schlüssel in sechs Bündeln.**
- [ ] **Step 6: Grün sehen** — `npx vitest run tests/fill-component.test.jsx`, dann `npm test`.
- [ ] **Step 7: Commit** `feat(app): fill-the-gap exercise with chips`.

---

### Task 4: Übung „Fehlersuche" (`FindBug`)

**Files:**
- Create: `src/components/FindBug.jsx`
- Modify: `src/components/StationView.jsx` (Dispatch), `src/styles.css`, `src/i18n/{de,en,uk,ar,es,it}.js` (`ui`)
- Test: `tests/findbug-component.test.jsx`

**Interfaces:**
- Produces: `FindBug({ exercise, prompt, supportPrompt, explain, supportExplain, ui, showSupport })` mit `exercise = { type: 'findbug', lines: string[], wrong: number }`. Wurzel `<section className="exercise findbug" data-testid="findbug">`; Zeilen-Buttons `data-testid="findbug-line-<i>"`; Prüfen `data-testid="findbug-check"`; Ergebnis `<p role="status">`; bei richtiger Wahl zusätzlich `<p className="explain" data-testid="findbug-explain">{explain}</p>` (+ `Support` mit `supportExplain`).
- `ui`-Schlüssel (alle sechs Bündel): `findbugPrompt` („Eine Zeile ist falsch. Welche?"), `findbugRight` („Richtig! Das ist der Fehler."), `findbugWrong` („Nein, diese Zeile ist richtig. Schau noch mal."). Englisch: „One line is wrong. Which one?", „Correct! That is the bug.", „No, this line is fine. Look again."
- Dispatch: `if (ex.type === 'findbug') return <FindBug key={`${id}-${i}`} {...props} />;`

- [ ] **Step 1: Failing test** `tests/findbug-component.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import FindBug from '../src/components/FindBug.jsx';

const ui = { findbugPrompt: 'Eine Zeile ist falsch.', checkButton: 'Prüfen', findbugRight: 'Richtig!', findbugWrong: 'Nein.' };
const exercise = { type: 'findbug', lines: ['stufen = 6', 'for index in range(stufen):', '    blocks.fill(COBBLESTONE, pos(index, 0, 1), pos(index, stufen, 3), FillOperation.REPLACE)'], wrong: 2 };

test('zeigt alle Zeilen als Buttons mit Einrueckung', () => {
  render(<FindBug exercise={exercise} prompt="Finde den Fehler." explain="stufen statt index." ui={ui} showSupport={false} />);
  const lines = screen.getAllByTestId(/^findbug-line-/);
  expect(lines).toHaveLength(3);
  expect(lines[2].querySelector('code').textContent).toMatch(/^ {4}blocks\.fill/);
});

test('falsche Zeile gewaehlt → findbugRight + Erklaerung; richtige Zeile gewaehlt → findbugWrong ohne Erklaerung', () => {
  render(<FindBug exercise={exercise} prompt="Finde den Fehler." explain="stufen statt index." ui={ui} showSupport={false} />);
  fireEvent.click(screen.getByTestId('findbug-line-1'));
  fireEvent.click(screen.getByTestId('findbug-check'));
  expect(screen.getByRole('status').textContent).toBe('Nein.');
  expect(screen.queryByTestId('findbug-explain')).toBeNull();
  fireEvent.click(screen.getByTestId('findbug-line-2'));
  fireEvent.click(screen.getByTestId('findbug-check'));
  expect(screen.getByRole('status').textContent).toBe('Richtig!');
  expect(screen.getByTestId('findbug-explain').textContent).toBe('stufen statt index.');
});
```

- [ ] **Step 2: Rot sehen.**
- [ ] **Step 3: Komponente**

```jsx
import { useState } from 'react';
import Support from './Support.jsx';

// Fehlersuche: genau eine Zeile ist falsch. Zeilen sind Buttons (Tastatur: Tab + Enter);
// nach "Pruefen" erscheint bei Treffer die Erklaerung (i18n stations.<sid>.exercises[i].explain).
export default function FindBug({ exercise, prompt, supportPrompt, explain, supportExplain, ui, showSupport }) {
  const [picked, setPicked] = useState(null);
  const [result, setResult] = useState(null);
  const check = () => setResult(picked === exercise.wrong);
  return (
    <section className="exercise findbug" data-testid="findbug">
      <p className="prompt">{ui.findbugPrompt}</p>
      <p>{prompt}</p>
      <Support show={showSupport}>{supportPrompt}</Support>
      <ol className="findbug-list">
        {exercise.lines.map((line, i) => (
          <li key={i}>
            <button type="button" className={`findbug-line${picked === i ? ' selected' : ''}`} aria-pressed={picked === i}
              data-testid={`findbug-line-${i}`} onClick={() => { setPicked(i); setResult(null); }}>
              <code>{line}</code>
            </button>
          </li>
        ))}
      </ol>
      <button type="button" className="btn" data-testid="findbug-check" onClick={check}>{ui.checkButton}</button>
      {result !== null && <p className={result ? 'ok' : 'nope'} role="status">{result ? ui.findbugRight : ui.findbugWrong}</p>}
      {result === true && explain && <p className="explain" data-testid="findbug-explain">{explain}</p>}
      {result === true && <Support show={showSupport}>{supportExplain}</Support>}
    </section>
  );
}
```

- [ ] **Step 4: CSS**

```css
.findbug-list { list-style: none; padding: 0; direction: ltr; text-align: left; }
.findbug-line { display: block; width: 100%; text-align: left; font: inherit; background: #fff; border: 2px solid var(--line); border-radius: 8px; padding: 6px 10px; margin: 4px 0; cursor: pointer; }
.findbug-line.selected { border-color: var(--accent); }
.findbug-line code { white-space: pre; unicode-bidi: normal; }
.explain { background: var(--bg); border-radius: 8px; padding: 8px 12px; }
```

- [ ] **Step 5: Dispatch + `ui`-Schlüssel (sechs Bündel).**
- [ ] **Step 6: Grün sehen** — Komponententest, dann `npm test`.
- [ ] **Step 7: Commit** `feat(app): find-the-bug exercise`.

---

### Task 5: Stationen DS 7 und DS 8 (Daten, Inhalt, Konsistenztest)

**Files:**
- Modify: `src/data/stations.js` (`ETAPPEN[eisen].stations`, `s07`, `s08`), `src/content/de.js`, `src/i18n/de.js` (`stations.s07`, `stations.s08`)
- Modify: `tests/blocks-consistency.test.js` (`KIND_TO_PY` + `setVar`/`fill`), `tests/content.test.js` (Übungstypen)
- Test: bestehende Inhaltstests laufen über die neuen Stationen mit

**Interfaces:**
- Consumes: Slot-Formen aus Task 1; Übungsdaten-Formen aus Task 2–4 (die Komponenten müssen für diesen Task nicht existieren — nur die Daten).
- Produces: `STATIONS.s07`, `STATIONS.s08` (Task 7, 9, 10 lesen sie); `ETAPPEN[2].stations = ['s07', 's08', 's09']` — **`s09` erst in Task 6 anlegen; bis dahin `['s07', 's08']`**, sonst bricht `content.test.js` (jede Station in ETAPPEN muss existieren).
- Register-Schlüssel, die daraus entstehen: `s07-station`, `s07-quiz`, `s08-station`, `s08-quiz` (Bauskript, automatisch).

- [ ] **Step 1: Failing tests**

`tests/blocks-consistency.test.js`: `KIND_TO_PY` um zwei Einträge erweitern — als Funktion, weil `setVar` seinen Präfix aus dem Variablennamen bezieht:

```js
const KIND_TO_PY = {
  …bestehend…,
  fill: 'blocks.fill(',
  setVar: (b) => `${b.varName} = `,
};
const prefixOf = (b) => { const p = KIND_TO_PY[b.kind]; return typeof p === 'function' ? p(b) : p; };
```

In `blockSteps` `const prefix = prefixOf(b)`; `PY_PREFIXES` muss die dynamischen Präfixe kennen: `pythonSteps` prüft deshalb zusätzlich `/^[a-z_]+ = /` (Zuweisung) als Schritt mit `py = '<name> = '`. Test dazu:

```js
test('setVar und fill werden in Reihenfolge und Tiefe mit dem Python verglichen', () => {
  const s = { blocks: [{ kind: 'onChat', word: 't', body: [{ kind: 'setVar', varName: 'stufen', value: 6 }, { kind: 'for', varName: 'index', to: { minus: ['stufen', 1] }, body: [{ kind: 'fill', block: 'cobblestone', from: { pos: [0, 0, 1] }, to: { pos: [0, 0, 3] }, op: 'replace' }] }] }],
    python: 'def on_t():\n    stufen = 6\n    for index in range(stufen):\n        blocks.fill(COBBLESTONE, pos(0, 0, 1), pos(0, 0, 3), FillOperation.REPLACE)\nplayer.on_chat("t", on_t)' };
  expect(blockOrder(s.blocks[0].body)).toEqual(['stufen = ', 'for ', 'blocks.fill(']);
  expect(pythonSteps(s.python)[0].map((x) => x.py)).toEqual(['stufen = ', 'for ', 'blocks.fill(']);
});
```

(`blockOrder` und `pythonSteps` sind Funktionen in derselben Testdatei, der neue Test ruft sie direkt auf. Die bestehende Stations-Schleife läuft ohnehin über s07/s08 mit, sobald die Daten da sind.)

`tests/content.test.js` anhängen (Importe ergänzen, falls sie fehlen: `import de from '../src/i18n/de.js';` und `import { assertKnown } from '../src/lib/blocks.js';`):

```js
test('Uebungstypen sind bekannt und formal vollstaendig', () => {
  const TYPES = ['predict', 'parsons', 'match', 'fill', 'findbug'];
  for (const [id, s] of Object.entries(STATIONS)) {
    s.exercises.forEach((ex, i) => {
      expect(TYPES, `${id}[${i}]`).toContain(ex.type);
      const t = de.stations[id].exercises[i];
      expect(typeof t.prompt, `${id}[${i}].prompt`).toBe('string');
      if (ex.type === 'match') { expect(ex.pairs.length).toBeGreaterThanOrEqual(3); for (const p of ex.pairs) { assertKnown(p.block); expect(p.python.trim().length).toBeGreaterThan(0); } }
      if (ex.type === 'fill') { expect((ex.code.match(/___/g) || []).length).toBe(ex.gaps.length); for (const g of ex.gaps) expect(g.options).toContain(g.correct); }
      if (ex.type === 'findbug') { expect(ex.wrong).toBeGreaterThanOrEqual(0); expect(ex.wrong).toBeLessThan(ex.lines.length); expect(typeof t.explain, `${id}[${i}].explain`).toBe('string'); }
    });
  }
});
```

Rot sehen: `npx vitest run tests/blocks-consistency.test.js tests/content.test.js`.

- [ ] **Step 2: Daten schreiben**

**`ETAPPEN`:** `eisen.stations = ['s07', 's08']` (Task 6 hängt `s09` an).

**DS 7 „Zahlen mit Namen" (`s07`, `iframeHeight: 5200` vorläufig, Task 11 misst):**

```js
s07: {
  etappe: 'eisen', ds: 7, iframeHeight: 5200,
  // Entwurf nach der MakeCode-Python-API; Gegenpruefung im Browser-Editor steht noch aus
  // (Nachtrag Plan 3, Abschnitt 5: place(DOWN) ueber Wasser, Variable im Handler).
  python: `def on_bruecke():
    laenge = 5
    agent.teleport_to_player()
    agent.set_item(PLANKS_OAK, 64, 1)
    for index in range(laenge):
        agent.move(FORWARD, 1)
        agent.place(DOWN)
player.on_chat("bruecke", on_bruecke)`,
  blocks: [{ kind: 'onChat', word: 'bruecke', body: [
    { kind: 'setVar', varName: 'laenge', value: 5 },
    { kind: 'agent.teleportToPlayer' },
    { kind: 'agent.setItem', block: 'planks_oak', count: 64, slot: 1 },
    { kind: 'repeat', n: 'laenge', body: [
      { kind: 'agent.move', dir: 'forward', n: 1 }, { kind: 'agent.place', dir: 'down' },
    ] },
  ] }],
  exercises: [
    { type: 'match', pairs: [
      { block: { kind: 'setVar', varName: 'laenge', value: 5 }, python: 'laenge = 5' },
      { block: { kind: 'repeat', n: 'laenge', body: [] }, python: 'for index in range(laenge):' },
      { block: { kind: 'agent.move', dir: 'forward', n: 1 }, python: 'agent.move(FORWARD, 1)' },
      { block: { kind: 'agent.place', dir: 'down' }, python: 'agent.place(DOWN)' },
    ] },
    { type: 'fill', code: 'laenge = ___\nfor index in range(laenge):\n    agent.move(FORWARD, 1)\n    agent.place(DOWN)',
      gaps: [{ options: ['5', '8', 'laenge'], correct: '8' }] },
  ],
},
```

`content/de.js` s07 — Story (Sätze ≤ 12 Wörter, jede Zeile mit `mood`): Dani (begeistert) will erkunden, nördlich liegt ein Fluss; Dani (nachdenklich) baut mit fünf `move`/`place`-Paaren, am zweiten Ufer sind es acht; Nour (erklaerend): „Gib der Zahl einen Namen. `laenge = 5`."; Dani (fragend): „Und dann?"; Nour (erklaerend): die Schleife nutzt `laenge`, du änderst nur eine Zeile; Nour (begeistert): „Schalte oben auf Python. Da siehst du die Zeile."; Dani (ueberrascht): „Python sieht fast aus wie die Blöcke!" Konzept (4 Absätze): Variable = Zahl mit Namen; einmal oben setzen, überall benutzen; `range(laenge)` zählt so oft wie `laenge`; Umschalter Blöcke/Python im Editor zeigt dasselbe Programm. Tipps (3): Frage (Wie oft baut der Agent? Schau auf `laenge`) → Richtung (Der Fluss ist 8 breit. Ändere nur eine Zeile) → Gerüst (`laenge = ___` und `for index in range(laenge):`).

`i18n/de.js` s07: `title: 'Zahlen mit Namen'`, `storyShort`, `bridge: { game: 'Du tippst bruecke. Der Agent baut eine Brücke über den Fluss.', code: 'laenge steht einmal oben. Die Schleife nutzt die Zahl.' }`, `tasks`: Auftrag „Die Brücke" (Stell dich auf den Goldblock an Stelle A. Schreibe bruecke. Geh über die Brücke. Schalte oben auf Python. Finde die Zeile laenge = 5.), Noch einer „Stelle B" (Geh zum Goldblock an Stelle B. Der Fluss ist 8 breit. Ändere nur eine Zahl. Schreibe bruecke.), Remix „Deine Brücke" (Bau die Brücke aus einem anderen Block. Oder mach sie zwei Blöcke breit. Zeig es deinem Partner oder deiner Partnerin.), `tipSolution` (laenge = 8 setzen; nur diese Zeile; `range(laenge)` baut acht Paare), `exercises[0].prompt` (Ordne jeden Block seiner Python-Zeile zu.), `exercises[1].prompt` (Der Fluss an Stelle B ist 8 Blöcke breit. Welche Zahl gehört in die Lücke?), `quiz` (4 Fragen, je 3 Antworten, genau eine `correct: true`): „Was ist laenge?" (Eine Zahl mit Namen ✓ / Ein Zauberwort / Ein Block) · „Du willst die Brücke 8 lang. Was änderst du?" (Nur die Zeile laenge = 5 ✓ / Jede Zeile mit einer 5 / Das Zauberwort) · „laenge = 5. Wie oft läuft range(laenge)?" (5-mal ✓ / 4-mal / 6-mal) · „Wo siehst du dein Programm als Python?" (Mit dem Umschalter oben im Editor ✓ / Im Chat / In der Welt).

**DS 8 „Wo bin ich?" (`s08`, `iframeHeight: 5200`):**

```js
s08: {
  etappe: 'eisen', ds: 8, iframeHeight: 5200,
  // Entwurf; Gegenpruefung im Editor: FillOperation.REPLACE in Python, pos() relativ (Fuesse = 0).
  python: `def on_plattform():
    blocks.fill(PLANKS_OAK, pos(0, -1, 1), pos(4, -1, 7), FillOperation.REPLACE)
player.on_chat("plattform", on_plattform)`,
  blocks: [{ kind: 'onChat', word: 'plattform', body: [
    { kind: 'fill', block: 'planks_oak', from: { pos: [0, -1, 1] }, to: { pos: [4, -1, 7] }, op: 'replace' },
  ] }],
  exercises: [
    { type: 'match', pairs: [
      { block: { kind: 'fill', block: 'planks_oak', from: { pos: [0, -1, 1] }, to: { pos: [4, -1, 7] }, op: 'replace' }, python: 'blocks.fill(PLANKS_OAK, pos(0, -1, 1), pos(4, -1, 7), FillOperation.REPLACE)' },
      { block: { kind: 'fill', block: 'planks_oak', from: { pos: [0, 1, 1] }, to: { pos: [4, 1, 7] }, op: 'replace' }, python: 'blocks.fill(PLANKS_OAK, pos(0, 1, 1), pos(4, 1, 7), FillOperation.REPLACE)' },
      { block: { kind: 'fill', block: 'stone', from: { pos: [0, -1, 1] }, to: { pos: [4, -1, 7] }, op: 'replace' }, python: 'blocks.fill(STONE, pos(0, -1, 1), pos(4, -1, 7), FillOperation.REPLACE)' },
    ] },
    { type: 'findbug', lines: [
      'def on_plattform():',
      '    blocks.fill(PLANKS_OAK, pos(0, -1, 1), pos(4, 1, 7), FillOperation.REPLACE)',
      'player.on_chat("plattform", on_plattform)',
    ], wrong: 1 },
  ],
},
```

`content/de.js` s08 — Story: Dani (ueberrascht) steht vor der Schlucht, sieben breit, sechs tief; Dani (nachdenklich): „Eine Brücke aus Einzelblöcken dauert ewig."; Nour (erklaerend): „Schalte die Koordinaten ein. Jeder Block hat drei Zahlen: x, y, z."; Dani (fragend): „Und was ist y?"; Nour (erklaerend): y ist die Höhe, x und z die Richtung; Nour (begeistert): „`fill` füllt alles zwischen zwei Ecken. Ein Befehl."; Dani (begeistert): „Eine ganze Plattform mit einer Zeile!" Konzept: Koordinaten x/y/z (absolut, aus der Anzeige); `pos(x, y, z)` zählt von deinen Füßen aus (relativ), `-1` ist unter dir; `fill` füllt den Quader zwischen zwei Ecken; `FillOperation.REPLACE` ersetzt alles, auch Luft. Tipps: Frage (Wo ist y = -1? Unter dir oder über dir?) → Richtung (Die Plattform muss unter den Füßen liegen; die zweite Ecke ist am anderen Rand) → Gerüst (`blocks.fill(PLANKS_OAK, pos(0, -1, 1), pos(___, -1, ___), FillOperation.REPLACE)`).

`i18n/de.js` s08: `title: 'Wo bin ich?'`, `bridge: { game: 'Du liest x, y, z ab. Du tippst plattform. Die Plattform liegt über der Schlucht.', code: 'fill füllt alles zwischen zwei Ecken. pos zählt von deinen Füßen.' }`, `tasks`: Auftrag „Die Plattform" (Schalte die Koordinaten ein. Stell dich auf den Goldblock an der Schlucht. Lies x, y, z ab und schreib sie auf. Schreibe plattform. Geh über die Plattform. Schalte auf Python: Finde die zwei Ecken.), Noch einer „Breiter" (Mach die Plattform doppelt so breit. Welche Zahl änderst du?), Remix „Das Dach" (Bau ein Dach über die Plattform. Tipp: y = 2. Zeig es deinem Partner oder deiner Partnerin.), `tipSolution`, `exercises[0].prompt` (Drei fill-Blöcke, drei Zeilen. Achte auf y und auf den Block.), `exercises[1].prompt` (Die Plattform hängt über deinem Kopf. Welche Zeile ist falsch?), `exercises[1].explain` (Die zweite Ecke hat y = 1. Das ist über dir. Die Plattform muss unter deinen Füßen liegen: y = -1.), `quiz`: „Was bedeutet y?" (Die Höhe ✓ / Links und rechts / Vorne und hinten) · „Wo ist pos(0, -1, 1)?" (Ein Block unter dir, ein Block vor dir ✓ / Über dir / Weit weg) · „Was macht fill?" (Füllt alles zwischen zwei Ecken ✓ / Setzt einen Block / Bewegt den Agenten) · „Die Anzeige im Spiel zeigt x, y, z. Was sind das?" (Welt-Koordinaten, für alle gleich ✓ / Abstände von dir / Zufallszahlen).

- [ ] **Step 3: `npm test` grün**; Dev-Server (`npm run dev`, Port 3030): `#/station/s07`, `#/station/s08` prüfen (Story mit Portraits, Block-Ansicht mit roter `laenge`-Pille, pos-Pillen, Übungen sichtbar — sie funktionieren erst nach Task 2–4, wenn parallel gearbeitet wird).
- [ ] **Step 4: Commit** `feat(content): stations DS 7 and DS 8 (Eisen)`.

---

### Task 6: Station DS 9, Boss-Check Eisen, Glossar

**Files:**
- Modify: `src/data/stations.js` (`s09`, `ETAPPEN[eisen].stations` komplett), `src/content/de.js`, `src/i18n/de.js` (`stations.s09`, `etappen.eisen.badge` prüfen, `glossary` +4)
- Modify: `tests/course-def.test.js` (Abschnitt 4, Boss-Check Eisen), `tests/glossary-terms.test.js` (Schlüssel-Teilmenge bleibt grün — nur prüfen)

**Interfaces:**
- Produces: `STATIONS.s09` mit `bossCheck: { key: 'boss-eisen', gradeMax: 100 }`; `ETAPPEN[2].stations = ['s07', 's08', 's09']`; `de.glossary.variable | koordinaten | fill | zaehler` (Form wie die bestehenden Einträge: `{ term, short }` — Form aus `de.js` übernehmen); `de.stations.s09.bossCheck = { title: 'Boss-Check Eisen', subtitle: 'Die zweite Klippe', task }`.
- Register-Schlüssel: `s09-station`, `s09-quiz`, `boss-eisen`.

- [ ] **Step 1: Failing test** in `tests/course-def.test.js`:

```js
test('Abschnitt 4 Eisen: drei Stationen, drei Quizze, Boss-Check Eisen direkt nach dem Quiz von s09, Name kurz', () => {
  const eisen = def.sections.find((s) => s.num === 4);
  expect(eisen.items.map((i) => i.key)).toEqual(['s07-station', 's07-quiz', 's08-station', 's08-quiz', 's09-station', 's09-quiz', 'boss-eisen']);
  const boss = eisen.items.find((i) => i.key === 'boss-eisen');
  expect(boss.type).toBe('assignment');
  expect(boss.name).toContain('Boss-Check Eisen');
  expect(boss.name.length).toBeLessThanOrEqual(255);
  expect(boss.intro).toContain('Die zweite Klippe');
});
```

Rot sehen (`s09` fehlt).

- [ ] **Step 2: Daten**

```js
s09: {
  etappe: 'eisen', ds: 9, iframeHeight: 5200,
  bossCheck: { key: 'boss-eisen', gradeMax: 100 },
  // Entwurf; Gegenpruefung im Editor: zeigt der Block-Editor "for index from 0 to stufen - 1"?
  python: `def on_treppe():
    stufen = 6
    for index in range(stufen):
        blocks.fill(COBBLESTONE, pos(index, 0, 1), pos(index, index, 3), FillOperation.REPLACE)
player.on_chat("treppe", on_treppe)`,
  blocks: [{ kind: 'onChat', word: 'treppe', body: [
    { kind: 'setVar', varName: 'stufen', value: 6 },
    { kind: 'for', varName: 'index', to: { minus: ['stufen', 1] }, body: [
      { kind: 'fill', block: 'cobblestone', from: { pos: ['index', 0, 1] }, to: { pos: ['index', 'index', 3] }, op: 'replace' },
    ] },
  ] }],
  exercises: [
    { type: 'fill', code: 'stufen = ___\nfor index in range(stufen):\n    blocks.fill(COBBLESTONE, pos(index, 0, 1), pos(index, ___, 3), FillOperation.REPLACE)',
      gaps: [{ options: ['4', '6', 'index'], correct: '6' }, { options: ['0', 'index', 'stufen'], correct: 'index' }] },
    { type: 'findbug', lines: [
      'stufen = 6',
      'for index in range(stufen):',
      '    blocks.fill(COBBLESTONE, pos(index, 0, 1), pos(index, stufen, 3), FillOperation.REPLACE)',
    ], wrong: 2 },
  ],
},
```

`content/de.js` s09 — Story: Dani (ueberrascht) vor der Klippe, sechs hoch; Dani (nachdenklich): „Sechs Plattformen, jede eins höher? Sechs Zeilen?"; Nour (erklaerend): „Nein. Die Schleife zählt mit. `index` ist 0, dann 1, dann 2."; Dani (fragend): „Und was bringt mir index?"; Nour (erklaerend): „Nimm index als Höhe. Stufe 0 ist 1 hoch, Stufe 5 ist 6 hoch."; Nour (begeistert): „Eine Zeile, sechs Stufen."; Dani (begeistert): „Und mit stufen = 9 wird die Treppe höher!" Konzept: der Zähler `index` ist eine Variable, die die Schleife selbst ändert; `range(stufen)` gibt `index` die Werte 0 bis `stufen - 1`; `index` in `pos` benutzt: x wandert, y wächst; `stufen` oben bestimmt, wie viele Stufen. Tipps: Frage (Welche Werte hat index bei range(6)?) → Richtung (Stufe index steht bei x = index und ist index + 1 hoch; deshalb steht index in pos zweimal) → Gerüst (`blocks.fill(COBBLESTONE, pos(index, 0, 1), pos(index, ___, 3), FillOperation.REPLACE)`).

`i18n/de.js` s09: `title: 'Zählen'`, `bridge: { game: 'Du tippst treppe. Die Treppe wächst Stufe für Stufe bis zum Plateau.', code: 'index zählt 0, 1, 2 … Die Schleife nutzt index als Höhe.' }`, `tasks`: Auftrag „Die Treppe" (Stell dich auf den Goldblock vor der Klippe. Schreibe treppe. Geh die Treppe hoch. Schalte auf Python: Wo steht index zweimal?), Noch einer „Breiter" (Mach jede Stufe 5 breit. Welche Zahl änderst du?), Remix „Deine Treppe" (Bau die Treppe aus Eichenholz. Oder bau sie nach unten in die Schlucht. Zeig es deinem Partner oder deiner Partnerin.), `tipSolution` (Stufe index: von pos(index, 0, 1) bis pos(index, index, 3); stufen = 6 gibt sechs Stufen), `exercises[0].prompt` (Die Klippe ist 6 hoch. Jede Stufe ist so hoch wie ihr Zähler plus 1.), `exercises[1].prompt` (Die Treppe ist eine Wand geworden. Welche Zeile ist falsch?), `exercises[1].explain` (In pos steht stufen statt index. Dann ist jede Stufe 7 hoch. Es wird eine Wand, keine Treppe.), `bossCheck: { title: 'Boss-Check Eisen', subtitle: 'Die zweite Klippe', task: 'Stell dich auf den Goldblock vor der zweiten Klippe. Lies y unten ab. Geh die Leiter hoch und lies y oben ab. Setze stufen. Bau die Treppe. Schreib drei Sätze: Woher kommt deine Zahl? Was macht index? Was änderst du bei einer höheren Klippe?' }`, `quiz`: „Was ist index?" (Der Zähler der Schleife ✓ / Die Höhe der Klippe / Ein Zauberwort) · „range(6): welche Werte bekommt index?" (0 bis 5 ✓ / 1 bis 6 / 0 bis 6) · „Warum wird jede Stufe höher?" (index wird bei jedem Durchlauf größer ✓ / fill zählt selbst / stufen wird größer) · „Die Klippe ist 9 hoch. Was setzt du?" (stufen = 9 ✓ / index = 9 / range(8)).

`etappen.eisen.badge` in `de.js` prüfen: `{ name: 'Eisen', description: 'Du hast alle Checks der Etappe Eisen bestanden und den Boss-Check abgegeben.' }` — fehlt es, ergänzen (die fünf übersetzten Bündel bekommen es in Task 9; bis dahin von Hand mit Vermerk, sonst scheitert `i18n-complete`).

Glossar (`de.glossary`, Form der vorhandenen Einträge übernehmen): `variable` (Variable — „Eine Zahl mit Namen. Du setzt sie einmal oben."), `koordinaten` (Koordinaten — „Drei Zahlen x, y, z sagen, wo ein Block ist."), `fill` (fill — „Füllt alles zwischen zwei Ecken mit einem Block."), `zaehler` (Zähler — „Die Schleife zählt mit: index ist 0, 1, 2 …"). Die fünf übersetzten Bündel bekommen die vier Schlüssel bis Task 9 **von Hand** (kurz, mit Vermerk), damit `i18n-complete` grün bleibt; `tests/glossary-terms.test.js` bleibt unverändert grün (EXPECTED ist Teilmenge).

- [ ] **Step 3: `npm test` grün**, Dev-Server `#/station/s09` und Startseite (Etappe Eisen zeigt drei Stationen).
- [ ] **Step 4: Commit** `feat(content): station DS 9, boss check Eisen, glossary entries`.

---

### Task 7: Badge-Icon Eisen, Box-Bau, Postbuild

**Files:**
- Create: `src/assets/badges/eisen.svg`
- Modify: `moodle/badges/` (generiert), `moodle/registry.json` (durch Bau), `moodle/smoke-learner.mjs` (`BOSS_TEXT.eisen`)
- Test: `tests/postbuild.test.js` (bestehend, plus ein Fall mit drei Etappen)

**Interfaces:**
- Consumes: `ETAPPEN[eisen].badge = { key: 'badge-eisen', icon: 'eisen.png' }` (existiert), Register-Schlüssel aus Task 5–6.
- Produces: Box-Kurs 10 mit Abschnitt „Eisen" (Labels, Quizze, Aufgabe `boss-eisen`), Badge Eisen aktiv; `moodle/badges/eisen.png`.

- [ ] **Step 1: Failing test** in `tests/postbuild.test.js` — die bestehende Fake-ETAPPEN-Hilfe um eine dritte Etappe mit drei Stationen und Boss-Check erweitern; erwartet: drei Badge-Specs, Kriterien-CMIDs = `[s07-quiz, s08-quiz, s09-quiz, boss-eisen]` in dieser Reihenfolge; Etappen ohne Stationen weiterhin in `skipped`. Rot sehen, falls die Ableitung irgendwo eine Zwei-Etappen-Annahme trägt; ist der Test sofort grün, bleibt er als Regressionsschutz (im Report vermerken).
- [ ] **Step 2: `eisen.svg`** (200×200, flach, kein Text): Eisenbarren als abgeschrägter Quader in Grau-Silber (`#c9ccd1` Deckfläche, `#9da3ab` Seite, `#6f757d` Kontur), auf dunklerem Kreis wie `holz.svg`/`stein.svg` (Aufbau von dort übernehmen, nur Motiv tauschen). `node scripts/badge-icons.mjs` → `moodle/badges/eisen.png`, Exitcode 0.
- [ ] **Step 3: `BOSS_TEXT.eisen`** in `moodle/smoke-learner.mjs`: drei Sätze, sachlich passend („Ich habe y unten und oben abgelesen, die Differenz ist 4, also stufen = 4. index zählt von 0 bis 3 und ist die Höhe jeder Stufe. Bei einer höheren Klippe setze ich stufen höher, sonst ändert sich nichts.").
- [ ] **Step 4: Box bauen** (Box läuft, Dev-Server läuft): `npm run moodle:build` → Abschnitt 4 mit sieben neuen Items; zweiter Lauf: alles „unverändert"; `bash moodle/apply-completion.sh`; `npm run moodle:postbuild` zweimal (Badge Eisen angelegt, dann „unverändert"/LOCKED-Hinweis). Register-Ausgabe (CMIDs) in den Report.
- [ ] **Step 5: `npm test` grün; Commit** `feat(moodle): Eisen section in the box course, badge icon and criteria` (stagen: `src/assets/badges/eisen.svg`, `moodle/badges/eisen.png`, `moodle/registry.json`, `moodle/smoke-learner.mjs`, `tests/postbuild.test.js`).

---

### Task 8: Welt „Erkundungsgebiet", Bauskript `erkunden`, Lehrkraft-Seiten DS 7–9

**Files:**
- Modify: `content/lehrkraft/01-welt-ankunft.md` (Abschnitt „Erkundungsgebiet"), `content/lehrkraft/00-setup.md` (Absatz „Koordinaten anzeigen" vor „Kein Auto-Run"), `scripts/minecraft/welt-ankunft-bau.py`
- Create: `content/lehrkraft/ds07.md`, `ds08.md`, `ds09.md`
- Test: `tests/lehrkraft-pages.test.js` (neu)

**Interfaces:**
- Consumes: `pagesFromMarkdown(lehrkraftDir)` aus `moodle/course-def.mjs` (rendert alle `content/lehrkraft/*.md` als Seiten; Reihenfolge nach Dateiname).
- Produces: Chat-Befehl `erkunden` im Bauskript; Koordinaten der Tabelle unten sind die Autorität für Bauplan, Skript und Aufgabentexte.

**Koordinaten** (Weltachsen wie im bestehenden Bauplan: Norden = +z, Boden y=4, Füße y=5; Erkunden-Bereich ab z=10):

| Element | Quader (`world`) | Material | Goldmarke (bündig y=4) | Schild (von Hand) |
|---|---|---|---|---|
| Fluss Stelle A (5 breit) | (-12, 3, 12) → (-1, 4, 16) | WATER | (-6, 4, 11) | „DS 7 · Stelle A · bruecke · Blick nach Norden" |
| Fluss Stelle B (8 breit) | (0, 3, 12) → (11, 4, 19) | WATER | (6, 4, 11) | „DS 7 · Stelle B · 8 breit" |
| Schlucht (7 breit, 6 tief) | (-12, -1, 26) → (11, 4, 32) | AIR | (0, 4, 25) | „DS 8 · plattform · Stell dich auf das Gold" |
| Klippe 1 (6 hoch) | (-12, 5, 40) → (-3, 10, 49) | STONE | (-18, 4, 43) | „DS 9 · treppe · 6 hoch" |
| Klippe 2 (4 hoch, Boss) | (3, 5, 40) → (12, 8, 49) | STONE | (-1, 4, 43) | **kein Schild**; Leiter an der Westseite bei (2, 5–8, 47) |

Zwei Abweichungen vom Entwurf im Nachtrag, beide im Bauplan vermerken: Der Fluss ist 24 statt 20 lang (symmetrisch um x=0, Stelle A und B je 12), und die Plattform läuft von `pos(0, -1, 1)` bis `pos(4, -1, 7)` statt `(0, -1, 0)` bis `(4, -1, 8)`, damit die Goldmarke unter den Füßen stehen bleibt und die Plattform genau die Schluchtbreite (z 26…32) füllt. Der Python-Entwurf in Task 5 (s08) trägt bereits diese Werte.

Rechnung, die im Bauplan stehen muss: Brücke A — Agent startet auf der Goldmarke (z=11), fünfmal `move(FORWARD, 1)` + `place(DOWN)` legt z=12…16 auf y=4, genau die fünf Wasserblöcke; Stelle B: acht Paare, z=12…19. Plattform — `pos(0, -1, 1)` bis `pos(4, -1, 7)` von der Goldmarke (0, 4, 25) aus: y=4, z=26…32 (genau die Schlucht), x=0…4. Treppe Klippe 1 — von (-18, 4, 43): Stufe `index` bei x=-18+index, y=5…5+index, z=44…46; Stufe 5 endet auf y=10 = Plateau-Oberkante, bei x=-13 direkt neben der Klippe (x=-12). Klippe 2 — `stufen = 4` von (-1, 4, 43): Stufen x=-1…2, Oberkante y=8 = Plateau, neben x=3. Abstände: Fluss endet z=19, Schlucht beginnt z=26 (6 frei); Schlucht endet z=32, Klippen beginnen z=40 (7 frei).

- [ ] **Step 1: Failing test** `tests/lehrkraft-pages.test.js`:

```js
import { pagesFromMarkdown } from '../moodle/course-def.mjs';
import path from 'node:path';

test('Lehrkraft-Seiten DS 7-9 existieren, haben Titel und Loesungscode', () => {
  const pages = pagesFromMarkdown(path.resolve('content/lehrkraft'));
  for (const stem of ['ds07', 'ds08', 'ds09']) {
    const p = pages.find((x) => x.stem === stem);
    expect(p, stem).toBeDefined();
    expect(p.title).toMatch(/^DS [789] /);
    expect(p.html).toMatch(/<pre>/);
  }
  const welt = pages.find((x) => x.stem === '01-welt-ankunft');
  expect(welt.html).toMatch(/Erkundungsgebiet/);
  expect(welt.html).toMatch(/erkunden/);
});
```

(`pagesFromMarkdown` exportieren, falls es noch modul-lokal ist.) Rot sehen.

- [ ] **Step 2: Bauskript** — an `welt-ankunft-bau.py` anhängen (Kommentar im Kopf ergänzen: zweiter Befehl, additiv):

```python
def bau_fluss():
    # Stelle A 5 breit (z 12..16), Stelle B 8 breit (z 12..19), je 2 tief (y 3..4), zusammen x -12..11.
    blocks.fill(WATER, world(-12, 3, 12), world(-1, 4, 16), FillOperation.REPLACE)
    blocks.fill(WATER, world(0, 3, 12), world(11, 4, 19), FillOperation.REPLACE)
    blocks.place(GOLD_BLOCK, world(-6, 4, 11))
    blocks.place(GOLD_BLOCK, world(6, 4, 11))

def bau_schlucht():
    # 7 breit (z 26..32), 6 tief (y -1..4), x -12..11. Die Plattform (s08) fuellt y=4, z 26..32.
    blocks.fill(AIR, world(-12, -1, 26), world(11, 4, 32), FillOperation.REPLACE)
    blocks.place(GOLD_BLOCK, world(0, 4, 25))

def bau_klippen():
    # Klippe 1: 10x10, 6 hoch (y 5..10). Treppe (s09) von (-18, 4, 43) endet auf y=10 neben x=-12.
    blocks.fill(STONE, world(-12, 5, 40), world(-3, 10, 49), FillOperation.REPLACE)
    blocks.place(GOLD_BLOCK, world(-18, 4, 43))
    # Klippe 2 (Boss-Check): 10x10, 4 hoch (y 5..8), ohne Schild. Leiter an der Westseite von Hand.
    blocks.fill(STONE, world(3, 5, 40), world(12, 8, 49), FillOperation.REPLACE)
    blocks.place(GOLD_BLOCK, world(-1, 4, 43))

def on_erkunden():
    bau_fluss()
    bau_schlucht()
    bau_klippen()
player.on_chat("erkunden", on_erkunden)
```

Syntaxprüfung: `python -m py_compile scripts/minecraft/welt-ankunft-bau.py` (Namen wie `blocks`/`world` sind erst im Spiel definiert; `py_compile` prüft nur die Syntax).

- [ ] **Step 3: Bauplan** `01-welt-ankunft.md`: neuer Abschnitt `## Erkundungsgebiet (Etappe Eisen, ab z=10)` mit der Tabelle oben, der Rechnung, den Schildertexten, der Leiter, dem Hinweis „Befehl `erkunden` im Bauskript; additiv, auch auf einer gebauten Welt", und dem Punkt „Koordinatenanzeige der Welt einschalten (siehe Setup)". `00-setup.md`: Abschnitt `## Koordinaten anzeigen` (Welteinstellungen → Koordinaten anzeigen; genauer Menüname im Spiel prüfen, Nachtrag Abschnitt 5; vor DS 8 einschalten, am besten schon beim Export der Weltdatei).
- [ ] **Step 4: Stundenverläufe** `ds07.md`, `ds08.md`, `ds09.md` im Format von `ds04.md` (Ziel; Ablauf-Tabelle 5/10/45/20/5; Was die Lehrkraft sagt und zeigt; Typische Fehler und Hilfen; Lösungen mit vollständigem Python für Auftrag und „Noch einer"). Inhalte: DS 7 — Variable, Umschalter Blöcke/Python zeigen, typische Fehler: Zahl an der falschen Stelle geändert, `laenge` mit Tippfehler, Agent schaut nicht nach Norden; DS 8 — Koordinatenanzeige, absolut vs. relativ (Tafelbild: „Anzeige = Welt, pos = von dir aus"), `FillOperation`, typische Fehler: y-Vorzeichen, nicht auf der Goldmarke gestanden, Plattform über dem Kopf; DS 9 — Zähler an der Tafel als Tabelle (index 0…5, Höhe 1…6), typische Fehler: `stufen` statt `index` in `pos`, `range(stufen)` als „bis 6", Startpunkt neben der Klippe verfehlt; **Boss-Check-Bewertung** (drei Sätze: Zahl aus y-Differenz, Rolle von index, Übertrag auf höhere Klippe; Treppe im Spiel erreicht das Plateau).
- [ ] **Step 5: `npm test` grün; Commit** `docs(lehrkraft): exploration area, erkunden build command, lesson plans DS 7-9`.

---

### Task 9: Übersetzung Eisen mit Chunk-Cache

**Files:**
- Create: `scripts/lib/translate-chunks.mjs`, `tests/translate-chunks.test.js`
- Modify: `scripts/translate.mjs` (Cache, `MAGIC_WORDS`, `IDENT_CANON`, Kostenzeile), `src/i18n/{en,uk,ar,es,it}.js` (generiert), `tests/i18n-complete.test.js`, `tests/glossary-terms.test.js`

**Interfaces:**
- Produces: `hashChunk(data) → string` (sha256, 12 Hex, über `JSON.stringify(data)`), `selectChunks(chunks, prevHashes, force) → { todo: chunk[], keep: chunk[] }` mit `chunk = { path: string[], data }`, `prevHashes = { '<path.join(".")>': hash }`. Generierte Bündel tragen zusätzlich zu `sourceHash` eine Zeile `// chunkHashes: {"ui":"…","stations.s01":"…",…}`; beim nächsten Lauf werden nur Chunks mit geändertem Hash übersetzt, die übrigen aus dem vorhandenen Bündel übernommen (Handkorrekturen bleiben erhalten).
- Kanon: `MAGIC_WORDS = [...bestehend, 'plattform', 'treppe']`; `IDENT_CANON = ['laenge', 'stufen', 'index', 'pos', 'fill']` als Prompt-Regel 12: „Identifier from the code stay byte-identical also in prose: …"; `tests/i18n-complete.test.js` erhält denselben Bezeichner-Test wie für Zauberwörter (Wort aus `de` muss an derselben Stelle im Bündel stehen).

- [ ] **Step 1: Failing test** `tests/translate-chunks.test.js`:

```js
import { hashChunk, selectChunks } from '../scripts/lib/translate-chunks.mjs';

test('selectChunks uebersetzt nur Chunks mit geaendertem Hash, ohne prevHashes alles', () => {
  const chunks = [{ path: ['ui'], data: { a: 1 } }, { path: ['stations', 's01'], data: { t: 'x' } }, { path: ['stations', 's07'], data: { t: 'neu' } }];
  const prev = { ui: hashChunk({ a: 1 }), 'stations.s01': hashChunk({ t: 'x' }) };
  const r = selectChunks(chunks, prev, false);
  expect(r.todo.map((c) => c.path.join('.'))).toEqual(['stations.s07']);
  expect(r.keep.map((c) => c.path.join('.'))).toEqual(['ui', 'stations.s01']);
  expect(selectChunks(chunks, {}, false).todo).toHaveLength(3);
  expect(selectChunks(chunks, prev, true).todo).toHaveLength(3);
});
```

Rot sehen. Implementieren (`hashChunk` = `crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex').slice(0, 12)`). In `translate.mjs`: `chunkHashes` aus dem vorhandenen Ziel-Bündel lesen (Regex wie `readSourceHash`), `selectChunks` anwenden, `keep`-Chunks per `import()` des bestehenden Bündels übernehmen (`valueAt`-Logik wie im Test), neue `chunkHashes`-Zeile schreiben. Vor dem Lauf eine Kostenzeile drucken: `Kostenpflichtige Übersetzung: <n> Chunks × <m> Sprachen, Modell claude-opus-5, geschätzt ~$<0,12 je Chunk-Sprache>`; nach dem Lauf eine Zeile ans Kostenlog (`generator: "translate"`, `cost` aus `usage` der API-Antworten, wenn verfügbar, sonst Schätzung).

- [ ] **Step 2: Kanon** — `MAGIC_WORDS`, `IDENT_CANON`, Prompt-Regel 12; `tests/i18n-complete.test.js`: `MAGIC_WORDS` erweitern und Bezeichner-Test hinzufügen (Kopie des Zauberwort-Tests mit `IDENT_CANON`, Regex mit `\b`).
- [ ] **Step 3: Lauf** — `node scripts/translate.mjs --lang all`. Erwartet: je Sprache Chunks `ui`, `glossary`, `stations.s07`, `stations.s08`, `stations.s09` (`etappen` nur, wenn `badge`-Text geändert), `s01–s06` übernommen. Kosten im Report (Erwartung 1,2–1,6 USD, Deckel 3 USD).
- [ ] **Step 4: `npm test`** — `i18n-complete` (Schlüssel, Zauberwörter, Bezeichner, ar-Ziffern), `etappen-names`, `glossary-terms`. Scheitert ein Begriff: Handkorrektur mit Datumsvermerk, Prompt-Regel schärfen, **kein** zweiter Volllauf (Chunk-Cache erlaubt gezieltes `--force` je Sprache nur, wenn nötig).
- [ ] **Step 5: Glossar pinnen** — `tests/glossary-terms.test.js` EXPECTED für es/uk um `variable`, `koordinaten`, `fill`, `zaehler` erweitern (Werte aus dem Lauf, vom Reviewer mit Sprachkompetenz geprüft; `fill` bleibt `fill`).
- [ ] **Step 6: Stichprobe** je Sprache (Titel s07, Boss-Check-Text, eine Quizfrage s09) im Report; Commit `feat(i18n): Eisen stations in six languages, chunk cache for translate`.

---

### Task 10: Smokes erweitern (App, Box, Lernender)

**Files:**
- Modify: `scripts/smoke.mjs`, `moodle/smoke-box.mjs`, `moodle/smoke-learner.mjs`

**Interfaces:**
- Consumes: Klassen `.exercise.match`, `.exercise.fill`, `.exercise.findbug`, `.exercise.parsons` (Task 2–4), Register-Schlüssel Abschnitt 4 (Task 7), `de.etappen.eisen.badge.name`.

- [ ] **Step 1: App-Smoke** — nach dem Höhen-Check je Station: für jeden Eintrag in `STATIONS[sid].exercises` mit `type` in `['parsons', 'match', 'fill', 'findbug']` muss `.exercise.<type>` mindestens einmal vorhanden sein (`page.locator('.exercise.' + type).count() > 0`), sonst Fehler `Übung <type> fehlt`. Zusätzlich für s07: Klick-Durchlauf der Zuordnung (drei Paare in Datenreihenfolge, Prüfen, `role=status` enthält `ui.matchRight` der Sprache) — beweist, dass die Komponente im Browser funktioniert, nicht nur in jsdom.
- [ ] **Step 2: Box-Smoke** — Abschnitts-Liste `[2 Holz, 3 Stein]` um `[4, 'Eisen']` erweitern; Badge-Check: erwartete Anzahl 3, dritter Check `Badge Eisen auf Badge-Seite` mit `de.etappen.eisen.badge.name`; Boss-Check-Aufgabe Eisen auf uk (`uk.stations.s09.bossCheck.title` auf der Aufgabenseite `boss-eisen`).
- [ ] **Step 3: Lernenden-Smoke** — `npm run moodle:smoke:learner -- --etappe eisen` (Reset des Testschülers, drei Quizze mit 100 %, Boss-Abgabe, Badge Eisen verliehen ohne Override). Ausgabe in den Report.
- [ ] **Step 4: Läufe** — `npm run smoke` (54 Checks), `npm run moodle:smoke` (16 Checks) je einmal grün; Commit `test(smoke): exercises per station, Eisen section and badge, learner path eisen`.

---

### Task 11: Gesamtlauf, Höhen, Doku, Übergabe

**Files:**
- Modify: `src/data/stations.js` (`iframeHeight` s07–s09 gemessen), `README.md` (Stand, Offen), `docs/lehrkraft-probelauf.md` (Abschnitt Eisen), `docs/plans/2026-09-04-code-welt-03-eisen.md` (Statuskasten), `docs/station-s07.png` … `s09.png`, `tests/course-def.test.js` (falls eine Höhe gepinnt wird)

- [ ] **Step 1: Höhen messen** — `node scripts/measure-heights.mjs`; die Werte „empfohlen (+15 %, auf 50 gerundet)" für s07–s09 in `stations.js` eintragen, Kommentar „gemessen <Datum>"; Box neu bauen (Labels ändern sich): `npm run moodle:build` ×2 (zweiter Lauf „unverändert"), `bash moodle/apply-completion.sh`, `npm run moodle:postbuild`.
- [ ] **Step 2: Drei Läufe** — `npm run smoke` ×3, `npm run moodle:smoke` ×3, `npm run moodle:smoke:learner -- --etappe eisen` ×1 sowie `--etappe holz` ×1 (Holz unverändert), `npm test`. Ergebnisse in den Report.
- [ ] **Step 3: Screenshots** `docs/station-s07.png`–`s09.png` (900 px, de, volle Seite; Wegwerf-Skript nach dem Muster in README „Screenshots"), README-Liste ergänzen.
- [ ] **Step 4: Doku** — README „Stand": Plan 3 fertig (drei Stationen, drei Übungstypen, Boss-Check und Badge Eisen, Erkundungsgebiet, Übersetzungskosten, Chunk-Cache); „Offen für Dirk": Editor-Prüfpunkte aus Nachtrag Abschnitt 5, Welt um `erkunden` erweitern und `.mcworld` neu exportieren, Probelauf Eisen. `docs/lehrkraft-probelauf.md`: Abschnitt „Etappe Eisen" (Reset-Befehl, Reihenfolge s07→s09→Boss, worauf achten: Koordinatenanzeige, Goldmarken, Python-Umschalter). Plan-Statuskasten oben in dieser Datei („Stand: umgesetzt", Abweichungen).
- [ ] **Step 5: Commit** `docs: plan 3 wrap-up, measured heights, Eisen screenshots` und Push.

---

## Definition of Done

- Drei Stationen s07–s09 in sechs Sprachen, drei Quizze, Boss-Check Eisen als Aufgabe, Badge Eisen mit Icon; Verleihung über den echten Lernpfad nachgewiesen (`--etappe eisen`).
- `MatchBlocksPython`, `FillCode`, `FindBug` mit eigenen Tests; Block-Ansicht mit Variablen-Pille, Minus-Ausdruck, pos-Pille, Operator-Slot; Einzelblock ohne Hut durch Test belegt; Konsistenztest deckt `setVar` und `fill`.
- Bauplan-Abschnitt Erkundungsgebiet mit Koordinatentabelle und Befehl `erkunden` im Bauskript (Syntax per `py_compile`); `ds07–ds09.md`; Setup-Absatz Koordinaten.
- `iframeHeight` für s07–s09 gemessen; Bauskript zweimal idempotent; Box-Smoke (16) und App-Smoke (54) je dreimal grün; Holz und Stein unverändert (Lernenden-Pfad Holz grün).
- Übersetzung protokolliert, unter 3 USD; Chunk-Cache übernimmt s01–s06; Kanon-Tests (Zauberwörter inkl. `plattform`/`treppe`, Bezeichner) grün; Glossar-Pins um vier Begriffe erweitert.
- README, Probelauf-Doku und Plan-Statuskasten aktuell; Dirks Editor-Prüfung (Nachtrag Abschnitt 5) und Probelauf Eisen als offene Punkte benannt.
