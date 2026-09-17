# Code-Welt · Plan 4 von 6: Gold (DS 10–12) — Implementation Plan

> **Stand 17.09.2026: umgesetzt bis auf Dirks Prüfliste (siehe „Offen" unten).** Abweichungen
> gegenüber diesem Plan (Details je Task-Report, Ledger
> `.superpowers/sdd/2026-09-17-code-welt-04-gold/progress.md`): Das Bauskript setzt Goldmarken und
> Redstone-Block in der Welt selbst statt sie Dirk von Hand setzen zu lassen. Die s11-Fehlersuche
> prüft `FORWARD` statt `DOWN` (vertauschte Zweige hätten zwei falsche Zeilen ergeben, FindBug
> verlangt genau eine). Die Stapel-Schwelle der Hauptansicht liegt bei 500 px statt einer halben
> Spalte (330 hätte auch Holz und Stein verändert, was der DoD „unverändert" widerspricht). Der
> Boss-Text steht im Präsens statt im ursprünglichen Wortlaut aus Plan/Spec. `ds12.md` bekam ein
> 60/80/100-Punkteraster wie `ds09.md` (der Brief nannte nur „bestanden"). Ob der Agent über
> Löchern fällt oder schwebt, ist als offene Frage formuliert statt als Aussage, weil das nur im
> Spiel zu klären ist (Prüfliste unten, Punkt 2). Zwei Handkorrekturen nach der maschinellen
> Übersetzung statt eines teuren Chunk-Neulaufs: uk s11 „Agent" in lateinischer statt kyrillischer
> Schrift (acht Stellen, jetzt mit einem eigenen Test gegen „Агент" abgesichert), und ar s12
> Imperative statt Verbalnomen; dazu der Boss-Titel-Trenner „: " von Hand in uk/ar s09 und s12.
> Alle vier Boss-Aufgaben wurden beim letzten Box-Bau neu angelegt, weil der `ui`-Chunk
> (Tipp-Lücken-Hinweis) neu übersetzt wurde; das war erwartet, kein Fund. Das Bauskript
> `welt-ankunft-bau.py` schreibt die y-Werte des Parcours als Zahlen aus, statt sie aus `GROUND_TOP`
> zu rechnen (Spec Abschnitt 3): nur so vergleicht `tests/parcours-script.test.js` Skript und
> `parcours.json` Zeile für Zeile (Begründung im Kopf des Skripts).
> Final-Review-Fixrunde (17.09.2026, `final-fix-report.md` im Ledger): Löcher einzeln (Löcher
> 58/60/62/64, Ziel 59/61/63/67/71/73, alle Zahlen gleich), s10-Startsatz „am Anfang der Bahn Ecke"
> neu übersetzt, Prompt-Regeln für Boss-Titel-Trenner und arabische Imperative, Fehlerbilder in
> `ds10.md`/`ds11.md` per Simulator belegt, Python-Werte an die Blöcke gebunden, Enter in der
> Tipp-Lücke prüft.
>
> **Offen (DoD-Punkt, nicht erledigt):** Dirks Prüfung nach Nachtrag Plan 4, Abschnitt 5 (sieben
> Punkte: Wasser/Lava/Luft als Block, Fallverhalten über Löchern, `place(DOWN)` in ein Luftloch,
> `REDSTONE`-Erkennung Block oder Staub, Blickrichtung nach `teleport_to_player()`, `if/else` und
> `while not` im Editor, Stopp eines endlosen `while`). Die Prüfung von Plan 3 (Nachtrag Plan 3,
> Abschnitt 5) steht ebenfalls noch aus, beide Listen lassen sich in einer Sitzung abarbeiten.
> Ändert eine der beiden Prüfungen Python oder Stütztexte von s10–s12, müssen diese Chunks neu
> übersetzt werden (`npm run translate -- --lang all --chunk stations.s10,stations.s11,stations.s12`).
> Ebenfalls offen: die Welt „ankunft" um den Parcours-Befehl erweitern, Schilder setzen und neu als
> `.mcworld` exportieren, sowie der Probelauf Gold selbst.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die Etappe Gold komplett: drei Stationen (DS 10–12) in sechs Sprachen mit `if`, `if/else` und `while not`, der neue Übungstyp Tipp-Lücke, Bedingungs-Blöcke in der Block-Ansicht, ein Parcours in der Welt `ankunft` mit Simulator-Test, Boss-Check und Badge Gold, Lehrkraft-Seiten, erweiterte Smokes, bereit für Dirks Probelauf Gold in der Box.

**Architecture:** Alles baut auf Plan 1–3 auf: Stationen sind Daten in drei Dateien (`src/data/stations.js` Struktur, `src/i18n/de.js` Stütze, `src/content/de.js` Leit-Ebene); das Bauskript legt daraus den Box-Kurs an, der Postbuild die Badges. Neu sind eine Bedingungs-Pille und ein `else`-Mund in der SVG-Block-Ansicht, die Komponente `TypeGap` mit reiner Prüffunktion, gestapelte Hauptansicht für breite Blöcke, ein dritter Chat-Befehl `parcours` im Weltbauskript und ein Simulator, der die Block-Beschreibungen aus `STATIONS` auf den Bahndaten ausführt.

**Tech Stack:** wie Plan 3 (React 18, Vite 6, Vitest 3, Testing Library, playwright-core + Edge, `@anthropic-ai/sdk`, Moodle-MCP der Box, PHP im Container `ki-kurs-moodle`, `sharp`, `marked`).

**Spec:** `docs/specs/2026-09-17-code-welt-plan4-nachtrag.md` (Entscheidungen 23–32, Bogen, Datenmodell, Parcours, Prüfliste, DoD). Hauptspec `docs/specs/2026-09-02-code-welt-minecraft-kurs-design.md`, Plan-2- und Plan-3-Nachtrag gelten weiter.

## Global Constraints

- Repo `C:\Users\mail\entwicklung\code-welt`, Branch `main`. Vor jedem Commit `git branch --show-current`. Nur die eigenen Dateien stagen (`git add <pfade>`, nie `-A`).
- Sprachen `de, en, uk, ar, es, it`; `de` kanonisch; Stütz-Ebene `src/i18n/de.js` wird übersetzt, Leit-Ebene `src/content/de.js` nie.
- Einfache Sprache A2–B1 in allen deutschen Lerntexten: Sätze bis 12 Wörter, Präsens, du, ein Gedanke pro Satz, Code-Wörter unverändert.
- Zauberwörter (Chat-Kommandos) nie übersetzen, nie großschreiben: `hi hallo weg turm mauer wand haus bruecke plattform treppe ecke loecher ziel`. Bezeichner `laenge stufen index pos fill if else while not detect` bleiben in Prosa aller Sprachen unverändert.
- **Achsen (verbindlich seit 16.09.2026): +z = Süden, −z = Norden, +x = Osten, −x = Westen. Mit Blick nach Süden führt `LEFT_TURN` nach Osten.** Kein Text nennt „Norden" für +z.
- Story-Figuren: Nour (erklärt, ermutigt), Dani (fragt, macht typische Fehler, feiert); jede Story-Zeile trägt `mood` aus `erklaerend | fragend | begeistert | nachdenklich | ueberrascht`. Der Agent spricht nie.
- Python-Beispiele folgen der MakeCode-Python-API (`player.on_chat`, `agent.teleport_to_player`, `agent.set_item`, `agent.move(FORWARD, n)`, `agent.turn(LEFT_TURN)`, `agent.place(DOWN)`, `agent.detect(AgentDetection.BLOCK | AgentDetection.REDSTONE, FORWARD | DOWN)`, `for index in range(n):`, `if …:`/`else:`, `while not …:`), sind als **Entwurf** markiert (Kommentar wie in `stations.js`) und werden von Dirk im Editor geprüft (Nachtrag Abschnitt 5, offener DoD-Punkt).
- Block-Ansicht: Farben und Labels aus `src/lib/blocks.js`; Bedingungen als Sechseck (`agent.detect` in Agent-Farbe, `not` in Logik-Farbe); ungenutzter Zähler erscheint als `repeat n`.
- Alle Zahlen, die von der Bahn abhängen (Durchläufe in s10, Tipp-Lücke in s11, Endpositionen), belegt der Simulator-Test. Nie im Kopf rechnen und nur hinschreiben.
- Multilang in Moodle: sechs `{mlang}`-Blöcke plus `{mlang other}`; HTML-Felder mit `toEntities`, Klartextnamen mit echten Umlauten und ≤ 255 Zeichen (Guard `moodle/lib/limits.mjs`); Quizfragen mit `fraction` 0–1.
- Bauskript idempotent (Register `moodle/registry.json[box]`); Rebuild-Folge: `npm run moodle:build` ×2, `bash moodle/apply-completion.sh`, `bash moodle/apply-php.sh php/reset-badges.php 10` wenn Quizze neu angelegt wurden, `npm run moodle:postbuild` ×2. Box immer mit **allen drei** Compose-Dateien starten (`docker-compose.yml`, `docker-compose.code-welt.yml`, `docker-compose.tiles.yml`).
- Kostenpflichtige Läufe nur mit Kostenanzeige; Übersetzung Deckel **3 USD**, Protokoll in `C:\Users\mail\entwicklung\docker\_assets\media-factory\cost-log.jsonl` (`generator: "translate"`, `project: "code-welt"`). `ANTHROPIC_API_KEY`/`GOOGLE_API_KEY` nie ausgeben, nie committen.
- Tests grün vor jedem Commit (`npm test`); Commit-Trailer:
  ```
  Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
  ```
- Kein Deploy, kein Produktions-Moodle (`moodle`-MCP). Die Box (`moodle-box`, Kurs 10) ist frei.
- Reihenfolge: Task 1 → 2 → 3 (alle berühren Block-Ansicht/`StationView`/`styles.css`). Task 4 kann parallel zu 1–3 laufen (disjunkte Dateien). Task 5 nach 1, 2 und 4; Task 6 nach 5; Task 7 nach 6; Task 8 nach 4; Task 9 nach 2 und 6; Task 10 nach 3, 7 und 9; Task 11 zuletzt.

---

## Dateistruktur

| Datei | Verantwortung |
|---|---|
| `src/lib/blocks.js` | + Slot-Art `cond`, `condText`, `if`/`while`-Labels, `flattenBlocks` mit `elseBody`, `blocksToProgram` wirft bei Bedingungen |
| `src/components/BlockView.jsx` | + Sechseck-Bedingung (`data-cond`), `else`-Zeile (`data-else`) |
| `src/lib/typegap.js` | `judgeGap`, `judgeAll` (reine Prüflogik der Tipp-Lücke) |
| `src/components/TypeGap.jsx` | Tipp-Lücke (Eingabefeld statt Chips) |
| `src/components/StationView.jsx` | + Dispatch `type` |
| `src/components/ConceptCard.jsx` | + gestapelte Hauptansicht für breite Blöcke |
| `src/styles.css` | + `.type-gap`, `.side-by-side-stacked` |
| `scripts/minecraft/parcours.json` | Bahndaten (Füllungen und Einzelblöcke in Weltkoordinaten) — Autorität für Skript, Bauplan, Simulator |
| `scripts/minecraft/parcours-sim.mjs` | `buildWorld`, `runProgram` |
| `scripts/minecraft/welt-ankunft-bau.py` | + Chat-Befehl `parcours` |
| `src/data/stations.js` | + `ETAPPEN[gold].stations`, s10–s12 |
| `src/content/de.js`, `src/i18n/de.js` | + s10–s12, Glossar +4 |
| `src/i18n/{en,uk,ar,es,it}.js` | + `ui` der Tipp-Lücke (Task 2 von Hand), s10–s12 und Glossar (Task 9 übersetzt) |
| `src/assets/badges/gold.svg` | Badge-Icon Gold |
| `content/lehrkraft/{01-welt-ankunft,ds10,ds11,ds12}.md` | Bauplan Parcours, Stundenverläufe |
| `scripts/translate.mjs` | `MAGIC_WORDS` + 3, `IDENT_CANON` + 5 |
| `scripts/smoke.mjs`, `moodle/smoke-box.mjs`, `moodle/smoke-learner.mjs` | + `type`, Abschnitt 5, Badge Gold, `BOSS_TEXT.gold` |
| `tests/blocks.test.js`, `tests/blockview.test.jsx` | Bedingungen, `else` |
| `tests/typegap.test.js`, `tests/typegap-component.test.jsx` | Tipp-Lücke |
| `tests/conceptcard.test.jsx` | Stapeln |
| `tests/parcours-sim.test.js`, `tests/parcours-script.test.js` | Simulator, Skript-Abgleich |
| `tests/blocks-consistency.test.js` | + `if`, `else:`, `while` |
| `tests/content.test.js`, `tests/course-def.test.js`, `tests/i18n-complete.test.js`, `tests/glossary-terms.test.js`, `tests/lehrkraft-pages.test.js` | Gold-Erweiterungen |

---

### Task 1: Block-Ansicht — Bedingungen, `not`, `else`

**Files:**
- Modify: `src/lib/blocks.js`, `src/components/BlockView.jsx`
- Modify: `tests/blocks-consistency.test.js` (`if `, `else:`, `while `)
- Test: `tests/blocks.test.js`, `tests/blockview.test.jsx`

**Interfaces:**
- Consumes: `BLOCK_SPECS`, `CATEGORY_COLORS`, `slotText`, `slotKind`, `flattenBlocks`, `blocksToProgram` aus `src/lib/blocks.js`.
- Produces (Task 5/6 schreiben Daten in dieser Form; Task 4 liest sie im Simulator):
  - Bedingung: `{ kind: 'agent.detect', what: 'block' | 'redstone', dir: 'forward' | 'down' }` oder `{ not: <Bedingung> }`.
  - `{ kind: 'if', cond, body: [...], elseBody?: [...] }`, `{ kind: 'while', cond, body: [...] }`.
  - `BLOCK_SPECS.if.label = ['if', { slot: 'cond', kind: 'cond' }, 'then']`, `BLOCK_SPECS.while.label = ['while', { slot: 'cond', kind: 'cond' }, 'do']` (Wortlaut „do" im Editor prüfen, Nachtrag Abschnitt 5 Punkt 6).
  - `export function condText(cond) → string`: `agent detect block forward`, `not agent detect block forward`; unbekannte Form wirft `Error('Unbekannte Bedingung: …')`.
  - `slotText` liefert für `kind: 'cond'` `condText(v)`, `slotKind` liefert `'cond'`.
  - `flattenBlocks` läuft auch durch `elseBody` (gleiche Tiefe wie `body`).
  - `blocksToProgram` wirft bei `if`/`while` `Error('blocksToProgram kennt keine Bedingungen (<kind>)')` — die Vorhersage-Übung hat kein Weltmodell.
  - BlockView: Bedingung als `<g data-slot="cond">` mit verschachtelten `<g data-cond="agent.detect">` bzw. `<g data-cond="not">`, deren erstes Kind ein `<path>` in `CATEGORY_COLORS.agent.fill` bzw. `CATEGORY_COLORS.logic.fill` ist; `else` als `<g data-else="true">` mit Text `else`.

- [ ] **Step 1: Failing tests** in `tests/blocks.test.js` anhängen (Import um `condText`, `slotKind` ergänzen):

```js
test('condText schreibt Bedingungen im Editor-Wortlaut, not verschachtelt', () => {
  expect(condText({ kind: 'agent.detect', what: 'block', dir: 'forward' })).toBe('agent detect block forward');
  expect(condText({ not: { kind: 'agent.detect', what: 'redstone', dir: 'down' } })).toBe('not agent detect redstone down');
  expect(() => condText({ kind: 'agent.move' })).toThrow(/Unbekannte Bedingung/);
});

test('if und while haben einen cond-Slot', () => {
  const ifCond = BLOCK_SPECS.if.label.find((p) => typeof p === 'object');
  expect(ifCond).toEqual({ slot: 'cond', kind: 'cond' });
  const b = { kind: 'while', cond: { not: { kind: 'agent.detect', what: 'block', dir: 'forward' } }, body: [] };
  expect(slotText(b, { slot: 'cond', kind: 'cond' })).toBe('not agent detect block forward');
  expect(slotKind(b, { slot: 'cond', kind: 'cond' })).toBe('cond');
});

test('flattenBlocks laeuft durch elseBody auf der Tiefe des Rumpfs', () => {
  const tree = [{ kind: 'if', cond: { kind: 'agent.detect', what: 'block', dir: 'down' },
    body: [{ kind: 'agent.move', dir: 'forward', n: 1 }], elseBody: [{ kind: 'agent.place', dir: 'down' }] }];
  expect(flattenBlocks(tree).map((b) => `${b.kind}@${b.depth}`)).toEqual(['if@0', 'agent.move@1', 'agent.place@1']);
});

test('blocksToProgram wirft bei Bedingungen statt still falsch zu entrollen', () => {
  expect(() => blocksToProgram([{ kind: 'while', cond: { kind: 'agent.detect', what: 'block', dir: 'forward' }, body: [] }])).toThrow(/keine Bedingungen \(while\)/);
});
```

- [ ] **Step 2: Failing tests** in `tests/blockview.test.jsx` anhängen:

```jsx
test('if mit Bedingung und else: Sechseck in Agent-Farbe, else-Zeile, beide Rumpfbloecke', () => {
  const tree = [{ kind: 'if', cond: { kind: 'agent.detect', what: 'block', dir: 'down' },
    body: [{ kind: 'agent.move', dir: 'forward', n: 1 }], elseBody: [{ kind: 'agent.place', dir: 'down' }] }];
  const { container } = render(<BlockView blocks={tree} />);
  const cond = container.querySelector('[data-kind="if"] [data-slot="cond"] [data-cond="agent.detect"]');
  expect(cond.querySelector(':scope > path').getAttribute('fill')).toBe('#d83b01');
  expect(cond.textContent).toBe('agent detect block down');
  expect(container.querySelectorAll('[data-else="true"]')).toHaveLength(1);
  expect(container.querySelector('[data-else="true"]').textContent).toBe('else');
  expect(container.querySelector('[data-kind="agent.move"]')).not.toBeNull();
  expect(container.querySelector('[data-kind="agent.place"]')).not.toBeNull();
});

test('while not: Logik-Sechseck umschliesst die detect-Bedingung', () => {
  const tree = [{ kind: 'while', cond: { not: { kind: 'agent.detect', what: 'block', dir: 'forward' } }, body: [] }];
  const { container } = render(<BlockView blocks={tree} />);
  const not = container.querySelector('[data-slot="cond"] [data-cond="not"]');
  expect(not.querySelector(':scope > path').getAttribute('fill')).toBe('#459197');
  expect(not.querySelector('[data-cond="agent.detect"]').textContent).toBe('agent detect block forward');
});

test('die else-Zeile schiebt den else-Rumpf unter den if-Rumpf (keine Ueberlappung)', () => {
  const tree = [{ kind: 'if', cond: { kind: 'agent.detect', what: 'block', dir: 'down' },
    body: [{ kind: 'agent.move', dir: 'forward', n: 1 }], elseBody: [{ kind: 'agent.place', dir: 'down' }] }];
  const { container } = render(<BlockView blocks={tree} />);
  const yOf = (sel) => Number(container.querySelector(sel).getAttribute('transform').match(/,([\d.]+)\)/)[1]);
  expect(yOf('[data-else="true"]')).toBeGreaterThan(yOf('[data-kind="agent.move"]'));
  expect(yOf('[data-kind="agent.place"]')).toBeGreaterThan(yOf('[data-else="true"]'));
});
```

- [ ] **Step 3: Failing test** in `tests/blocks-consistency.test.js` anhängen:

```js
test('if, else: und while werden in Reihenfolge und Tiefe mit dem Python verglichen', () => {
  const s = { blocks: [{ kind: 'onChat', word: 't', body: [
    { kind: 'while', cond: { not: { kind: 'agent.detect', what: 'block', dir: 'forward' } }, body: [
      { kind: 'if', cond: { kind: 'agent.detect', what: 'block', dir: 'down' },
        body: [{ kind: 'agent.move', dir: 'forward', n: 1 }], elseBody: [{ kind: 'agent.place', dir: 'down' }] },
    ] },
  ] }],
  python: 'def on_t():\n    while not agent.detect(AgentDetection.BLOCK, FORWARD):\n        if agent.detect(AgentDetection.BLOCK, DOWN):\n            agent.move(FORWARD, 1)\n        else:\n            agent.place(DOWN)\nplayer.on_chat("t", on_t)' };
  const want = [['while ', 0], ['if ', 1], ['agent.move(', 2], ['else:', 1], ['agent.place(', 2]];
  expect(blockSteps(s.blocks[0].body).map((x) => [x.py, x.depth])).toEqual(want);
  expect(pythonSteps(s.python)[0].map((x) => [x.py, x.depth])).toEqual(want);
});
```

- [ ] **Step 4: Rot sehen** — `npx vitest run tests/blocks.test.js tests/blockview.test.jsx tests/blocks-consistency.test.js`. Erwartet: `condText` fehlt, keine `data-cond`/`data-else`-Knoten, `if `/`else:`/`while ` fehlen im Konsistenztest.

- [ ] **Step 5: `src/lib/blocks.js`**

```js
// BLOCK_SPECS: while und if ersetzen
  while:                   { cat: 'loops', c: true, label: ['while', { slot: 'cond', kind: 'cond' }, 'do'] },
  if:                      { cat: 'logic', c: true, label: ['if', { slot: 'cond', kind: 'cond' }, 'then'] },

// Bedingung im Editor-Wortlaut (Nachtrag Plan 4, Entscheidung 27). Die Dropdown-Werte stehen
// klein wie im Blocks-Editor ("block", "forward"), im Python gross (BLOCK, FORWARD).
export function condText(c) {
  if (c && c.not) return `not ${condText(c.not)}`;
  if (c && c.kind === 'agent.detect') return `agent detect ${c.what} ${c.dir}`;
  throw new Error(`Unbekannte Bedingung: ${JSON.stringify(c)}`);
}

export function flattenBlocks(tree, depth = 0, out = []) {
  for (const b of tree) {
    assertKnown(b);
    out.push({ kind: b.kind, depth });
    if (b.body) flattenBlocks(b.body, depth + 1, out);
    if (b.elseBody) flattenBlocks(b.elseBody, depth + 1, out);
  }
  return out;
}
```

In `blocksToProgram` als erste Verzweigung: `if (b.kind === 'if' || b.kind === 'while') throw new Error(\`blocksToProgram kennt keine Bedingungen (${b.kind})\`);`. In `slotText` als erste Zeile nach `const v`: `if (slot.kind === 'cond') return condText(v);`. In `slotKind` als erste Zeile nach `const v`: `if (slot.kind === 'cond') return 'cond';`.

- [ ] **Step 6: `src/components/BlockView.jsx`**

```jsx
import { BLOCK_SPECS, CATEGORY_COLORS, slotText, slotKind, assertKnown } from '../lib/blocks.js';

const COND_H = ROW - 8;

// Sechseck wie die Boolean-Bloecke im Editor: Spitzen links und rechts.
function hexPath(w, h) {
  return `M${h / 2},0 h${w - h} l${h / 2},${h / 2} l-${h / 2},${h / 2} h-${w - h} l-${h / 2},-${h / 2} z`;
}

function condWidth(c) {
  if (c.not) return 'not'.length * CH + 12 + condWidth(c.not) + COND_H / 2;
  return `agent detect ${c.what} ${c.dir}`.length * CH + COND_H;
}

function Cond({ c, h = COND_H }) {
  const w = condWidth(c);
  if (c.not) {
    const col = CATEGORY_COLORS.logic;
    return (
      <g data-cond="not">
        <path d={hexPath(w, h)} fill={col.fill} stroke={col.stroke} strokeWidth="1.5" />
        <text x={h / 2} y={h / 2 + 4} fill="#fff">not</text>
        <g transform={`translate(${h / 2 + 3 * CH + 8},2)`}><Cond c={c.not} h={h - 4} /></g>
      </g>
    );
  }
  const col = CATEGORY_COLORS.agent;
  return (
    <g data-cond="agent.detect">
      <path d={hexPath(w, h)} fill={col.fill} stroke={col.stroke} strokeWidth="1.5" />
      <text x={h / 2} y={h / 2 + 4} fill="#fff">{`agent detect ${c.what} ${c.dir}`}</text>
    </g>
  );
}
```

`measure()`: für `part.kind === 'cond'` statt der Textbreite `condWidth(b[part.slot]) + 8` addieren. `layout()`: nach dem Rumpf eines C-Blocks

```js
if (b.elseBody) {
  rows.push({ b, spec, depth, y, w: 60, elseRow: true });
  y += ROW;
  y = layout(b.elseBody, depth + 1, y, rows).y;
}
```

Render: vor dem `row.foot`-Zweig

```jsx
if (row.elseRow) return (
  <g key={i} data-else="true" transform={`translate(${x},${row.y})`}>
    <path d={`M0,0 h${row.w} v${ROW - 4} h-${row.w} z`} fill={col.fill} stroke={col.stroke} strokeWidth="2" />
    <text x={PAD} y={ROW / 2 + 4} fill="#fff">else</text>
  </g>
);
```

Im Slot-Zweig vor der Pillen-Logik:

```jsx
if (part.kind === 'cond') {
  const cond = row.b[part.slot];
  const el = <g key={j} data-slot="cond" transform={`translate(${cx},4)`}><Cond c={cond} /></g>;
  cx += condWidth(cond) + 8;
  return el;
}
```

- [ ] **Step 7: Konsistenztest** — in `tests/blocks-consistency.test.js`: `KIND_TO_PY` um `if: 'if '` und `while: 'while '` ergänzen; `const PY_PREFIXES = [...new Set([...Object.values(KIND_TO_PY).filter((p) => typeof p === 'string'), 'else:'])];`; in `blockSteps` nach dem Rumpf-Aufruf

```js
if (b.elseBody) { out.push({ py: 'else:', depth }); blockSteps(b.elseBody, depth + 1, out); }
```

(`else:` liegt auf der Tiefe des `if`, sein Rumpf eine Stufe tiefer — genau wie die Python-Einrückung.)

- [ ] **Step 8: Grün sehen** — `npx vitest run tests/blocks.test.js tests/blockview.test.jsx tests/blocks-consistency.test.js`, danach `npm test` (alle 234 bestehenden bleiben grün).

- [ ] **Step 9: Commit** `feat(blocks): condition hexagons, not and else in block view` (stagen: `src/lib/blocks.js`, `src/components/BlockView.jsx`, die drei Testdateien).

---
### Task 2: Übung „Tipp-Lücke" (`TypeGap`)

**Files:**
- Create: `src/lib/typegap.js`, `src/components/TypeGap.jsx`
- Modify: `src/components/StationView.jsx` (Dispatch), `src/styles.css`, `src/i18n/{de,en,uk,ar,es,it}.js` (`ui`), `tests/content.test.js` (Typ `type` mit Formregeln)
- Test: `tests/typegap.test.js`, `tests/typegap-component.test.jsx`

**Interfaces:**
- Consumes: `Support`, Muster von `FillCode.jsx` (Code an `___` geteilt, `pre.fill-code`).
- Produces:
  - `judgeGap(input: string, accept: string[]) → 'right' | 'case' | 'wrong'`: alle Leerzeichen werden vor dem Vergleich entfernt; leere Eingabe ist `'wrong'`; stimmt die Eingabe nur ohne Groß-/Kleinschreibung, ist sie `'case'`.
  - `judgeAll(inputs: string[], gaps: {accept: string[]}[]) → { verdicts: string[], overall: 'right' | 'case' | 'wrong' }`: `right` nur, wenn alle Lücken `right`; sonst `wrong`, sobald eine Lücke `wrong` ist; sonst `case`.
  - Datenform `{ type: 'type', code: string, gaps: [{ accept: string[], hint?: 'number' }] }`, je Lücke genau ein `___` im Code.
  - `TypeGap({ exercise, prompt, supportPrompt, ui, showSupport })`; Wurzel `<section className="exercise type" data-testid="type">`; Eingaben `data-testid="type-gap-<g>"`; Prüfen `data-testid="type-check"` (gesperrt, solange alle Felder leer sind); Ergebnis `<p role="status">`.
  - `ui`-Schlüssel (alle sechs Bündel; Übungs-Feedback bleibt laut Plan-2-Entscheidung 2 in der App Deutsch, die Bündel brauchen die Schlüssel trotzdem für `i18n-complete`): `typePrompt` („Tippe in jede Lücke die richtige Zahl oder das richtige Wort."), `typeRight` („Richtig! So läuft der Code."), `typeWrong` („Noch nicht. Lies die Zeile noch einmal."), `typeCase` („Fast. Python unterscheidet groß und klein."), `typeGapLabel` („Lücke"). Englisch: „Type the right number or word into each gap.", „Correct! That is how the code runs.", „Not yet. Read the line again.", „Almost. Python tells capital and small letters apart.", „Gap". uk/ar/es/it sinngemäß, kurz, mit Vermerk `// Handübersetzung 17.09.2026 (Plan 4 Task 2), Task 9 ersetzt sie`.
  - Dispatch: `if (ex.type === 'type') return <TypeGap key={`${id}-${i}`} {...props} />;`

- [ ] **Step 1: Failing test** `tests/typegap.test.js`:

```js
import { judgeGap, judgeAll } from '../src/lib/typegap.js';

test('judgeGap: Leerzeichen zaehlen nicht, leer ist falsch', () => {
  expect(judgeGap('14', ['14'])).toBe('right');
  expect(judgeGap(' 1 4 ', ['14'])).toBe('right');
  expect(judgeGap('', ['14'])).toBe('wrong');
  expect(judgeGap('   ', ['14'])).toBe('wrong');
  expect(judgeGap('10', ['14'])).toBe('wrong');
});

test('judgeGap: falsche Gross-/Kleinschreibung ist "case", nicht richtig', () => {
  expect(judgeGap('REDSTONE', ['REDSTONE'])).toBe('right');
  expect(judgeGap('redstone', ['REDSTONE'])).toBe('case');
  expect(judgeGap('Redstone', ['REDSTONE'])).toBe('case');
  expect(judgeGap('redstne', ['REDSTONE'])).toBe('wrong');
});

test('judgeGap: jede Schreibweise aus accept zaehlt', () => {
  expect(judgeGap('agent.move(FORWARD,1)', ['agent.move(FORWARD, 1)'])).toBe('right');
  expect(judgeGap('b', ['a', 'b'])).toBe('right');
});

test('judgeAll: right nur wenn alle right; wrong schlaegt case', () => {
  const gaps = [{ accept: ['REDSTONE'] }, { accept: ['DOWN'] }];
  expect(judgeAll(['REDSTONE', 'DOWN'], gaps)).toEqual({ verdicts: ['right', 'right'], overall: 'right' });
  expect(judgeAll(['redstone', 'DOWN'], gaps)).toEqual({ verdicts: ['case', 'right'], overall: 'case' });
  expect(judgeAll(['redstone', 'UP'], gaps)).toEqual({ verdicts: ['case', 'wrong'], overall: 'wrong' });
});
```

- [ ] **Step 2: Failing test** `tests/typegap-component.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import TypeGap from '../src/components/TypeGap.jsx';

const ui = { typePrompt: 'Tippe.', typeGapLabel: 'Lücke', checkButton: 'Prüfen', typeRight: 'Richtig!', typeWrong: 'Noch nicht.', typeCase: 'Fast.' };
const exercise = { type: 'type', code: 'while not agent.detect(AgentDetection.___, ___):\n    agent.move(FORWARD, 1)',
  gaps: [{ accept: ['REDSTONE'] }, { accept: ['DOWN'] }] };

test('ein Eingabefeld je Luecke, LTR, ohne Rechtschreibhilfen; Code bleibt Code', () => {
  const { container } = render(<TypeGap exercise={exercise} prompt="Ändere die Bedingung." ui={ui} showSupport={false} />);
  const inputs = screen.getAllByTestId(/^type-gap-/);
  expect(inputs).toHaveLength(2);
  for (const el of inputs) {
    expect(el.getAttribute('dir')).toBe('ltr');
    expect(el.getAttribute('spellcheck')).toBe('false');
    expect(el.getAttribute('autocapitalize')).toBe('off');
    expect(el.getAttribute('autocomplete')).toBe('off');
  }
  expect(container.querySelector('pre').textContent).toMatch(/agent\.move\(FORWARD, 1\)/);
  expect(container.querySelector('pre').textContent).not.toMatch(/___/);
});

test('Pruefen ist gesperrt, solange nichts getippt ist', () => {
  render(<TypeGap exercise={exercise} prompt="x" ui={ui} showSupport={false} />);
  expect(screen.getByTestId('type-check').disabled).toBe(true);
  fireEvent.change(screen.getByTestId('type-gap-0'), { target: { value: 'R' } });
  expect(screen.getByTestId('type-check').disabled).toBe(false);
});

test('richtig → typeRight, klein geschrieben → typeCase, falsch → typeWrong; Tippen loescht das Ergebnis', () => {
  render(<TypeGap exercise={exercise} prompt="x" ui={ui} showSupport={false} />);
  fireEvent.change(screen.getByTestId('type-gap-0'), { target: { value: 'redstone' } });
  fireEvent.change(screen.getByTestId('type-gap-1'), { target: { value: 'DOWN' } });
  fireEvent.click(screen.getByTestId('type-check'));
  expect(screen.getByRole('status').textContent).toBe('Fast.');
  fireEvent.change(screen.getByTestId('type-gap-0'), { target: { value: 'REDSTONE' } });
  expect(screen.queryByRole('status')).toBeNull();
  fireEvent.click(screen.getByTestId('type-check'));
  expect(screen.getByRole('status').textContent).toBe('Richtig!');
  fireEvent.change(screen.getByTestId('type-gap-1'), { target: { value: 'UP' } });
  fireEvent.click(screen.getByTestId('type-check'));
  expect(screen.getByRole('status').textContent).toBe('Noch nicht.');
  expect(screen.getByTestId('type-gap-1').className).toMatch(/nope/);
});

test('hint number setzt die Zifferntastatur', () => {
  const ex = { type: 'type', code: 'for index in range(___):', gaps: [{ accept: ['14'], hint: 'number' }] };
  render(<TypeGap exercise={ex} prompt="x" ui={ui} showSupport={false} />);
  expect(screen.getByTestId('type-gap-0').getAttribute('inputmode')).toBe('numeric');
});
```

- [ ] **Step 3: Rot sehen** — `npx vitest run tests/typegap.test.js tests/typegap-component.test.jsx` (Module fehlen).

- [ ] **Step 4: `src/lib/typegap.js`**

```js
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
```

- [ ] **Step 5: `src/components/TypeGap.jsx`**

```jsx
import { useState } from 'react';
import Support from './Support.jsx';
import { judgeAll } from '../lib/typegap.js';

// Tipp-Luecke: wie der Lueckencode, aber mit Eingabefeld statt Chips (Modus "Python aendern").
// Feldbreite fest (Zahl 4, Wort 12 Zeichen), damit sie die Laenge der Antwort nicht verraet.
export default function TypeGap({ exercise, prompt, supportPrompt, ui, showSupport }) {
  const parts = exercise.code.split('___');
  const [inputs, setInputs] = useState(() => exercise.gaps.map(() => ''));
  const [result, setResult] = useState(null);
  const type = (g, value) => { const next = [...inputs]; next[g] = value; setInputs(next); setResult(null); };
  const check = () => setResult(judgeAll(inputs, exercise.gaps));
  const message = result && (result.overall === 'right' ? ui.typeRight : result.overall === 'case' ? ui.typeCase : ui.typeWrong);

  return (
    <section className="exercise type" data-testid="type">
      <p className="prompt">{ui.typePrompt}</p>
      <p>{prompt}</p>
      <Support show={showSupport}>{supportPrompt}</Support>
      <pre className="fill-code"><code>
        {parts.map((text, g) => (
          <span key={g}>
            {text}
            {g < exercise.gaps.length && (
              <input type="text" value={inputs[g]} data-testid={`type-gap-${g}`}
                className={`type-gap${result ? (result.verdicts[g] === 'right' ? ' ok' : ' nope') : ''}`}
                aria-label={`${ui.typeGapLabel} ${g + 1}`}
                size={exercise.gaps[g].hint === 'number' ? 4 : 12}
                inputMode={exercise.gaps[g].hint === 'number' ? 'numeric' : 'text'}
                dir="ltr" spellCheck={false} autoCapitalize="off" autoComplete="off" autoCorrect="off"
                onChange={(e) => type(g, e.target.value)} />
            )}
          </span>
        ))}
      </code></pre>
      <button type="button" className="btn" data-testid="type-check" onClick={check}
        disabled={inputs.every((v) => v.trim() === '')}>{ui.checkButton}</button>
      {message && <p className={result.overall === 'right' ? 'ok' : 'nope'} role="status">{message}</p>}
    </section>
  );
}
```

- [ ] **Step 6: CSS** in `src/styles.css` hinter den `.chip`-Regeln:

```css
.type-gap { font: inherit; background: #333; color: #eee; border: 2px solid #888; border-radius: 6px; padding: 1px 6px; margin: 0 2px; direction: ltr; }
.type-gap:focus { outline: none; border-color: var(--accent); }
.type-gap.ok { border-color: #1f7a2e; }
.type-gap.nope { border-color: #9b2c2c; }
```

- [ ] **Step 7: Dispatch + `ui`-Schlüssel** — `StationView.jsx`: `import TypeGap from './TypeGap.jsx';` und die Dispatch-Zeile nach `findbug`. `ui`-Schlüssel in `de.js` hinter `findbugWrong`, in den fünf anderen Bündeln an derselben Stelle.

- [ ] **Step 8: Formregel** in `tests/content.test.js`: `TYPES` um `'type'` erweitern und in der Schleife ergänzen:

```js
if (ex.type === 'type') {
  expect((ex.code.match(/___/g) || []).length, `${id}[${i}] Luecken`).toBe(ex.gaps.length);
  for (const g of ex.gaps) {
    expect(Array.isArray(g.accept) && g.accept.length > 0, `${id}[${i}] accept`).toBe(true);
    for (const a of g.accept) expect(a.trim().length).toBeGreaterThan(0);
  }
}
```

- [ ] **Step 9: Grün sehen** — `npx vitest run tests/typegap.test.js tests/typegap-component.test.jsx`, dann `npm test`.

- [ ] **Step 10: Commit** `feat(app): type-the-gap exercise with case hint` (stagen: `src/lib/typegap.js`, `src/components/TypeGap.jsx`, `src/components/StationView.jsx`, `src/styles.css`, sechs `src/i18n/*.js`, `tests/typegap.test.js`, `tests/typegap-component.test.jsx`, `tests/content.test.js`).

---

### Task 3: Hauptansicht stapelt breite Blöcke

**Files:**
- Modify: `src/components/ConceptCard.jsx`, `src/styles.css`
- Test: `tests/conceptcard.test.jsx` (neu)

**Interfaces:**
- Consumes: `blockViewWidth(blocks)` aus `src/components/BlockView.jsx` (existiert, liefert die natürliche Breite in CSS-Pixeln).
- Produces: `.side-by-side` bekommt die Klasse `side-by-side-stacked` und `data-stacked="true"`, wenn keine Block-Grafik (`blockImage`) gesetzt ist und `blockViewWidth(blocks) > WIDE_MAIN` (`const WIDE_MAIN = 500` in `ConceptCard.jsx`). Gemessen 17.09.2026 (natürliche Breite): s01 246, s02/s03 449, s04/s05 494, s06/s07 487, s08 522, s09 624. Die halbe Spalte (~330 px) würde fast alles stapeln und Holz/Stein verändern; 500 trennt genau die Stationen des Plan-3-Befunds (s08, s09) ab. Die Gold-Programme liegen nach der Schätzung aus Task 1 (`agent.setItem` ≈ 477, `while not …` ≈ 370) darunter und bleiben nebeneinander; der Report nennt die gemessenen Werte. Sonst `data-stacked="false"`. Löst den Plan-3-Befund „Hauptansicht quetscht lange `fill`-Blöcke in s08/s09".

- [ ] **Step 1: Failing test** `tests/conceptcard.test.jsx`:

```jsx
import { render } from '@testing-library/react';
import ConceptCard from '../src/components/ConceptCard.jsx';
import { blockViewWidth } from '../src/components/BlockView.jsx';
import { STATIONS } from '../src/data/stations.js';
import de from '../src/i18n/de.js';

const base = { paragraphs: ['x'], bridge: { game: 'g', code: 'c' }, python: 'pass', ui: de.ui, sui: null, showSupport: false };

test('breite Bloecke (s08 fill) stapeln Block und Python untereinander', () => {
  const { container } = render(<ConceptCard {...base} blocks={STATIONS.s08.blocks} />);
  const grid = container.querySelector('.side-by-side');
  expect(grid.getAttribute('data-stacked')).toBe('true');
  expect(grid.className).toMatch(/side-by-side-stacked/);
});

test('schmale Bloecke (s01) bleiben nebeneinander', () => {
  const { container } = render(<ConceptCard {...base} blocks={STATIONS.s01.blocks} />);
  expect(container.querySelector('.side-by-side').getAttribute('data-stacked')).toBe('false');
});

test('Holz, Stein und s07 bleiben nebeneinander (Regressionsschutz)', () => {
  for (const sid of ['s01', 's02', 's03', 's04', 's05', 's06', 's07']) {
    expect(blockViewWidth(STATIONS[sid].blocks), sid).toBeLessThanOrEqual(500);
  }
});
```

- [ ] **Step 2: Rot sehen** — `npx vitest run tests/conceptcard.test.jsx` (`data-stacked` fehlt). Der dritte Test ist schon grün (Regressionsschutz). Scheitert er doch, im Report die gemessenen Breiten nennen und `DONE_WITH_CONCERNS` melden, nicht die Schwelle schieben.

- [ ] **Step 3: Implementierung**

```jsx
import BlockView, { blockViewWidth } from './BlockView.jsx';

// Ab dieser natuerlichen Breite stehen Block und Python untereinander. Breitere Bloecke wurden
// nebeneinander auf unlesbare Schrift gestaucht (Befund Plan 3: s08/s09 fill). Holz bis s07 liegen bei hoechstens 494 und bleiben unveraendert (gemessen 17.09.2026).
const WIDE_MAIN = 500;
```

Im Rumpf: `const wide = !blockImage && Array.isArray(blocks) && blocks.length > 0 && blockViewWidth(blocks) > WIDE_MAIN;` und `<div className={`side-by-side${wide ? ' side-by-side-stacked' : ''}`} data-stacked={wide ? 'true' : 'false'}>`.

CSS hinter `.side-by-side > * { min-width: 0; }`:

```css
.side-by-side.side-by-side-stacked { grid-template-columns: 1fr; }
```

- [ ] **Step 4: Grün sehen** — `npx vitest run tests/conceptcard.test.jsx`, dann `npm test`. Erwartung: s08 und s09 stapeln, s01–s07 nicht; im Report bestätigen. Task 5/6 nennen die Breiten von s10–s12. Die Höhen misst Task 11 nach.

- [ ] **Step 5: Commit** `feat(app): stack wide blocks above python in the concept card` (stagen: `src/components/ConceptCard.jsx`, `src/styles.css`, `tests/conceptcard.test.jsx`).

---

### Task 4: Parcours — Bahndaten, Simulator, Bauskript `parcours`

**Files:**
- Create: `scripts/minecraft/parcours.json`, `scripts/minecraft/parcours-sim.mjs`
- Modify: `scripts/minecraft/welt-ankunft-bau.py` (Befehl `parcours`, Kopfkommentar)
- Test: `tests/parcours-sim.test.js`, `tests/parcours-script.test.js` (beide neu)

**Interfaces:**
- Consumes: Blockform aus Task 1 (Bedingungen, `if`/`else`, `while`). Task 4 braucht den Code aus Task 1 nicht, nur die Datenform.
- Produces:
  - `parcours.json`: `{ axes, groundTop: 4, lanes: [{ id, start: [x, y, z], facing: 'S', fills: [{ block, from, to }], places: [{ block, at }] }] }`. `start` ist die Goldmarke (y=4); Spieler und Agent stehen darüber auf y=5. Blocknamen sind die MakeCode-Namen (`STONE`, `AIR`, `GOLD_BLOCK`, `REDSTONE_BLOCK`).
  - `buildWorld(lane, groundTop = 4) → { get(x, y, z) → blockName, set(blockName, x, y, z) }`: unbelegte Felder sind `GRASS` bis `groundTop`, darüber `AIR`; `fills` in Reihenfolge, danach `places`.
  - `runProgram(world, lane, blocks, { maxSteps = 1000 } = {}) → { x, y, z, facing, steps }`: führt die Rümpfe aller Hüte in `blocks` aus. Unterstützt `agent.teleportToPlayer` (Agent steht über `lane.start`, Blick `lane.facing`), `agent.setItem` (merkt den Block, `planks_oak` → `PLANKS_OAK`), `setVar`, `repeat` (Zahl oder Variable), `if`/`elseBody`, `while`, `agent.move` (`forward`, `n` Schritte, jeder Schritt nur, wenn das Zielfeld `AIR` ist; der Agent fällt nicht), `agent.turn` (`left`/`right`), `agent.place` (`down`, nur in `AIR`), `agent.detect` (`block`: Feld ist nicht `AIR`; `redstone`: Feld ist `REDSTONE_BLOCK`), `{ not }`. Alles andere wirft `Error('Simulator kennt <kind> nicht')`. Jeder ausgeführte Befehl und jede `while`-Prüfung zählt einen Schritt; über `maxSteps` wirft `Error('Endlosschleife: …')`.
  - Achsen im Code: `S: [0, +1]`, `E: [+1, 0]`, `N: [0, -1]`, `W: [-1, 0]` als `[dx, dz]`; `LEFT = { S: 'E', E: 'N', N: 'W', W: 'S' }`, `RIGHT = { S: 'W', W: 'N', N: 'E', E: 'S' }`.
  - Python: `blocks.fill`/`blocks.place`-Zeilen zwischen `# --- parcours start ---` und `# --- parcours ende ---` in genau der Reihenfolge von `parcours.json` (Bahnen der Reihe nach, je Bahn erst `fills`, dann `places`).

**Bahndaten** (vorab mit einer Wegwerf-Simulation geprüft; der Test in diesem Task ist der Beleg):

| Bahn | x | Goldmarke | Felder südlich der Marke | Löcher (2 tief, z) | Ende |
|---|---|---|---|---|---|
| `ecke` | −21 | (−21, 4, 56) | Schenkel 1: z 57–66 bei x −21; Schenkel 2: x −20…−11 bei z 66 | – | Goldmarke (−11, 4, 66), Wände ringsum |
| `loecher` | −4 | (−4, 4, 56) | z 57–66 (10 Felder) | 58, 60, 61, 64 | Wand z 67 |
| `ziel` | 4 | (4, 4, 56) | z 57–76 (20 Felder) | 59, 62, 63, 67, 71, 72 | Wand z 77 |
| `boss` | 12 | (12, 4, 56) | z 57–78 (22 Felder) | 58, 61, 65, 71; Redstone-Block (12, 4, 68) | Sicherheitswand z 79 |

Abstände: zwischen den Wänden der Bahnen je mindestens 4 freie Felder; Klippen enden bei z=49, der Parcours beginnt bei z=56.

- [ ] **Step 1: `scripts/minecraft/parcours.json`**

```json
{
  "axes": "+x = Osten, +z = Sueden. Mit Blick nach Sueden fuehrt LEFT_TURN nach Osten.",
  "groundTop": 4,
  "lanes": [
    { "id": "ecke", "start": [-21, 4, 56], "facing": "S",
      "fills": [
        { "block": "STONE", "from": [-22, 5, 56], "to": [-10, 6, 67] },
        { "block": "AIR", "from": [-21, 5, 56], "to": [-21, 6, 66] },
        { "block": "AIR", "from": [-20, 5, 66], "to": [-11, 6, 66] }
      ],
      "places": [
        { "block": "GOLD_BLOCK", "at": [-21, 4, 56] },
        { "block": "GOLD_BLOCK", "at": [-11, 4, 66] }
      ] },
    { "id": "loecher", "start": [-4, 4, 56], "facing": "S",
      "fills": [
        { "block": "STONE", "from": [-5, 5, 56], "to": [-3, 6, 67] },
        { "block": "AIR", "from": [-4, 5, 56], "to": [-4, 6, 66] },
        { "block": "AIR", "from": [-4, 3, 58], "to": [-4, 4, 58] },
        { "block": "AIR", "from": [-4, 3, 60], "to": [-4, 4, 61] },
        { "block": "AIR", "from": [-4, 3, 64], "to": [-4, 4, 64] }
      ],
      "places": [
        { "block": "GOLD_BLOCK", "at": [-4, 4, 56] }
      ] },
    { "id": "ziel", "start": [4, 4, 56], "facing": "S",
      "fills": [
        { "block": "STONE", "from": [3, 5, 56], "to": [5, 6, 77] },
        { "block": "AIR", "from": [4, 5, 56], "to": [4, 6, 76] },
        { "block": "AIR", "from": [4, 3, 59], "to": [4, 4, 59] },
        { "block": "AIR", "from": [4, 3, 62], "to": [4, 4, 63] },
        { "block": "AIR", "from": [4, 3, 67], "to": [4, 4, 67] },
        { "block": "AIR", "from": [4, 3, 71], "to": [4, 4, 72] }
      ],
      "places": [
        { "block": "GOLD_BLOCK", "at": [4, 4, 56] }
      ] },
    { "id": "boss", "start": [12, 4, 56], "facing": "S",
      "fills": [
        { "block": "STONE", "from": [11, 5, 56], "to": [13, 6, 79] },
        { "block": "AIR", "from": [12, 5, 56], "to": [12, 6, 78] },
        { "block": "AIR", "from": [12, 3, 58], "to": [12, 4, 58] },
        { "block": "AIR", "from": [12, 3, 61], "to": [12, 4, 61] },
        { "block": "AIR", "from": [12, 3, 65], "to": [12, 4, 65] },
        { "block": "AIR", "from": [12, 3, 71], "to": [12, 4, 71] }
      ],
      "places": [
        { "block": "GOLD_BLOCK", "at": [12, 4, 56] },
        { "block": "REDSTONE_BLOCK", "at": [12, 4, 68] }
      ] }
  ]
}
```

- [ ] **Step 2: Failing test** `tests/parcours-sim.test.js` (Programme hier als Daten; Task 5/6 hängen die Tests gegen `STATIONS` an):

```js
import parcours from '../scripts/minecraft/parcours.json';
import { buildWorld, runProgram } from '../scripts/minecraft/parcours-sim.mjs';

const lane = (id) => parcours.lanes.find((l) => l.id === id);
const hat = (body) => [{ kind: 'onChat', word: 't', body }];
const detect = (what, dir) => ({ kind: 'agent.detect', what, dir });
const pave = { kind: 'if', cond: detect('block', 'down'),
  body: [{ kind: 'agent.move', dir: 'forward', n: 1 }], elseBody: [{ kind: 'agent.place', dir: 'down' }] };
const run = (id, body, opts) => { const l = lane(id); const w = buildWorld(l, parcours.groundTop); return { w, a: runProgram(w, l, hat(body), opts) }; };

test('Achsen: Blick nach Sueden, LEFT_TURN fuehrt nach Osten (+x), Schritt nach Sueden erhoeht z', () => {
  const { a } = run('ziel', [{ kind: 'agent.teleportToPlayer' }, { kind: 'agent.move', dir: 'forward', n: 1 }]);
  expect([a.x, a.z]).toEqual([4, 57]);
  const turned = run('ecke', [{ kind: 'agent.teleportToPlayer' }, { kind: 'agent.turn', dir: 'left' }]).a;
  expect(turned.facing).toBe('E');
});

test('ecke: 20 Durchlaeufe enden genau ueber der zweiten Goldmarke', () => {
  const { w, a } = run('ecke', [{ kind: 'agent.teleportToPlayer' }, { kind: 'repeat', n: 20, body: [
    { kind: 'if', cond: detect('block', 'forward'), body: [{ kind: 'agent.turn', dir: 'left' }] },
    { kind: 'agent.move', dir: 'forward', n: 1 },
  ] }]);
  expect([a.x, a.y, a.z]).toEqual([-11, 5, 66]);
  expect(w.get(-11, 4, 66)).toBe('GOLD_BLOCK');
});

test('loecher: 10 Durchlaeufe reichen nicht, 13 fuellen alle Loecher, erst 14 erreichen das letzte Feld', () => {
  const prog = (n) => [{ kind: 'agent.teleportToPlayer' }, { kind: 'agent.setItem', block: 'planks_oak', count: 64, slot: 1 }, { kind: 'repeat', n, body: [pave] }];
  const ten = run('loecher', prog(10));
  expect(ten.a.z).toBe(63);
  expect(ten.w.get(-4, 4, 64)).toBe('AIR');
  expect(run('loecher', prog(13)).a.z).toBe(65);
  const fourteen = run('loecher', prog(14));
  expect(fourteen.a.z).toBe(66);
  for (const z of [58, 60, 61, 64]) expect(fourteen.w.get(-4, 4, z)).toBe('PLANKS_OAK');
});

test('ziel: while not detect forward endet vor der Wand, alle Loecher gefuellt', () => {
  const { w, a } = run('ziel', [{ kind: 'agent.teleportToPlayer' }, { kind: 'agent.setItem', block: 'planks_oak', count: 64, slot: 1 },
    { kind: 'while', cond: { not: detect('block', 'forward') }, body: [pave] }]);
  expect(a.z).toBe(76);
  for (const z of [59, 62, 63, 67, 71, 72]) expect(w.get(4, 4, z)).toBe('PLANKS_OAK');
});

test('boss: das alte Programm laeuft am Redstone vorbei bis zur Sicherheitswand, das geaenderte stoppt darauf', () => {
  const body = (cond) => [{ kind: 'agent.teleportToPlayer' }, { kind: 'agent.setItem', block: 'planks_oak', count: 64, slot: 1 }, { kind: 'while', cond, body: [pave] }];
  expect(run('boss', body({ not: detect('block', 'forward') })).a.z).toBe(78);
  const { w, a } = run('boss', body({ not: detect('redstone', 'down') }));
  expect(a.z).toBe(68);
  expect(w.get(a.x, 4, a.z)).toBe('REDSTONE_BLOCK');
});

test('ohne not laeuft while kein einziges Mal (Fehlersuche s12)', () => {
  const { a } = run('ziel', [{ kind: 'agent.teleportToPlayer' }, { kind: 'while', cond: detect('block', 'forward'), body: [pave] }]);
  expect(a.z).toBe(56);
});

test('Endlosschleife wird erkannt statt zu haengen', () => {
  expect(() => run('ziel', [{ kind: 'agent.teleportToPlayer' }, { kind: 'while', cond: { not: detect('redstone', 'down') }, body: [pave] }], { maxSteps: 500 }))
    .toThrow(/Endlosschleife/);
});

test('unbekannte Blockart wirft', () => {
  expect(() => run('ziel', [{ kind: 'agent.destroy', dir: 'forward' }])).toThrow(/Simulator kennt agent\.destroy nicht/);
});
```

- [ ] **Step 3: Failing test** `tests/parcours-script.test.js`:

```js
import { readFileSync } from 'node:fs';
import parcours from '../scripts/minecraft/parcours.json';

const py = readFileSync('scripts/minecraft/welt-ankunft-bau.py', 'utf8');
const N = '(-?\\d+)';
const FILL = new RegExp(`blocks\\.fill\\((\\w+), world\\(${N}, ${N}, ${N}\\), world\\(${N}, ${N}, ${N}\\), FillOperation\\.REPLACE\\)`);
const PLACE = new RegExp(`blocks\\.place\\((\\w+), world\\(${N}, ${N}, ${N}\\)\\)`);

function fromPython() {
  const start = py.indexOf('# --- parcours start ---');
  const end = py.indexOf('# --- parcours ende ---');
  expect(start, 'Marker "parcours start"').toBeGreaterThan(-1);
  expect(end, 'Marker "parcours ende"').toBeGreaterThan(start);
  return py.slice(start, end).split('\n').flatMap((line) => {
    const f = line.match(FILL);
    if (f) return [`fill ${f[1]} ${f.slice(2, 5).join(',')} ${f.slice(5, 8).join(',')}`];
    const p = line.match(PLACE);
    if (p) return [`place ${p[1]} ${p.slice(2, 5).join(',')}`];
    return [];
  });
}

function fromJson() {
  return parcours.lanes.flatMap((l) => [
    ...l.fills.map((f) => `fill ${f.block} ${f.from.join(',')} ${f.to.join(',')}`),
    ...l.places.map((p) => `place ${p.block} ${p.at.join(',')}`),
  ]);
}

test('Bauskript parcours setzt genau die Bloecke aus parcours.json, in derselben Reihenfolge', () => {
  expect(fromPython()).toEqual(fromJson());
});

test('parcours ist ein eigener Chat-Befehl', () => {
  expect(py).toMatch(/player\.on_chat\("parcours", on_parcours\)/);
});
```

- [ ] **Step 4: Rot sehen** — `npx vitest run tests/parcours-sim.test.js tests/parcours-script.test.js` (Simulator fehlt, Marker fehlen).

- [ ] **Step 5: `scripts/minecraft/parcours-sim.mjs`**

```js
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
```

Hinweis: Die Tests „Achsen" und „ohne not" rufen kein `agent.setItem` auf; `agent.place` ohne Gegenstand legt nichts, das entspricht dem Spiel.

- [ ] **Step 6: Bauskript** — in `welt-ankunft-bau.py` den Kopfkommentar um einen Absatz ergänzen („Dritter Befehl `parcours` (Etappe Gold, Plan 4 Task 4): baut additiv vier Bahnen südlich der Klippen, ab z=56. Die Zahlen stammen aus `scripts/minecraft/parcours.json`; `tests/parcours-script.test.js` vergleicht beide Zeile für Zeile — wer eine Zahl ändert, ändert sie in beiden. Schilder setzt die Lehrkraft von Hand, Goldmarken und der Redstone-Block kommen aus dem Skript.") und ans Dateiende anhängen:

```python
# --- parcours start ---
def bau_parcours_ecke():
    # Gang 1 breit, knickt nach Osten ab (links bei Blick nach Sueden). 20 Durchlaeufe von ecke
    # enden ueber der zweiten Goldmarke (Simulator-Test).
    blocks.fill(STONE, world(-22, 5, 56), world(-10, 6, 67), FillOperation.REPLACE)
    blocks.fill(AIR, world(-21, 5, 56), world(-21, 6, 66), FillOperation.REPLACE)
    blocks.fill(AIR, world(-20, 5, 66), world(-11, 6, 66), FillOperation.REPLACE)
    blocks.place(GOLD_BLOCK, world(-21, 4, 56))
    blocks.place(GOLD_BLOCK, world(-11, 4, 66))

def bau_parcours_loecher():
    # 10 Felder, 4 Loecher je 2 tief, Wand bei z=67. loecher braucht 14 Durchlaeufe.
    blocks.fill(STONE, world(-5, 5, 56), world(-3, 6, 67), FillOperation.REPLACE)
    blocks.fill(AIR, world(-4, 5, 56), world(-4, 6, 66), FillOperation.REPLACE)
    blocks.fill(AIR, world(-4, 3, 58), world(-4, 4, 58), FillOperation.REPLACE)
    blocks.fill(AIR, world(-4, 3, 60), world(-4, 4, 61), FillOperation.REPLACE)
    blocks.fill(AIR, world(-4, 3, 64), world(-4, 4, 64), FillOperation.REPLACE)
    blocks.place(GOLD_BLOCK, world(-4, 4, 56))

def bau_parcours_ziel():
    # 20 Felder, 6 Loecher, Wand bei z=77. ziel laeuft bis z=76.
    blocks.fill(STONE, world(3, 5, 56), world(5, 6, 77), FillOperation.REPLACE)
    blocks.fill(AIR, world(4, 5, 56), world(4, 6, 76), FillOperation.REPLACE)
    blocks.fill(AIR, world(4, 3, 59), world(4, 4, 59), FillOperation.REPLACE)
    blocks.fill(AIR, world(4, 3, 62), world(4, 4, 63), FillOperation.REPLACE)
    blocks.fill(AIR, world(4, 3, 67), world(4, 4, 67), FillOperation.REPLACE)
    blocks.fill(AIR, world(4, 3, 71), world(4, 4, 72), FillOperation.REPLACE)
    blocks.place(GOLD_BLOCK, world(4, 4, 56))

def bau_parcours_boss():
    # Boss-Check Gold: Redstone-Block bei z=68, Sicherheitswand bei z=79. Kein Schild mit Zahlen.
    blocks.fill(STONE, world(11, 5, 56), world(13, 6, 79), FillOperation.REPLACE)
    blocks.fill(AIR, world(12, 5, 56), world(12, 6, 78), FillOperation.REPLACE)
    blocks.fill(AIR, world(12, 3, 58), world(12, 4, 58), FillOperation.REPLACE)
    blocks.fill(AIR, world(12, 3, 61), world(12, 4, 61), FillOperation.REPLACE)
    blocks.fill(AIR, world(12, 3, 65), world(12, 4, 65), FillOperation.REPLACE)
    blocks.fill(AIR, world(12, 3, 71), world(12, 4, 71), FillOperation.REPLACE)
    blocks.place(GOLD_BLOCK, world(12, 4, 56))
    blocks.place(REDSTONE_BLOCK, world(12, 4, 68))

def on_parcours():
    bau_parcours_ecke()
    bau_parcours_loecher()
    bau_parcours_ziel()
    bau_parcours_boss()
player.on_chat("parcours", on_parcours)
# --- parcours ende ---
```

Syntaxprüfung: `python -m py_compile scripts/minecraft/welt-ankunft-bau.py`.

- [ ] **Step 7: Grün sehen** — `npx vitest run tests/parcours-sim.test.js tests/parcours-script.test.js`, dann `npm test`. **Mutationsprobe** (Beleg, dass der Achsen-Test greift): in `parcours-sim.mjs` `LEFT` testweise auf `{ S: 'W', … }` drehen, Test muss rot werden; zurückdrehen. Ergebnis in den Report.

- [ ] **Step 8: Commit** `feat(world): parcours lanes, simulator and build command` (stagen: `scripts/minecraft/parcours.json`, `scripts/minecraft/parcours-sim.mjs`, `scripts/minecraft/welt-ankunft-bau.py`, beide Testdateien).

---

### Task 5: Stationen DS 10 und DS 11 (Daten, Inhalt, Simulator-Bindung)

**Files:**
- Modify: `src/data/stations.js` (`ETAPPEN[gold].stations`, `s10`, `s11`), `src/content/de.js`, `src/i18n/de.js` (`stations.s10`, `stations.s11`)
- Modify: `tests/parcours-sim.test.js` (Tests gegen `STATIONS`)
- Test: bestehende Inhalts- und Konsistenztests laufen über die neuen Stationen mit

**Interfaces:**
- Consumes: Blockform aus Task 1, Übungsform `type` aus Task 2, `buildWorld`/`runProgram` und Bahnen `ecke`/`loecher` aus Task 4.
- Produces: `STATIONS.s10`, `STATIONS.s11`; `ETAPPEN[3].stations = ['s10', 's11']` (**`s12` erst in Task 6**, sonst bricht `content.test.js`). Register-Schlüssel entstehen automatisch: `s10-station`, `s10-quiz`, `s11-station`, `s11-quiz`.
- Die fünf übersetzten Bündel bekommen `stations.s10`/`s11` erst in Task 9. Damit `i18n-complete` bis dahin grün bleibt, **von Hand** eine deutsche Kopie der beiden Stationen mit Vermerk `// Platzhalter 17.09.2026 (Plan 4 Task 5): deutsche Kopie, Task 9 übersetzt` in jedes Bündel legen (Zauberwort- und Bezeichner-Test sind damit automatisch grün).

- [ ] **Step 1: Failing tests** an `tests/parcours-sim.test.js` anhängen:

```js
import { STATIONS } from '../src/data/stations.js';
import de from '../src/i18n/de.js';

// Tiefe Kopie mit geaenderter Stelle: die Tests pruefen genau das Programm, das die App zeigt.
const clone = (x) => JSON.parse(JSON.stringify(x));
function findKind(tree, kind) {
  for (const b of tree) {
    if (b.kind === kind) return b;
    const inner = findKind([...(b.body || []), ...(b.elseBody || [])], kind);
    if (inner) return inner;
  }
  return null;
}
const runStation = (id, blocks) => { const l = lane(id); const w = buildWorld(l, parcours.groundTop); return { w, a: runProgram(w, l, blocks) }; };

test('s10 (Stationsdaten) endet auf der Bahn ecke ueber der zweiten Goldmarke', () => {
  const { w, a } = runStation('ecke', STATIONS.s10.blocks);
  expect([a.x, a.z]).toEqual([-11, 66]);
  expect(w.get(a.x, 4, a.z)).toBe('GOLD_BLOCK');
});

test('s11: die Zahl der Station reicht nicht, die Zahl der Tipp-Luecke erreicht das letzte Feld', () => {
  const stationRun = runStation('loecher', STATIONS.s11.blocks);
  expect(stationRun.a.z).toBeLessThan(66);
  const accept = STATIONS.s11.exercises.find((e) => e.type === 'type').gaps[0].accept[0];
  const fixed = clone(STATIONS.s11.blocks);
  findKind(fixed, 'repeat').n = Number(accept);
  const fixedRun = runStation('loecher', fixed);
  expect(fixedRun.a.z).toBe(66);
  for (const z of [58, 60, 61, 64]) expect(fixedRun.w.get(-4, 4, z)).toBe('PLANKS_OAK');
  const oneLess = clone(STATIONS.s11.blocks);
  findKind(oneLess, 'repeat').n = Number(accept) - 1;
  expect(runStation('loecher', oneLess).a.z).toBeLessThan(66);
  expect(de.stations.s11.tipSolution).toContain(`range(${accept})`);
});

test('s11 Fehlersuche: FORWARD statt DOWN laesst den Agent auf der Goldmarke stehen', () => {
  const bug = clone(STATIONS.s11.blocks);
  findKind(bug, 'repeat').n = 14;
  findKind(bug, 'if').cond.dir = 'forward';
  expect(runStation('loecher', bug).a.z).toBe(56);
  expect(STATIONS.s11.exercises.find((e) => e.type === 'findbug').lines.some((l) => l.includes('AgentDetection.BLOCK, FORWARD'))).toBe(true);
});
```

Rot sehen: `npx vitest run tests/parcours-sim.test.js` (`STATIONS.s10` fehlt).

- [ ] **Step 2: Daten** — `ETAPPEN`: `gold.stations = ['s10', 's11']`. In `STATIONS` nach `s09`:

```js
  s10: {
    etappe: 'gold',
    ds: 10,
    iframeHeight: 5200, // vorlaeufig, Task 11 misst
    // Entwurf nach der MakeCode-Python-API; Gegenpruefung im Editor steht aus (Nachtrag Plan 4,
    // Abschnitt 5: detect, repeat statt for bei ungenutztem index, if-Block).
    python: `def on_ecke():
    agent.teleport_to_player()
    for index in range(20):
        if agent.detect(AgentDetection.BLOCK, FORWARD):
            agent.turn(LEFT_TURN)
        agent.move(FORWARD, 1)
player.on_chat("ecke", on_ecke)`,
    blocks: [{ kind: 'onChat', word: 'ecke', body: [
      { kind: 'agent.teleportToPlayer' },
      { kind: 'repeat', n: 20, body: [
        { kind: 'if', cond: { kind: 'agent.detect', what: 'block', dir: 'forward' }, body: [
          { kind: 'agent.turn', dir: 'left' },
        ] },
        { kind: 'agent.move', dir: 'forward', n: 1 },
      ] },
    ] }],
    exercises: [
      { type: 'match', pairs: [
        { block: { kind: 'if', cond: { kind: 'agent.detect', what: 'block', dir: 'forward' }, body: [] }, python: 'if agent.detect(AgentDetection.BLOCK, FORWARD):' },
        { block: { kind: 'agent.turn', dir: 'left' }, python: 'agent.turn(LEFT_TURN)' },
        { block: { kind: 'repeat', n: 20, body: [] }, python: 'for index in range(20):' },
        { block: { kind: 'agent.move', dir: 'forward', n: 1 }, python: 'agent.move(FORWARD, 1)' },
      ] },
      { type: 'fill', code: 'for index in range(20):\n    if agent.detect(AgentDetection.BLOCK, ___):\n        agent.turn(___)\n    agent.move(FORWARD, 1)',
        gaps: [{ options: ['FORWARD', 'DOWN', 'UP'], correct: 'FORWARD' }, { options: ['LEFT_TURN', 'RIGHT_TURN'], correct: 'LEFT_TURN' }] },
    ],
  },
  s11: {
    etappe: 'gold',
    ds: 11,
    iframeHeight: 5200, // vorlaeufig, Task 11 misst
    // Entwurf; Gegenpruefung im Editor: if/else-Block, place(DOWN) in ein Luftloch, der Agent faellt nicht.
    // range(10) ist Absicht: 10 Felder, aber jedes Loch kostet einen Durchlauf mehr (Auftrag "Die richtige Zahl").
    python: `def on_loecher():
    agent.teleport_to_player()
    agent.set_item(PLANKS_OAK, 64, 1)
    for index in range(10):
        if agent.detect(AgentDetection.BLOCK, DOWN):
            agent.move(FORWARD, 1)
        else:
            agent.place(DOWN)
player.on_chat("loecher", on_loecher)`,
    blocks: [{ kind: 'onChat', word: 'loecher', body: [
      { kind: 'agent.teleportToPlayer' },
      { kind: 'agent.setItem', block: 'planks_oak', count: 64, slot: 1 },
      { kind: 'repeat', n: 10, body: [
        { kind: 'if', cond: { kind: 'agent.detect', what: 'block', dir: 'down' },
          body: [{ kind: 'agent.move', dir: 'forward', n: 1 }],
          elseBody: [{ kind: 'agent.place', dir: 'down' }] },
      ] },
    ] }],
    exercises: [
      { type: 'type', code: 'for index in range(___):\n    if agent.detect(AgentDetection.BLOCK, DOWN):\n        agent.move(FORWARD, 1)\n    else:\n        agent.place(DOWN)',
        gaps: [{ accept: ['14'], hint: 'number' }] },
      { type: 'findbug', lines: [
        'for index in range(14):',
        '    if agent.detect(AgentDetection.BLOCK, FORWARD):',
        '        agent.move(FORWARD, 1)',
        '    else:',
        '        agent.place(DOWN)',
      ], wrong: 1 },
    ],
  },
```

Abweichung vom Nachtrag (Abschnitt 3, s11-Fehlersuche „`place` im falschen Zweig"): Vertauschte Zweige wären **zwei** falsche Zeilen, `FindBug` verlangt genau eine. Die Fehlersuche prüft deshalb `FORWARD` statt `DOWN` in der Bedingung; der Simulator-Test belegt die Folge („der Agent bleibt auf dem Goldblock stehen"). Im Report vermerken.

- [ ] **Step 3: `content/de.js`** (Leit-Ebene) nach `s09`:

```js
    s10: {
      story: [
        { who: 'dani', mood: 'ueberrascht', text: 'Hinter den Klippen ist ein Parcours!' },
        { who: 'dani', mood: 'nachdenklich', text: 'Der Gang knickt ab. Aber wo? Ich sehe es nicht.' },
        { who: 'nour', mood: 'erklaerend', text: 'Der Agent kann nachsehen. detect prüft den Block vor ihm.' },
        { who: 'dani', mood: 'fragend', text: 'Und was macht er dann?' },
        { who: 'nour', mood: 'erklaerend', text: 'Mit if sagst du: Wenn vorn ein Block ist, dreh dich.' },
        { who: 'nour', mood: 'begeistert', text: 'Der Agent entscheidet jedes Mal neu.' },
        { who: 'dani', mood: 'begeistert', text: 'Er findet den Weg um die Ecke!' },
      ],
      concept: [
        'Eine Bedingung ist wahr oder falsch.',
        'agent.detect(AgentDetection.BLOCK, FORWARD) ist wahr, wenn vorn ein Block ist.',
        'if führt die eingerückten Zeilen nur aus, wenn die Bedingung wahr ist.',
        'Die Schleife läuft 20-mal. Jedes Mal prüft if neu.',
      ],
      tips: [
        'Frage: Was tut der Agent, wenn vorn kein Block ist?',
        'Richtung: Die Drehung steht unter if. Der Schritt steht außerhalb von if.',
        'Gerüst: if agent.detect(AgentDetection.BLOCK, ___): und darunter agent.turn(LEFT_TURN).',
      ],
    },
    s11: {
      story: [
        { who: 'dani', mood: 'ueberrascht', text: 'Auf dieser Bahn sind Löcher!' },
        { who: 'dani', mood: 'fragend', text: 'Soll der Agent gehen oder einen Block legen?' },
        { who: 'nour', mood: 'erklaerend', text: 'Beides, aber nie zugleich. Mit else sagst du: sonst.' },
        { who: 'nour', mood: 'erklaerend', text: 'Ist unten Boden, geht er. Sonst legt er einen Block.' },
        { who: 'dani', mood: 'nachdenklich', text: 'Die Bahn hat 10 Felder. Also range(10)?' },
        { who: 'nour', mood: 'nachdenklich', text: 'Probier es aus. Jedes Loch kostet einen Durchlauf mehr.' },
        { who: 'dani', mood: 'begeistert', text: 'Ich ändere die Zahl in Python. Jetzt kommt er an!' },
      ],
      concept: [
        'if und else sind zwei Wege. In jedem Durchlauf läuft genau einer.',
        'agent.detect(AgentDetection.BLOCK, DOWN) prüft den Block unter dem Agent.',
        'Ein Durchlauf ist ein Schritt oder ein Block, nie beides.',
        'Du änderst die Zahl direkt in Python. Die Blöcke ändern sich mit.',
      ],
      tips: [
        'Frage: Wie viele Schritte braucht der Agent? Wie viele Löcher gibt es?',
        'Richtung: Ein Loch braucht zwei Durchläufe: einen Block und einen Schritt.',
        'Gerüst: 10 Schritte plus 4 Blöcke. for index in range(___):',
      ],
    },
```

- [ ] **Step 4: `i18n/de.js`** (Stütz-Ebene) nach `s09`:

```js
    s10: {
      title: 'Wenn, dann',
      storyShort: 'Der Gang im Parcours knickt ab. Der Agent prüft mit detect, ob vorn ein Block ist. Mit if dreht er sich nur dann.',
      bridge: {
        game: 'Du tippst ecke. Der Agent läuft durch den Gang und biegt an der Wand ab.',
        code: 'if prüft eine Bedingung. Nur wenn sie wahr ist, dreht sich der Agent.',
      },
      tasks: [
        { kind: 'auftrag', title: 'Um die Ecke', text: 'Stell dich auf den Goldblock am Gang Ecke. Schau nach Süden. Schreibe ecke. Der Agent stoppt über dem zweiten Goldblock. Schalte auf Python: Finde die Zeile mit if.' },
        { kind: 'nochEiner', title: 'Rechts herum', text: 'Bau einen kurzen Gang, der nach rechts abknickt. Ändere eine Zeile im Programm.' },
        { kind: 'remix', title: 'Dein Gang', text: 'Bau einen Gang mit zwei Ecken. Reichen 20 Durchläufe? Zeig es deinem Partner oder deiner Partnerin.' },
      ],
      tipSolution: 'Unter if agent.detect(AgentDetection.BLOCK, FORWARD): steht agent.turn(LEFT_TURN). agent.move(FORWARD, 1) steht außerhalb von if und läuft jedes Mal.',
      exercises: [
        { prompt: 'Ordne jeden Block seiner Python-Zeile zu.' },
        { prompt: 'Der Agent soll prüfen, was vor ihm ist. Dann dreht er sich nach links.' },
      ],
      quiz: [
        { q: 'Was ist eine Bedingung?', answers: [
          { text: 'Etwas, das wahr oder falsch ist', correct: true },
          { text: 'Ein Block', correct: false },
          { text: 'Ein Zauberwort', correct: false },
        ] },
        { q: 'Vor dem Agent ist eine Wand. Was ist agent.detect(AgentDetection.BLOCK, FORWARD)?', answers: [
          { text: 'wahr', correct: true },
          { text: 'falsch', correct: false },
          { text: '20', correct: false },
        ] },
        { q: 'Wann läuft die Zeile unter if?', answers: [
          { text: 'Nur wenn die Bedingung wahr ist', correct: true },
          { text: 'Immer', correct: false },
          { text: 'Nie', correct: false },
        ] },
        { q: 'Warum steht agent.move außerhalb von if?', answers: [
          { text: 'Der Agent soll jedes Mal gehen', correct: true },
          { text: 'Sonst dreht er sich nicht', correct: false },
          { text: 'Das ist egal', correct: false },
        ] },
      ],
    },
    s11: {
      title: 'Sonst',
      storyShort: 'Auf der Bahn sind Löcher. Mit if und else entscheidet der Agent: Boden, also gehen. Sonst legt er einen Block. Die Zahl der Durchläufe änderst du in Python.',
      bridge: {
        game: 'Du tippst loecher. Der Agent füllt die Löcher und läuft bis zur Wand.',
        code: 'else heißt sonst. In jedem Durchlauf läuft genau einer der zwei Wege.',
      },
      tasks: [
        { kind: 'auftrag', title: 'Die Löcher', text: 'Stell dich auf den Goldblock der Bahn Löcher. Schau nach Süden. Schreibe loecher. Wo bleibt der Agent stehen?' },
        { kind: 'nochEiner', title: 'Die richtige Zahl', text: 'Schalte auf Python. Ändere die Zahl in range. Der Agent soll bis zur Wand kommen.' },
        { kind: 'remix', title: 'Andere Blöcke', text: 'Füll die Löcher mit einem anderen Block. Zeig es deinem Partner oder deiner Partnerin.' },
      ],
      tipSolution: 'Die Bahn hat 10 Felder und 4 Löcher. 10 Schritte und 4 Blöcke sind 14 Durchläufe: for index in range(14):',
      exercises: [
        { prompt: 'Die Bahn hat 10 Felder und 4 Löcher. Wie viele Durchläufe braucht der Agent bis zum letzten Feld?' },
        { prompt: 'Der Agent bleibt auf dem Goldblock stehen. Welche Zeile ist falsch?', explain: 'Die Bedingung prüft FORWARD statt DOWN. Vorn ist frei, also legt er immer einen Block. Er geht nie los.' },
      ],
      quiz: [
        { q: 'Was heißt else?', answers: [
          { text: 'Sonst', correct: true },
          { text: 'Solange', correct: false },
          { text: 'Wiederhole', correct: false },
        ] },
        { q: 'Unter dem Agent ist ein Loch. Was tut er?', answers: [
          { text: 'Er legt einen Block', correct: true },
          { text: 'Er geht einen Schritt', correct: false },
          { text: 'Er dreht sich', correct: false },
        ] },
        { q: 'Die Bahn hat 10 Felder und 2 Löcher. Wie viele Durchläufe braucht der Agent?', answers: [
          { text: '12', correct: true },
          { text: '10', correct: false },
          { text: '8', correct: false },
        ] },
        { q: 'Wie viele der zwei Wege laufen in einem Durchlauf?', answers: [
          { text: 'Genau einer', correct: true },
          { text: 'Beide', correct: false },
          { text: 'Keiner', correct: false },
        ] },
      ],
    },
```

Vor dem Einfügen die Form von `s09` in `de.js` vergleichen (Quiz-Objekte mehrzeilig) und die Schreibweise angleichen; die Inhalte bleiben wie oben. Sätze über 12 Wörter kürzen, ohne den Sinn zu ändern, und im Report nennen.

- [ ] **Step 5: Platzhalter** in `src/i18n/{en,uk,ar,es,it}.js` (deutsche Kopie von `stations.s10`/`s11` mit Vermerk, siehe Interfaces).

- [ ] **Step 6: Grün sehen** — `npm test` (Simulator-Bindung, Konsistenztest mit `if`/`else:`, `content.test` mit `type`, `i18n-complete`). Dev-Server (`npm run dev`, Port 3030): `#/station/s10`, `#/station/s11` ansehen (Sechseck-Bedingung, `else`-Mund, Tipp-Lücke tippbar, `14` → „Richtig!").

- [ ] **Step 7: Commit** `feat(content): stations DS 10 and DS 11 (Gold)` (stagen: `src/data/stations.js`, `src/content/de.js`, sechs `src/i18n/*.js`, `tests/parcours-sim.test.js`).

---

### Task 6: Station DS 12, Boss-Check Gold, Glossar, Badge-Icon

**Files:**
- Modify: `src/data/stations.js` (`s12`, `ETAPPEN[gold].stations` komplett), `src/content/de.js`, `src/i18n/de.js` (`stations.s12`, `glossary` +4), `src/i18n/{en,uk,ar,es,it}.js` (Platzhalter)
- Create: `src/assets/badges/gold.svg`
- Modify: `tests/course-def.test.js` (Abschnitt 5), `tests/parcours-sim.test.js` (s12 und Boss)

**Interfaces:**
- Produces: `STATIONS.s12` mit `bossCheck: { key: 'boss-gold', gradeMax: 100 }`; `ETAPPEN[3].stations = ['s10', 's11', 's12']`; `de.glossary.bedingung | verzweigung | solange | detect` in der Form `{ term, short }`; `de.stations.s12.bossCheck = { title: 'Boss-Check Gold', subtitle: 'Der unbekannte Parcours', task }`. Register-Schlüssel: `s12-station`, `s12-quiz`, `boss-gold`.

- [ ] **Step 1: Failing tests**

`tests/course-def.test.js`:

```js
test('Abschnitt 5 Gold: drei Stationen, drei Quizze, Boss-Check Gold direkt nach dem Quiz von s12, Name kurz', () => {
  const gold = def.sections.find((s) => s.num === 5);
  expect(gold.items.map((i) => i.key)).toEqual(['s10-station', 's10-quiz', 's11-station', 's11-quiz', 's12-station', 's12-quiz', 'boss-gold']);
  const boss = gold.items.find((i) => i.key === 'boss-gold');
  expect(boss.type).toBe('assignment');
  expect(boss.name).toContain('Boss-Check Gold');
  expect(boss.name.length).toBeLessThanOrEqual(255);
  expect(boss.intro).toContain('Der unbekannte Parcours');
});
```

`tests/parcours-sim.test.js`:

```js
test('s12 (Stationsdaten) laeuft auf der Bahn ziel bis vor die Wand', () => {
  expect(runStation('ziel', STATIONS.s12.blocks).a.z).toBe(76);
});

test('Boss-Check Gold: s12 unveraendert laeuft vorbei; die Bedingung aus der Tipp-Luecke stoppt auf dem Redstone', () => {
  expect(runStation('boss', STATIONS.s12.blocks).a.z).toBe(78);
  const [what, dir] = STATIONS.s12.exercises.find((e) => e.type === 'type').gaps.map((g) => g.accept[0].toLowerCase());
  const changed = clone(STATIONS.s12.blocks);
  findKind(changed, 'while').cond = { not: { kind: 'agent.detect', what, dir } };
  const { w, a } = runStation('boss', changed);
  expect(a.z).toBe(68);
  expect(w.get(a.x, 4, a.z)).toBe('REDSTONE_BLOCK');
});

test('s12 Fehlersuche: ohne not laeuft der Agent nicht los', () => {
  const bug = clone(STATIONS.s12.blocks);
  findKind(bug, 'while').cond = findKind(bug, 'while').cond.not;
  expect(runStation('ziel', bug).a.z).toBe(56);
  expect(STATIONS.s12.exercises.find((e) => e.type === 'findbug').lines[0]).toBe('while agent.detect(AgentDetection.BLOCK, FORWARD):');
});
```

Rot sehen (`s12` fehlt).

- [ ] **Step 2: Daten**

```js
  s12: {
    etappe: 'gold',
    ds: 12,
    iframeHeight: 5200, // vorlaeufig, Task 11 misst
    bossCheck: { key: 'boss-gold', gradeMax: 100 },
    // Entwurf; Gegenpruefung im Editor: while not als Block, Stopp eines endlosen while im Code Builder.
    python: `def on_ziel():
    agent.teleport_to_player()
    agent.set_item(PLANKS_OAK, 64, 1)
    while not agent.detect(AgentDetection.BLOCK, FORWARD):
        if agent.detect(AgentDetection.BLOCK, DOWN):
            agent.move(FORWARD, 1)
        else:
            agent.place(DOWN)
player.on_chat("ziel", on_ziel)`,
    blocks: [{ kind: 'onChat', word: 'ziel', body: [
      { kind: 'agent.teleportToPlayer' },
      { kind: 'agent.setItem', block: 'planks_oak', count: 64, slot: 1 },
      { kind: 'while', cond: { not: { kind: 'agent.detect', what: 'block', dir: 'forward' } }, body: [
        { kind: 'if', cond: { kind: 'agent.detect', what: 'block', dir: 'down' },
          body: [{ kind: 'agent.move', dir: 'forward', n: 1 }],
          elseBody: [{ kind: 'agent.place', dir: 'down' }] },
      ] },
    ] }],
    exercises: [
      { type: 'type', code: 'while not agent.detect(AgentDetection.___, ___):\n    if agent.detect(AgentDetection.BLOCK, DOWN):\n        agent.move(FORWARD, 1)\n    else:\n        agent.place(DOWN)',
        gaps: [{ accept: ['REDSTONE'] }, { accept: ['DOWN'] }] },
      { type: 'findbug', lines: [
        'while agent.detect(AgentDetection.BLOCK, FORWARD):',
        '    if agent.detect(AgentDetection.BLOCK, DOWN):',
        '        agent.move(FORWARD, 1)',
        '    else:',
        '        agent.place(DOWN)',
      ], wrong: 0 },
    ],
  },
```

`ETAPPEN`: `gold.stations = ['s10', 's11', 's12']`.

- [ ] **Step 3: `content/de.js` s12**

```js
    s12: {
      story: [
        { who: 'dani', mood: 'nachdenklich', text: 'Diese Bahn ist lang. Muss ich wieder Löcher zählen?' },
        { who: 'nour', mood: 'erklaerend', text: 'Musst du nicht. while heißt: solange.' },
        { who: 'dani', mood: 'fragend', text: 'Solange was?' },
        { who: 'nour', mood: 'erklaerend', text: 'Solange vorn keine Wand ist, macht der Agent weiter.' },
        { who: 'nour', mood: 'erklaerend', text: 'not dreht die Bedingung um. Aus wahr wird falsch.' },
        { who: 'dani', mood: 'ueberrascht', text: 'Ohne Zahl? Der Agent weiß selbst, wann Schluss ist!' },
        { who: 'nour', mood: 'begeistert', text: 'Genau. Die Wand sagt ihm, wann er fertig ist.' },
      ],
      concept: [
        'while wiederholt, solange die Bedingung wahr ist.',
        'not dreht eine Bedingung um: wahr wird falsch, falsch wird wahr.',
        'while not agent.detect(AgentDetection.BLOCK, FORWARD) heißt: solange vorn kein Block ist.',
        'Achtung: Kommt nie eine Wand, läuft das Programm immer weiter.',
      ],
      tips: [
        'Frage: Wann soll der Agent aufhören?',
        'Richtung: Er macht weiter, solange vorn kein Block ist. Dafür brauchst du not.',
        'Gerüst: while not agent.detect(AgentDetection.___, ___):',
      ],
    },
```

- [ ] **Step 4: `i18n/de.js` s12 + Glossar**

```js
    s12: {
      title: 'Solange',
      storyShort: 'Die lange Bahn hat viele Löcher. Mit while macht der Agent weiter, solange vorn keine Wand ist. Du musst nicht mehr zählen.',
      bridge: {
        game: 'Du tippst ziel. Der Agent läuft, bis vorn eine Wand ist.',
        code: 'while wiederholt, solange die Bedingung wahr ist. not dreht sie um.',
      },
      tasks: [
        { kind: 'auftrag', title: 'Bis zur Wand', text: 'Stell dich auf den Goldblock der Bahn Ziel. Schau nach Süden. Schreibe ziel. Schalte auf Python: Finde die Zeile mit while.' },
        { kind: 'nochEiner', title: 'Ohne Zählen', text: 'Lauf mit ziel über die Bahn Löcher. Brauchst du dort noch eine Zahl?' },
        { kind: 'remix', title: 'Deine Bahn', text: 'Bau eine eigene Bahn mit Löchern und einer Wand. Zeig sie deinem Partner oder deiner Partnerin.' },
      ],
      tipSolution: 'while not agent.detect(AgentDetection.BLOCK, FORWARD): Der Agent macht weiter, solange vorn kein Block ist.',
      exercises: [
        { prompt: 'Der Agent soll auf einem Redstone-Block stehen bleiben. Er prüft den Block unter sich.' },
        { prompt: 'Der Agent läuft gar nicht los. Welche Zeile ist falsch?', explain: 'Das not fehlt. Vorn ist frei, die Bedingung ist falsch. while läuft kein einziges Mal.' },
      ],
      quiz: [
        { q: 'Was heißt while?', answers: [
          { text: 'Solange', correct: true },
          { text: 'Sonst', correct: false },
          { text: 'Wenn', correct: false },
        ] },
        { q: 'Was macht not?', answers: [
          { text: 'Es dreht die Bedingung um', correct: true },
          { text: 'Es stoppt den Agent', correct: false },
          { text: 'Es löscht einen Block', correct: false },
        ] },
        { q: 'Wann hört while not agent.detect(AgentDetection.BLOCK, FORWARD) auf?', answers: [
          { text: 'Wenn vorn ein Block ist', correct: true },
          { text: 'Nach 20 Durchläufen', correct: false },
          { text: 'Nie', correct: false },
        ] },
        { q: 'Was passiert, wenn nie eine Wand kommt?', answers: [
          { text: 'Das Programm läuft immer weiter', correct: true },
          { text: 'Der Agent baut eine Wand', correct: false },
          { text: 'Es hört nach 10 Durchläufen auf', correct: false },
        ] },
      ],
      bossCheck: {
        title: 'Boss-Check Gold',
        subtitle: 'Der unbekannte Parcours',
        task: 'Stell dich auf den Goldblock der letzten Bahn. Schau nach Süden. Schreibe ziel. Der Agent läuft am Redstone vorbei. Ändere die Bedingung in Python. Er soll auf dem Redstone stehen bleiben. Schreib drei Sätze: Was prüft deine Bedingung? Warum lief das alte Programm vorbei? Was passiert, wenn kein Redstone kommt?',
      },
    },
```

Glossar (`de.glossary`, hinter `zaehler`): `bedingung: { term: 'Bedingung', short: 'Eine Frage mit der Antwort wahr oder falsch.' }`, `verzweigung: { term: 'Verzweigung', short: 'if und else: Genau einer von zwei Wegen läuft.' }`, `solange: { term: 'Solange-Schleife', short: 'while wiederholt, solange die Bedingung wahr ist.' }`, `detect: { term: 'detect', short: 'Der Agent prüft, ob neben ihm ein Block ist.' }`.

Die fünf übersetzten Bündel bekommen `stations.s12` und die vier Glossar-Schlüssel als deutsche Platzhalter mit Vermerk (wie Task 5). `etappen.gold.badge` existiert schon in allen Bündeln — nur prüfen.

- [ ] **Step 5: `src/assets/badges/gold.svg`** — 200×200, flach, kein Text: Goldbarren als abgeschrägter Quader (`#f5c542` Deckfläche, `#d9a21b` Seite, `#8a6410` Kontur) auf dem dunklen Kreis von `eisen.svg` (Aufbau von dort übernehmen, nur Motiv und Farben tauschen). `content.test.js` verlangt die SVG, sobald `s12.bossCheck` existiert.

- [ ] **Step 6: Grün sehen** — `npm test`; Dev-Server `#/station/s12` und Startseite (Etappe Gold zeigt drei Stationen, Boss-Check-Karte).

- [ ] **Step 7: Commit** `feat(content): station DS 12, boss check Gold, glossary, badge icon` (stagen: `src/data/stations.js`, `src/content/de.js`, sechs `src/i18n/*.js`, `src/assets/badges/gold.svg`, `tests/course-def.test.js`, `tests/parcours-sim.test.js`).

---

### Task 7: Box-Bau Gold, Postbuild, Lernenden-Text

**Files:**
- Modify: `moodle/badges/gold.png` (generiert), `moodle/registry.json` (durch Bau), `moodle/smoke-learner.mjs` (`BOSS_TEXT.gold`)
- Test: `tests/postbuild.test.js` (vierte Etappe im Fake)

**Interfaces:**
- Consumes: `ETAPPEN[gold].badge = { key: 'badge-gold', icon: 'gold.png' }` (existiert), Register-Schlüssel aus Task 5–6, `gold.svg` aus Task 6.
- Produces: Box-Kurs 10 mit Abschnitt 5 „Gold" (Labels, Quizze, Aufgabe `boss-gold`), Badge Gold aktiv; `moodle/badges/gold.png`.

- [ ] **Step 1: Failing test** in `tests/postbuild.test.js` — die Fake-ETAPPEN um `{ id: 'gold', stations: ['s10', 's11', 's12'], badge: { key: 'badge-gold', icon: 'gold.png' } }` und die Fake-Stationen um `s12: { bossCheck: { key: 'boss-gold' } }` erweitern; erwartet: vier Badge-Specs, Kriterien von Gold = `[s10-quiz, s11-quiz, s12-quiz, boss-gold]` in dieser Reihenfolge. Ist der Test sofort grün, bleibt er als Regressionsschutz (im Report vermerken).
- [ ] **Step 2: Badge-PNG** — `node scripts/badge-icons.mjs` → `moodle/badges/gold.png`. Exitcode 1 wegen der noch fehlenden SVGs von Diamant bis Enderdrache ist erwartet (Plan-3-Statuskasten); `gold.png` muss trotzdem entstehen. Im Report die Ausgabe zitieren.
- [ ] **Step 3: `BOSS_TEXT.gold`** in `moodle/smoke-learner.mjs`: `'Meine Bedingung prueft, ob unter dem Agent ein Redstone-Block liegt. Das alte Programm hat nur auf eine Wand vorn geachtet und lief deshalb am Redstone vorbei. Kommt kein Redstone, laeuft der Agent bis zur Wand und macht dort endlos weiter.'`
- [ ] **Step 4: Box bauen** (Box mit allen drei Compose-Dateien, Dev-Server läuft): `npm run moodle:build` → Abschnitt 5 mit sieben neuen Items; zweiter Lauf: alles „unverändert"; `bash moodle/apply-completion.sh`; `npm run moodle:postbuild` zweimal (Badge Gold angelegt, dann „unverändert"). HTTP 429 vom Box-MCP: kurz warten, denselben Befehl wiederholen (idempotent). Register-Ausgabe (CMIDs) in den Report.
- [ ] **Step 5: `npm test` grün; Commit** `feat(moodle): Gold section in the box course, badge icon and criteria` (stagen: `moodle/badges/gold.png`, `moodle/registry.json`, `moodle/smoke-learner.mjs`, `tests/postbuild.test.js`).

---

### Task 8: Bauplan Parcours und Lehrkraft-Seiten DS 10–12

**Files:**
- Modify: `content/lehrkraft/01-welt-ankunft.md` (Abschnitt „Parcours"), `tests/lehrkraft-pages.test.js`
- Create: `content/lehrkraft/ds10.md`, `ds11.md`, `ds12.md`

**Interfaces:**
- Consumes: `pagesFromMarkdown(lehrkraftDir)` aus `moodle/course-def.mjs`; Bahndaten aus `scripts/minecraft/parcours.json` (Task 4) — die Tabelle im Bauplan nennt dieselben Zahlen.

- [ ] **Step 1: Failing test** an `tests/lehrkraft-pages.test.js` anhängen:

```js
test('Lehrkraft-Seiten DS 10-12 existieren, der Bauplan kennt den Parcours', () => {
  const pages = pagesFromMarkdown(path.resolve('content/lehrkraft'));
  for (const stem of ['ds10', 'ds11', 'ds12']) {
    const p = pages.find((x) => x.stem === stem);
    expect(p, stem).toBeDefined();
    expect(p.title).toMatch(/^DS 1[012] /);
    expect(p.html).toMatch(/<pre>/);
  }
  const welt = pages.find((x) => x.stem === '01-welt-ankunft');
  expect(welt.html).toMatch(/Parcours/);
  expect(welt.html).toMatch(/parcours/);
  expect(welt.html).toMatch(/REDSTONE_BLOCK|Redstone-Block/);
  expect(welt.html).not.toMatch(/Norden \(\+z\)/);
});
```

Rot sehen.

- [ ] **Step 2: Bauplan** `01-welt-ankunft.md`: neuer Abschnitt `## Parcours (Etappe Gold, ab z=56)` mit
  - Satz: „Befehl `parcours` im Bauskript; additiv, auch auf einer gebauten Welt. Die Zahlen stehen in `scripts/minecraft/parcours.json`, ein Test hält Skript und Datei gleich."
  - Tabelle der vier Bahnen (Spalten wie „Erkundungsgebiet": Bahn, Quader (`world`), Material, Goldmarke, Schild-Text, Schild-Position). Schild-Texte (drei oder vier kurze Zeilen, `<br>`): Ecke „DS 10<br>ecke<br>Blick nach Süden" bei (−22, 5, 55); Löcher „DS 11<br>loecher<br>Blick nach Süden" bei (−5, 5, 55); Ziel „DS 12<br>ziel<br>Blick nach Süden" bei (3, 5, 55); Boss **kein Schild mit Zahlen**, nur „Boss-Check<br>Blick nach Süden" bei (11, 5, 55).
  - Rechnung, belegt durch `tests/parcours-sim.test.js`: Ecke — 10 Schritte nach Süden, Drehung nach Osten, 10 Schritte, zusammen 20 Durchläufe, Ende über (−11, 4, 66). Löcher — 10 Schritte + 4 Blöcke = 14 Durchläufe; mit `range(10)` endet der Agent bei z=63, das Loch bei z=64 bleibt offen. Ziel — `while not` endet bei z=76 vor der Wand z=77. Boss — `ziel` unverändert endet bei z=78 vor der Sicherheitswand; mit `REDSTONE, DOWN` auf dem Redstone bei z=68.
  - Hinweis: Die Bahnen haben keine Decke; wer über die Wand springt, verlässt die Bahn. Der Agent fällt über Löchern nicht (im Spiel prüfen, Nachtrag Abschnitt 5 Punkt 2).
- [ ] **Step 3: Stundenverläufe** `ds10.md`, `ds11.md`, `ds12.md` im Format von `ds07.md` (Ziel; Ablauf-Tabelle 5/10/45/20/5; Was die Lehrkraft sagt und zeigt; Typische Fehler und Hilfen; Lösungen mit vollständigem Python für Auftrag und „Noch einer"). Inhalte:
  - **DS 10:** Bedingung als Ja/Nein-Frage an der Tafel („Ist vorn ein Block? ja → drehen"); Einrückung zeigt, was zu `if` gehört. Typische Fehler: `agent.move` unter `if` eingerückt (Agent bleibt stehen), `DOWN` statt `FORWARD`, nicht auf der Goldmarke gestartet, nicht nach Süden geschaut. „Noch einer" (Rechtsknick): `RIGHT_TURN`.
  - **DS 11:** Tafelbild „ein Durchlauf = ein Schritt ODER ein Block"; Zählen am Beispiel 10 Felder + 4 Löcher = 14. Modus „Zahl in Python ändern": im Editor umschalten, Zahl ändern, zurück zu Blöcken, Block zeigt die neue Zahl. Typische Fehler: 10 statt 14, Zweige vertauscht, `FORWARD` statt `DOWN` (Agent bleibt auf dem Goldblock).
  - **DS 12:** `while` gegen `for` (Zahl bekannt → `for`; Ende bekannt → `while`); `not` als Umkehr (wahr ↔ falsch). **Endlosschleife stoppen:** im Code Builder den Stopp-Knopf benutzen (genauen Namen im Spiel prüfen, Nachtrag Abschnitt 5 Punkt 7). Typische Fehler: `not` vergessen (Agent läuft nicht los), Bahn ohne Wand (läuft endlos).
  - **Boss-Check-Bewertung Gold** (in `ds12.md`): bestanden, wenn der Agent im Spiel auf dem Redstone steht (Screenshot oder Share-Link) und die drei Sätze sagen: (1) die Bedingung prüft Redstone unter dem Agent, (2) das alte Programm prüfte nur die Wand vorn, (3) ohne Redstone läuft er bis zur Sicherheitswand und hört nicht auf.
- [ ] **Step 4: `npm test` grün; Commit** `docs(lehrkraft): parcours build plan, lesson plans DS 10-12` (stagen: die vier Markdown-Dateien, `tests/lehrkraft-pages.test.js`).

---

### Task 9: Übersetzung Gold

**Files:**
- Modify: `scripts/translate.mjs` (`MAGIC_WORDS`, `IDENT_CANON`), `tests/i18n-complete.test.js` (dieselben Listen), `src/i18n/{en,uk,ar,es,it}.js` (generiert), `tests/glossary-terms.test.js` (Pins)

**Interfaces:**
- Consumes: Chunk-Cache aus Plan 3 (`scripts/lib/translate-chunks.mjs`, `// chunkHashes:`-Zeile in jedem Bündel); Stationen und Glossar aus Task 5–6; `ui`-Schlüssel aus Task 2.
- Produces: `MAGIC_WORDS = [...bestehend, 'ecke', 'loecher', 'ziel']`; `IDENT_CANON = ['laenge', 'stufen', 'index', 'pos', 'fill', 'if', 'else', 'while', 'not', 'detect']` in beiden Dateien gleich.

- [ ] **Step 1: Kanon** in `scripts/translate.mjs` und `tests/i18n-complete.test.js` erweitern (Kommentar „Plan 4 (Gold, 17.09.2026): ecke, loecher, ziel; if, else, while, not, detect"). Prompt-Regel 1 um den Satz ergänzen: „`ziel` is a chat command only where the sentence is about typing it; the German noun Ziel is translated normally." `npm test` muss mit den Platzhaltern aus Task 5/6 grün bleiben (deutsche Kopien enthalten die Wörter).
- [ ] **Step 2: Plan ansehen** — `node scripts/translate.mjs --lang all --plan`. Erwartet je Sprache nur die Chunks `ui`, `glossary`, `stations.s10`, `stations.s11`, `stations.s12`; Holz bis Eisen „übernommen". Weicht die Liste ab (z. B. `stations.s08` wegen einer Plan-3-Handkorrektur), **nicht** laufen lassen, sondern im Report klären. Die Platzhalter-Chunks zählen als geändert, weil ihr Hash nicht zur Zeile `chunkHashes` passt — das ist gewollt.
- [ ] **Step 3: Lauf** — `node scripts/translate.mjs --lang all` (Kostenzeile vor dem Lauf lesen; Erwartung 1,2–1,8 USD, Deckel 3 USD; über dem Deckel abbrechen und melden). Die Platzhalter-Vermerke verschwinden mit den generierten Chunks; die Handübersetzungen der `ui`-Schlüssel aus Task 2 ersetzt der `ui`-Chunk.
- [ ] **Step 4: `npm test`** — `i18n-complete` (Schlüssel, Zauberwörter inkl. `ecke`/`loecher`/`ziel`, Bezeichner inkl. `if`/`else`/`while`/`not`/`detect`, ar-Ziffern), `etappen-names`, `glossary-terms`. Scheitert ein Wort: Handkorrektur mit Datumsvermerk; nur den betroffenen Chunk mit `--chunk stations.s1x --lang <code> --force` neu, kein Volllauf.
- [ ] **Step 5: Glossar pinnen** — `tests/glossary-terms.test.js` EXPECTED für es/uk um `bedingung`, `verzweigung`, `solange`, `detect` erweitern (Werte aus dem Lauf; `detect` bleibt `detect`).
- [ ] **Step 6: Stichprobe** je Sprache (Titel s11, Boss-Check-Text s12, `typeCase`) im Report; Kosten aus dem Kostenlog in den Report. Commit `feat(i18n): Gold stations in six languages` (stagen: `scripts/translate.mjs`, fünf generierte Bündel, `tests/i18n-complete.test.js`, `tests/glossary-terms.test.js`).

---

### Task 10: Smokes erweitern (App, Box, Lernender)

**Files:**
- Modify: `scripts/smoke.mjs`, `moodle/smoke-box.mjs`

**Interfaces:**
- Consumes: `.exercise.type` und `data-testid="type-gap-<g>"`/`type-check` (Task 2), Register-Schlüssel Abschnitt 5 (Task 7), `de.etappen.gold.badge.name`, `uk.stations.s12.bossCheck.title` (Task 9).

- [ ] **Step 1: App-Smoke** — `EXERCISE_TYPES` um `'type'` erweitern. Zusätzlich für s11: Tipp-Durchlauf im echten Browser — `type-gap-0` mit `STATIONS.s11.exercises[0].gaps[0].accept[0]` füllen, `type-check` klicken, `role=status` der Tipp-Lücke (`.exercise.type [role="status"]`) enthält `de.ui.typeRight`; danach `redstone` klein in s12 `type-gap-0` und `DOWN` in `type-gap-1` → Status enthält `de.ui.typeCase`. Kommentar wie beim s07-Durchlauf: Feedback ist in jeder Sprache Deutsch (Plan-2-Entscheidung 2).
- [ ] **Step 2: Box-Smoke** — Abschnitts-Liste um `['Gold', 5]`; Badge-Anzahl 4 und vierter Check `Badge Gold auf Badge-Seite`; Boss-Check-Aufgabe Gold auf uk (`uk.stations.s12.bossCheck.title` auf der Seite von `boss-gold`) nach dem Muster von Eisen.
- [ ] **Step 3: Lernenden-Smoke** — `npm run moodle:smoke:learner -- --etappe gold` (Reset, drei Quizze mit 100 %, Boss-Abgabe, Badge Gold ohne Override). Ausgabe in den Report.
- [ ] **Step 4: Läufe** — `npm run smoke` (Station × Sprache: 72 Checks), `npm run moodle:smoke` (erwartet 19 Checks: 16 bisher +Abschnitt Gold, +Badge Gold, +Boss Gold uk — genaue Zahl aus dem Lauf in den Report) je einmal grün. Commit `test(smoke): type exercise, Gold section and badge, learner path gold`.

---

### Task 11: Gesamtlauf, Höhen, Doku, Übergabe

**Files:**
- Modify: `src/data/stations.js` (`iframeHeight` s10–s12 und gestapelte Stationen gemessen), `README.md` (Stand, Offen für Dirk), `docs/lehrkraft-probelauf.md` (Abschnitt Gold), `docs/plans/2026-09-17-code-welt-04-gold.md` (Statuskasten), `docs/station-s10.png` … `s12.png` (neu), `docs/station-s08.png`/`s09.png` (falls gestapelt)

- [ ] **Step 1: Höhen messen** — `node scripts/measure-heights.mjs`; die empfohlenen Werte (+15 %, auf 50 gerundet) für s10–s12 und für jede Station, deren Wert sich durch Task 3 ändert, in `stations.js` eintragen, Kommentar „gemessen <Datum>"; Box neu bauen (Labels ändern sich): Rebuild-Folge aus den Global Constraints.
- [ ] **Step 2: Drei Läufe** — `npm run smoke` ×3, `npm run moodle:smoke` ×3, `npm run moodle:smoke:learner -- --etappe gold` ×1 sowie `--etappe eisen` ×1 und `--etappe holz` ×1 (unverändert), `npm test`. Ergebnisse in den Report.
- [ ] **Step 3: Screenshots** `docs/station-s10.png`–`s12.png` (900 px, de, volle Seite; Muster in README „Screenshots"); `s08`/`s09` neu, wenn sie jetzt gestapelt sind. README-Liste ergänzen.
- [ ] **Step 4: Doku**
  - README „Stand": Plan 4 fertig (drei Stationen, Tipp-Lücke, Bedingungs-Blöcke, gestapelte Hauptansicht, Parcours mit Simulator, Boss-Check und Badge Gold, Übersetzungskosten).
  - README „Offen für Dirk", ausdrücklich als offener DoD-Punkt: Prüfliste Nachtrag Plan 4 Abschnitt 5 (sieben Punkte) und weiterhin Plan 3 Abschnitt 5; Welt um `parcours` erweitern, Schilder setzen, `.mcworld` neu exportieren; Probelauf Gold. Satz: „Ändert die Prüfung Python oder Stütztexte von s10–s12, diese Chunks neu übersetzen (`npm run translate -- --lang all --chunk stations.s10,stations.s11,stations.s12`)."
  - `docs/lehrkraft-probelauf.md`: Abschnitt „Etappe Gold" (Reset-Befehl, Reihenfolge s10→s11→s12→Boss, worauf achten: Blick nach Süden, `range(10)` scheitert absichtlich, Tipp-Lücke „Fast" bei Kleinschreibung, Endlosschleife stoppen, Redstone-Erkennung).
  - Statuskasten oben in dieser Datei („Stand: umgesetzt bis auf Dirks Prüfliste", Abweichungen aus den Task-Reports, u. a. s11-Fehlersuche).
- [ ] **Step 5: Commit** `docs: plan 4 wrap-up, measured heights, Gold screenshots`. Push erst nach dem Gesamtreview (Controller).

---

## Definition of Done

- Drei Stationen s10–s12 in sechs Sprachen, drei Quizze, Boss-Check Gold als Aufgabe, Badge Gold mit Icon; Verleihung über den echten Lernpfad nachgewiesen (`--etappe gold`).
- `TypeGap` mit eigenen Tests, auch für „Fast" bei falscher Groß-/Kleinschreibung; Block-Ansicht mit Sechseck-Bedingung, `not` und `else`; Konsistenztest deckt `if`, `else:`, `while`; breite Blöcke gestapelt, 750-px-Check grün.
- `parcours.json`, Simulator-Test (Achsen mit Mutationsprobe, alle vier Bahnen, Bindung an `STATIONS` und an die Tipp-Lücken-Antworten) und Skript-Abgleich grün; Bauplan-Abschnitt Parcours und Befehl `parcours` (Syntax per `py_compile`); `ds10–ds12.md`; Probelauf-Abschnitt Gold.
- `iframeHeight` für s10–s12 (und gestapelte Stationen) gemessen; Bauskript zweimal idempotent; Box-Smoke und App-Smoke je dreimal grün; Holz bis Eisen unverändert (Lernenden-Pfade Holz und Eisen grün).
- Übersetzung protokolliert, unter 3 USD; Kanon-Tests (Zauberwörter inkl. `ecke`/`loecher`/`ziel`, Bezeichner inkl. `if`/`else`/`while`/`not`/`detect`) grün; Glossar-Pins um vier Begriffe erweitert.
- README, Probelauf-Doku und Plan-Statuskasten aktuell; **Dirks Prüfliste (Nachtrag Plan 4 Abschnitt 5) und Probelauf Gold ausdrücklich als offene Punkte benannt.**
