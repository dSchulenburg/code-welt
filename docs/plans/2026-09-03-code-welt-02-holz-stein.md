# Code-Welt · Plan 2 von 6: Holz und Stein — Implementation Plan

> **Stand 04.09.2026: umgesetzt.** Abweichungen gegenüber diesem Plan: s05-Programm mit einem
> Schritt nach den zwei Drehungen (Geometrie, sonst wird aus der Wand eine Treppe), Remix „Zinne"
> statt der ursprünglichen Idee, Boss-Check 8 pro Seite, Titel kurz gehalten (Untertitel steht
> fett am Anfang der Intro), Lehrkraft-Abschnitt Ordner vor Seiten, `iframeHeight` gemessen statt
> geschätzt (Final-Review-Fix A). Details siehe `README.md` (Abschnitt „Stand") und das Ledger
> in `.superpowers/sdd/2026-09-03-code-welt-02-holz-stein/progress.md`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die ersten beiden Etappen komplett: sechs Stationen (DS 1–6) in sechs Sprachen mit eigener Block-Ansicht, Boss-Checks, Badges, Forum, Lehrkraft-Abschnitt, Charaktere, Weltbauplan, gehärtete Smokes, bereit für Dirks Probelauf in der Box.

**Architecture:** Alles baut auf dem Fundament (Plan 1) auf: Stationen sind Daten in drei Dateien (`src/data/stations.js` Struktur, `src/i18n/de.js` Stütze, `src/content/de.js` Leit-Ebene); das Bauskript legt daraus den Box-Kurs an. Neu sind eine SVG-Block-Ansicht aus einer Blockbeschreibung, zwei weitere Item-Typen im Bauskript (Aufgabe, Seite, Ordner) und zwei PHP-Skripte im Container für das, was der MCP nicht kann (Forum, Badges).

**Tech Stack:** wie Plan 1 (React 18, Vite 6, Vitest 3, playwright-core + Edge, `@anthropic-ai/sdk`, Moodle-MCP der Box, PHP im Container `ki-kurs-moodle`); neu: `marked` (Markdown → HTML für Lehrkraft-Seiten), `sharp` (SVG → PNG für Badge-Icons), Media Factory `ai-image` (Nano Banana) für Charaktere.

**Spec:** `docs/specs/2026-09-02-code-welt-minecraft-kurs-design.md` (Hauptspec) und `docs/specs/2026-09-03-code-welt-plan2-nachtrag.md` (Entscheidungen 1–12, Datenmodell, DoD). Der Nachtrag hat bei Widerspruch Vorrang.

## Global Constraints

- Repo `C:\Users\mail\entwicklung\code-welt`, Branch `main`; Box-Infrastruktur bleibt im docker-Repo unangetastet. Vor jedem Commit `git branch --show-current`.
- Sprachen `de, en, uk, ar, es, it`; `de` kanonisch; Stütz-Ebene `src/i18n/de.js` wird komplett übersetzt, Leit-Ebene `src/content/de.js` nie.
- Einfache Sprache A2–B1 in allen deutschen Texten: Sätze bis 12 Wörter, Präsens, ein Gedanke pro Satz, keine Nebensatzketten, Code-Wörter unverändert.
- Story-Figuren: Nour (war letztes Jahr im Kurs, erklärt, ermutigt), Dani (neu, fragt, macht typische Fehler, feiert). Der Agent spricht nie.
- Python-Beispiele folgen der MakeCode-Python-API (`player.on_chat`, `agent.teleport_to_player`, `agent.set_item`, `agent.move(FORWARD|BACK|UP|DOWN, n)`, `agent.turn(LEFT_TURN|RIGHT_TURN)`, `agent.place(DIR)`, `for index in range(n):`), sind als **Entwurf** markiert und werden von Dirk im Browser-Editor gegengeprüft (Kommentar im Code wie in Plan 1).
- Block-Ansicht: Farben und Labels exakt aus der Tabelle in Task 2; Blocktext Monospace 600 12pt; Dropdown-Pille im dunkleren Kategorieton, freie Zahl/Text weiß.
- Multilang in Moodle: sechs `{mlang}`-Blöcke plus `{mlang other}` Deutsch; HTML-Felder mit `toEntities`, Klartextnamen mit echten Umlauten; Quizfragen über das Einzelfragen-Tool.
- Bauskript idempotent (Inhalts-Hashes, Reihenfolge per `moodle_move_module`); Register `moodle/registry.json[box]`; Neu-Anlegen eines Quiz/einer Aufgabe bei Hash-Änderung, danach `bash moodle/apply-completion.sh`.
- Kostenpflichtige Bildgenerierung nur mit Kostenanzeige vor dem Lauf, Deckel **5 USD** gesamt, Protokoll in `_assets/media-factory/cost-log.jsonl` des docker-Repos (Media-Factory-Konvention).
- Tests grün vor jedem Commit (`npm test`); Commit-Trailer:
  ```
  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_019PenMpZcTxKvhNptZMbVVE
  ```
- Kein Deploy, kein Produktions-Moodle.

---

## Dateistruktur

| Datei | Verantwortung |
|---|---|
| `src/lib/bilingual.js` | `pair(de, support)` → „de · support" oder nur de |
| `src/lib/blocks.js` | Blockmodell: `BLOCK_SPECS` (Kategorie, Label-Vorlage, Slots), `flattenBlocks(tree)` für Tests, `blocksToProgram(tree)` → Befehle für `simulate` |
| `src/components/BlockView.jsx` | SVG-Renderer der Blockbeschreibung |
| `src/data/stations.js` | + `blocks`, `iframeHeight`, `bossCheck`, `ETAPPEN[].badge`, Stationen s01, s03–s06 |
| `src/i18n/de.js` | + Stationen, `bossCheck`-Texte, `etappen.*.badge`, neue ui-Schlüssel |
| `src/content/de.js` | + Story/Konzept/Tipps der fünf neuen Stationen, `mood` je Dialogzeile |
| `src/assets/characters/{nour,dani}-{erklaerend,fragend,begeistert,nachdenklich,ueberrascht}.png` | Charakterposen |
| `src/assets/badges/{holz,stein}.svg` + generierte `.png` | Badge-Icons |
| `content/lehrkraft/{setup,welt-ankunft,ds01…ds06}.md` | Lehrkraft-Seiten |
| `scripts/minecraft/welt-ankunft-bau.py` | MakeCode-Python-Bauskript für die Startzone |
| `scripts/badge-icons.mjs` | SVG → PNG (sharp) |
| `scripts/characters.mjs` | Charaktergenerierung über die Media Factory (Kostenanzeige, Referenzbild-Verfahren) |
| `moodle/course-def.mjs` | + Items `assignment`, `page`, `folder`; Etappen-Boss-Checks; Lehrkraft-Seiten aus Markdown |
| `moodle/build-course.mjs` | + Handler für `assignment`, `page`, `folder` |
| `moodle/php/create-forum.php`, `moodle/php/create-badges.php`, `moodle/php/test-student.php` | Forum, Badges, Testkonto |
| `moodle/apply-php.sh` | Wrapper: PHP-Datei in den Container kopieren und ausführen |
| `moodle/smoke-box.mjs` | gehärtet + Reihenfolge, Forum, Aufgabe, Badge |
| `tests/*.test.js(x)` | neue Tests je Task |

---

### Task 1: Zweisprachige Überschriften und Fortschritt

**Files:**
- Create: `src/lib/bilingual.js`
- Modify: `src/components/StoryPanel.jsx`, `ConceptCard.jsx`, `TaskCard.jsx`, `TipLadder.jsx`, `StationView.jsx`, `Home.jsx`, `Spielstand.jsx`
- Test: `tests/bilingual.test.js`, `tests/station.test.jsx` (Ergänzung)

**Interfaces:**
- Produces: `pair(de, support)`: gibt `de` zurück, wenn `support` fehlt oder gleich `de` ist, sonst `` `${de} · ${support}` ``. Komponenten bekommen `sui` (Stütz-`ui` oder `null`) und rendern Überschriften mit `pair(ui.x, sui?.x)`.
- Buttons (`parsonsCheck`, `spielstandSave`, `next`, `prev`, `supportShow/Hide`) bleiben deutsch.

- [ ] **Step 1: Failing tests**

`tests/bilingual.test.js`:
```js
import { pair } from '../src/lib/bilingual.js';

test('pair haengt die Stuetze mit Mittelpunkt an', () => {
  expect(pair('Die Geschichte', 'Історія')).toBe('Die Geschichte · Історія');
});
test('pair laesst gleiche oder fehlende Stuetze weg', () => {
  expect(pair('Check', 'Check')).toBe('Check');
  expect(pair('Check', undefined)).toBe('Check');
  expect(pair('Check', null)).toBe('Check');
});
```

In `tests/station.test.jsx` ergänzen:
```jsx
test('mit Stuetzsprache sind Ueberschriften zweisprachig, Buttons deutsch', () => {
  render(<StationView id="s02" lang="uk" />);
  const h2 = screen.getByRole('heading', { name: /Die Geschichte · / });
  expect(h2).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Prüfen' })).toBeInTheDocument();
});
test('auf Deutsch bleiben Ueberschriften einsprachig', () => {
  render(<StationView id="s02" lang="de" />);
  expect(screen.getByRole('heading', { name: 'Die Geschichte' })).toBeInTheDocument();
});
```

Run: `npm test` → FAIL (Modul fehlt, Überschrift nicht zweisprachig).

- [ ] **Step 2: `src/lib/bilingual.js`**

```js
// Zweisprachige Beschriftung fuer Ueberschriften: "Deutsch · Stuetze".
// Buttons bleiben deutsch (Nachtrag Plan 2, Entscheidung 2).
export function pair(de, support) {
  if (!support || support === de) return de;
  return `${de} · ${support}`;
}
```

- [ ] **Step 3: Komponenten**

`StationView.jsx`: `const sui = support?.ui || null;` an alle Karten `sui={sui}` durchreichen; Überschrift der Check-Karte `pair(ui.checkHeading, sui?.checkHeading)`; Crumb `pair(de.etappen[e].name, support?.etappen[e]?.name)` und `format(pair(ui.ds, sui?.ds), { n })`.

`StoryPanel.jsx`: `<h2 id="story-h">{pair(ui.storyHeading, sui?.storyHeading)}</h2>`. Analog `ConceptCard` (`conceptHeading`, `bridgeGame`, `bridgeCode`, `blocksLabel`, `pythonLabel`), `TaskCard` (`tasksHeading`; Aufgabenart `pair(ui[LABEL[t.kind]], sui?.[LABEL[t.kind]])`), `TipLadder` (`tipsHeading`, `tipStep`, `tipSolution`), `Spielstand` (`spielstandHeading`, `spielstandPrompt`), `Home` (`progress` per `format(pair(ui.progress, sui?.progress), {...})` — dazu braucht `Home` `lang` als Prop und `getBundle`).

`import { pair } from '../lib/bilingual.js';` in jeder Komponente.

- [ ] **Step 4: Tests grün, Commit**

Run: `npm test` → alle grün (68 + 4).
```bash
git add -A && git commit -q -m "feat(ui): bilingual headings and progress (German · support), buttons stay German" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_019PenMpZcTxKvhNptZMbVVE"
```

---

### Task 2: Block-Ansicht

**Files:**
- Create: `src/lib/blocks.js`, `src/components/BlockView.jsx`
- Modify: `src/data/stations.js` (s02 bekommt `blocks`), `src/components/ConceptCard.jsx` (BlockView statt „Block-Bild folgt", PNG hat Vorrang), `src/styles.css`
- Test: `tests/blocks.test.js`, `tests/blockview.test.jsx`

**Interfaces:**
- Blockbeschreibung (in `STATIONS[id].blocks`, ein Array von Hut-Blöcken):
  ```js
  { kind: 'onChat', word: 'weg', body: [
    { kind: 'agent.teleportToPlayer' },
    { kind: 'agent.setItem', block: 'grass', count: 64, slot: 1 },
    { kind: 'agent.move', dir: 'forward', n: 1 },
    { kind: 'agent.place', dir: 'back' },
    { kind: 'agent.turn', dir: 'left' },
    { kind: 'repeat', n: 10, body: [ … ] },
    { kind: 'for', varName: 'index', to: 9, body: [ … ] },
  ] }
  ```
- `BLOCK_SPECS[kind] = { cat, label }` mit `label` als Array aus Strings und Slots `{ slot: 'dir' | 'n' | 'word' | 'block' | 'count' | 'slot' | 'varName' | 'to', kind: 'dropdown' | 'number' | 'text' | 'var' }`.
- `flattenBlocks(tree) → [{ kind, depth }]`; `blocksToProgram(tree) → ['forward 1', 'left', …]` nur für move/turn (für die Konsistenzprüfung mit `simulate`, Loops werden entrollt, Repeat-Body wiederholt).
- `BlockView({ blocks })` rendert ein SVG; jede Blockzeile hat `data-kind`, jeder Slot `data-slot`.

- [ ] **Step 1: Failing tests**

`tests/blocks.test.js`:
```js
import { BLOCK_SPECS, CATEGORY_COLORS, flattenBlocks, blocksToProgram } from '../src/lib/blocks.js';

const tree = [{ kind: 'onChat', word: 'weg', body: [
  { kind: 'agent.teleportToPlayer' },
  { kind: 'agent.move', dir: 'forward', n: 2 },
  { kind: 'repeat', n: 2, body: [{ kind: 'agent.turn', dir: 'left' }, { kind: 'agent.move', dir: 'forward', n: 1 }] },
] }];

test('Kategoriefarben sind die des Editors', () => {
  expect(CATEGORY_COLORS.agent).toEqual({ fill: '#d83b01', stroke: '#a22c01', slot: '#b83201' });
  expect(CATEGORY_COLORS.loops.fill).toBe('#569138');
  expect(CATEGORY_COLORS.player.fill).toBe('#0078d7');
});
test('jede Blockart hat Kategorie und Label', () => {
  for (const [k, s] of Object.entries(BLOCK_SPECS)) {
    expect(CATEGORY_COLORS[s.cat], k).toBeDefined();
    expect(Array.isArray(s.label), k).toBe(true);
  }
});
test('flattenBlocks liefert Reihenfolge und Tiefe', () => {
  expect(flattenBlocks(tree).map((b) => `${b.kind}@${b.depth}`)).toEqual([
    'onChat@0', 'agent.teleportToPlayer@1', 'agent.move@1', 'repeat@1', 'agent.turn@2', 'agent.move@2',
  ]);
});
test('blocksToProgram entrollt Schleifen und ignoriert Nicht-Bewegung', () => {
  expect(blocksToProgram(tree)).toEqual(['forward 2', 'left', 'forward 1', 'left', 'forward 1']);
});
test('unbekannte Blockart wirft', () => {
  expect(() => flattenBlocks([{ kind: 'nope' }])).toThrow(/nope/);
});
```

`tests/blockview.test.jsx`:
```jsx
import { render } from '@testing-library/react';
import BlockView from '../src/components/BlockView.jsx';
import { STATIONS } from '../src/data/stations.js';

test('BlockView zeichnet alle Bloecke von s02 mit englischen Labels', () => {
  const { container } = render(<BlockView blocks={STATIONS.s02.blocks} />);
  const rows = container.querySelectorAll('[data-kind]');
  expect(rows.length).toBe(10); // 1 Hut + 9 Befehle
  expect(container.textContent).toMatch(/on chat command/);
  expect(container.textContent).toMatch(/agent move/);
  expect(container.textContent).toMatch(/agent place/);
  expect(container.querySelector('[data-kind="onChat"] path').getAttribute('fill')).toBe('#0078d7');
  expect(container.querySelector('[data-kind="agent.move"] path').getAttribute('fill')).toBe('#d83b01');
});
```

Run: `npm test` → FAIL.

- [ ] **Step 2: `src/lib/blocks.js`**

```js
// Blockmodell fuer die eigene Block-Ansicht (Nachtrag Plan 2, Entscheidung 1).
// Farben und Labels stammen aus dem live gerenderten Editor minecraft.makecode.com (03.09.2026).
export const CATEGORY_COLORS = {
  player:    { fill: '#0078d7', stroke: '#005aa1', slot: '#005aa1' },
  agent:     { fill: '#d83b01', stroke: '#a22c01', slot: '#b83201' },
  loops:     { fill: '#569138', stroke: '#416d2a', slot: '#416d2a' },
  logic:     { fill: '#459197', stroke: '#346d71', slot: '#346d71' },
  variables: { fill: '#ea2b1f', stroke: '#b02017', slot: '#b02017' },
  blocks:    { fill: '#7abb55', stroke: '#5c8c40', slot: '#689f48' },
  functions: { fill: '#235789', stroke: '#1a4266', slot: '#1a4266' },
};

// label: Strings und Slots. Slot-Arten: dropdown (dunkle Pille), number/text (weisse Pille), var (rote Pille).
export const BLOCK_SPECS = {
  onChat:                  { cat: 'player', hat: true, label: ['on chat command', { slot: 'word', kind: 'text' }] },
  'agent.teleportToPlayer':{ cat: 'agent', label: ['agent teleport to player'] },
  'agent.setItem':         { cat: 'agent', label: ['agent set block or item', { slot: 'block', kind: 'dropdown' }, 'count', { slot: 'count', kind: 'number' }, 'in slot', { slot: 'slot', kind: 'number' }] },
  'agent.move':            { cat: 'agent', label: ['agent move', { slot: 'dir', kind: 'dropdown' }, 'by', { slot: 'n', kind: 'number' }] },
  'agent.turn':            { cat: 'agent', label: ['agent turn', { slot: 'dir', kind: 'dropdown' }] },
  'agent.place':           { cat: 'agent', label: ['agent place', { slot: 'dir', kind: 'dropdown' }] },
  'agent.destroy':         { cat: 'agent', label: ['agent destroy', { slot: 'dir', kind: 'dropdown' }] },
  'agent.detect':          { cat: 'agent', label: ['agent detect', { slot: 'what', kind: 'dropdown' }, { slot: 'dir', kind: 'dropdown' }] },
  repeat:                  { cat: 'loops', c: true, label: ['repeat', { slot: 'n', kind: 'number' }, 'times'] },
  for:                     { cat: 'loops', c: true, label: ['for', { slot: 'varName', kind: 'var' }, 'from 0 to', { slot: 'to', kind: 'number' }] },
  while:                   { cat: 'loops', c: true, label: ['while', { slot: 'cond', kind: 'text' }] },
  if:                      { cat: 'logic', c: true, label: ['if', { slot: 'cond', kind: 'text' }, 'then'] },
  setVar:                  { cat: 'variables', label: ['set', { slot: 'varName', kind: 'var' }, 'to', { slot: 'value', kind: 'number' }] },
  changeVar:               { cat: 'variables', label: ['change', { slot: 'varName', kind: 'var' }, 'by', { slot: 'value', kind: 'number' }] },
  fill:                    { cat: 'blocks', label: ['fill with', { slot: 'block', kind: 'dropdown' }, 'from', { slot: 'from', kind: 'text' }, 'to', { slot: 'to', kind: 'text' }] },
  function:                { cat: 'functions', hat: true, label: ['function', { slot: 'name', kind: 'text' }] },
  call:                    { cat: 'functions', label: ['call', { slot: 'name', kind: 'text' }] },
};

function assertKnown(b) {
  if (!BLOCK_SPECS[b.kind]) throw new Error(`Unbekannte Blockart: ${b.kind}`);
}

export function flattenBlocks(tree, depth = 0, out = []) {
  for (const b of tree) {
    assertKnown(b);
    out.push({ kind: b.kind, depth });
    if (b.body) flattenBlocks(b.body, depth + 1, out);
  }
  return out;
}

// Bewegungsbefehle fuer agentSim.simulate: Schleifen werden entrollt, anderes uebersprungen.
export function blocksToProgram(tree, out = []) {
  for (const b of tree) {
    assertKnown(b);
    if (b.kind === 'agent.move' && (b.dir === 'forward' || b.dir === 'back')) {
      out.push(`${b.dir === 'forward' ? 'forward' : 'back'} ${b.n ?? 1}`);
    } else if (b.kind === 'agent.turn') {
      out.push(b.dir === 'left' ? 'left' : 'right');
    } else if (b.kind === 'repeat') {
      for (let i = 0; i < b.n; i++) blocksToProgram(b.body || [], out);
    } else if (b.kind === 'for') {
      for (let i = 0; i <= b.to; i++) blocksToProgram(b.body || [], out);
    } else if (b.body) {
      blocksToProgram(b.body, out);
    }
  }
  return out;
}

// Slot-Anzeige im Editor-Wortlaut.
export function slotText(b, slot) {
  const v = b[slot.slot];
  if (slot.slot === 'word' || slot.slot === 'name') return `"${v}"`;
  return String(v ?? '');
}
```

Hinweis: `agentSim.simulate` kennt nur `forward`, `left`, `right`; `back n` wird in Task 2 nicht simuliert (Übungen nutzen es nicht). `blocksToProgram` liefert es trotzdem, damit ein späterer Test es abfangen kann.

- [ ] **Step 3: `src/components/BlockView.jsx`**

```jsx
import { BLOCK_SPECS, CATEGORY_COLORS, slotText } from '../lib/blocks.js';

// Zeichnet eine Blockbeschreibung als SVG im Look des MakeCode-Editors:
// Hutbloecke (on …), C-Bloecke (repeat/for/if) mit eingerueckter Rumpfspalte,
// Statement-Bloecke mit Kerbe, Slots als Pillen. Monospace 600 12pt wie .blocklyText.
const ROW = 30, IND = 18, PAD = 10, CH = 7.6, FONT = 'Consolas, Monaco, Menlo, "Ubuntu Mono", monospace';

function measure(spec, b) {
  let w = PAD;
  for (const part of spec.label) {
    const text = typeof part === 'string' ? part : slotText(b, part);
    w += text.length * CH + (typeof part === 'string' ? 8 : 20);
  }
  return Math.max(w, 120);
}

function layout(tree, depth = 0, y = 0, rows = []) {
  for (const b of tree) {
    const spec = BLOCK_SPECS[b.kind];
    rows.push({ b, spec, depth, y, w: measure(spec, b) });
    y += ROW;
    if (spec.c || spec.hat) {
      y = layout(b.body || [], depth + 1, y, rows).y;
      if (spec.c) { rows.push({ b, spec, depth, y, w: 60, foot: true }); y += ROW * 0.6; }
    }
  }
  return { rows, y };
}

function shape(row) {
  const { spec, w } = row;
  const r = 4, h = ROW - 4;
  if (row.foot) return `M0,0 h${w} a${r},${r} 0 0 1 ${r},${r} v${h * 0.6 - r} a${r},${r} 0 0 1 -${r},${r} h-${w} z`;
  if (spec.hat) return `M0,${r} q${w / 2},-${ROW * 0.7} ${w},0 v${h - r} a${r},${r} 0 0 1 -${r},${r} h-${w - r} a${r},${r} 0 0 1 -${r},-${r} z`;
  // Statement mit Kerbe oben (Zickzack bei x=12..24)
  return `M0,${r} a${r},${r} 0 0 1 ${r},-${r} h8 l4,4 h12 l4,-4 h${w - 32} a${r},${r} 0 0 1 ${r},${r} v${h - 2 * r} a${r},${r} 0 0 1 -${r},${r} h-${w - 32} l-4,4 h-12 l-4,-4 h-8 a${r},${r} 0 0 1 -${r},-${r} z`;
}

export default function BlockView({ blocks }) {
  const { rows, y } = layout(blocks);
  const width = Math.max(...rows.map((r) => r.depth * IND + r.w)) + PAD;
  return (
    <svg className="blockview" viewBox={`0 0 ${width} ${y + 8}`} width="100%" role="img" aria-label="MakeCode-Blöcke" style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13 }}>
      {rows.map((row, i) => {
        const col = CATEGORY_COLORS[row.spec.cat];
        const x = row.depth * IND;
        if (row.foot) return <g key={i} transform={`translate(${x},${row.y})`}><path d={shape(row)} fill={col.fill} stroke={col.stroke} strokeWidth="2" /></g>;
        let cx = PAD;
        return (
          <g key={i} data-kind={row.b.kind} transform={`translate(${x},${row.y})`}>
            <path d={shape(row)} fill={col.fill} stroke={col.stroke} strokeWidth="2" />
            {row.spec.label.map((part, j) => {
              if (typeof part === 'string') {
                const el = <text key={j} x={cx} y={ROW / 2 + 4} fill="#fff">{part}</text>;
                cx += part.length * CH + 8;
                return el;
              }
              const text = slotText(row.b, part);
              const w = text.length * CH + 12;
              const dark = part.kind === 'dropdown';
              const varSlot = part.kind === 'var';
              const el = (
                <g key={j} data-slot={part.slot}>
                  <rect x={cx} y={5} width={w} height={ROW - 14} rx={(ROW - 14) / 2} fill={dark ? col.slot : varSlot ? CATEGORY_COLORS.variables.fill : '#fff'} />
                  <text x={cx + 6} y={ROW / 2 + 4} fill={dark || varSlot ? '#fff' : '#111'}>{text}</text>
                </g>
              );
              cx += w + 8;
              return el;
            })}
          </g>
        );
      })}
    </svg>
  );
}
```

CSS anhängen: `.blockview { max-width: 100%; height: auto; direction: ltr; }`.

- [ ] **Step 4: s02-Blockbeschreibung und ConceptCard**

In `src/data/stations.js` bei `s02` ergänzen:
```js
    blocks: [{ kind: 'onChat', word: 'weg', body: [
      { kind: 'agent.teleportToPlayer' },
      { kind: 'agent.setItem', block: 'grass', count: 64, slot: 1 },
      { kind: 'agent.move', dir: 'forward', n: 1 }, { kind: 'agent.place', dir: 'back' },
      { kind: 'agent.move', dir: 'forward', n: 1 }, { kind: 'agent.place', dir: 'back' },
      { kind: 'agent.turn', dir: 'left' },
      { kind: 'agent.move', dir: 'forward', n: 1 }, { kind: 'agent.place', dir: 'back' },
    ] }],
```
`ConceptCard.jsx`: Prop `blocks`; Figure zeigt `blockImage ? <img …> : blocks ? <BlockView blocks={blocks} /> : <div className="blocks-missing">…</div>`. `StationView` reicht `blocks={s.blocks}` durch.

- [ ] **Step 5: Tests grün, Sichtprüfung, Commit**

Run: `npm test` → grün. Dev-Server: Station 2 zeigt statt „Block-Bild folgt" die gezeichneten Blöcke (Hut blau, Agent-Zeilen orange). Screenshot der Ansicht mit playwright-core nach `docs/blockview-s02.png` (nur zur Sichtprüfung, committen ja, 1 Datei).
```bash
git add -A && git commit -q -m "feat(blocks): svg block view in MakeCode colours from a block description; s02 blocks" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_019PenMpZcTxKvhNptZMbVVE"
```

---

### Task 3: Datenmodell-Erweiterungen und Kursdefinition

**Files:**
- Modify: `src/data/stations.js` (`iframeHeight`, `bossCheck`, `ETAPPEN[].badge`), `src/i18n/de.js` (ui-Schlüssel, `bossCheck`, `etappen.*.badge`), `src/content/de.js` (`mood`), `moodle/course-def.mjs`, `moodle/build-course.mjs`, `tests/content.test.js`, `tests/course-def.test.js`
- Create: `moodle/lib/markdown.mjs` (marked-Wrapper), `content/lehrkraft/README.md`
- `npm i marked`

**Interfaces:**
- `STATIONS[id].iframeHeight` (Zahl); `STATIONS[id].bossCheck = { key: 'boss-holz', gradeMax: 100 }` an der letzten Station einer Etappe; `ETAPPEN[i].badge = { key: 'badge-holz', icon: 'holz.png' }`.
- `i18n.de.stations[id].bossCheck = { title, task }`; `i18n.de.etappen[id].badge = { name, description }`; `ui.bossCheckHeading`, `ui.bossCheckHint`.
- `content.de.stations[id].story[i].mood` ∈ `erklaerend|fragend|begeistert|nachdenklich|ueberrascht` (optional, Default `erklaerend` für Nour, `fragend` für Dani).
- `buildCourseDef` liefert zusätzlich Items `{ type: 'assignment', key, name, intro, gradeMax }`, `{ type: 'page', key, name, html }`, `{ type: 'folder', key, name }`; Lehrkraft-Abschnitt (num 1) aus `content/lehrkraft/*.md` (Reihenfolge: setup, welt-ankunft, ds01…); `iframeLabel` nutzt `iframeHeight`, Arabisch ×1.1.
- `build-course.mjs` Handler: `assignment` → `moodle_create_assignment` (grade gradeMax, submissionOnlineText 1, submissionFile 0, completionSubmit 1), Recreate bei Hash-Änderung wie Quiz; `page` → `moodle_create_page`, Update via Delete+Create (kein Update-Tool) nur bei Hash-Änderung; `folder` → `moodle_create_folder` mit `itemId: 0`, nie aktualisiert (Dirk lädt Dateien hoch).

- [ ] **Step 1: Failing tests** — `content.test.js`: jede Station hat `iframeHeight` ≥ 800; jede Station mit `bossCheck` hat i18n `bossCheck.title/task`, und in jeder Etappe mit drei oder mehr Stationen trägt genau die letzte Station einen `bossCheck` (vor Task 4/5 hat Holz nur s02, die Regel greift dann noch nicht); jede Etappe hat `badge` und i18n `badge.name/description`; story-`mood`, wenn gesetzt, aus der erlaubten Menge. `course-def.test.js`: Holz enthält ein `assignment`-Item `boss-holz` mit `{mlang uk}` im Namen; Abschnitt 1 enthält `page`-Items in der Reihenfolge der Markdown-Dateien und ein `folder`-Item `weltdateien`; iframe für `ar` hat `height="1540"` bei `iframeHeight: 1400`.

- [ ] **Step 2: Daten** — s02: `iframeHeight: 1400`; Holz-Etappe `badge: { key: 'badge-holz', icon: 'holz.png' }`, Stein `badge-stein`; i18n de: `bossCheckHeading: 'Boss-Check'`, `bossCheckHint: 'Löse die Aufgabe ohne Tipp-Leiter. Gib den Share-Link ab und schreibe drei Sätze.'`; `etappen.holz.badge = { name: 'Holz', description: 'Du hast alle Checks der Etappe Holz bestanden und den Boss-Check abgegeben.' }` (Stein analog). Boss-Check-Daten kommen mit s03/s06 in Task 4/5.

- [ ] **Step 3: `moodle/lib/markdown.mjs`**
```js
import { marked } from 'marked';
import { toEntities } from './entities.mjs';
// Lehrkraft-Seiten: Markdown -> HTML (deutsch, keine mlang), Umlaute als Entities.
export function mdToHtml(md) { return toEntities(marked.parse(md, { gfm: true })); }
export function titleOf(md) { const m = md.match(/^#\s+(.+)$/m); return m ? m[1].trim() : 'Ohne Titel'; }
```
`content/lehrkraft/README.md`: erklärt Reihenfolge (Dateiname), Titel aus erster `#`-Zeile, nur Deutsch.

- [ ] **Step 4: course-def + build-course** — Items wie in Interfaces; `pagesFromMarkdown(dir)` liest `content/lehrkraft/*.md` sortiert; Lehrkraft-Abschnitt: `[folder weltdateien, ...pages]`; Boss-Check-Assignment nach dem Quiz der letzten Station; `contentHash` deckt `assignment` (`{name,intro,gradeMax}`) und `page` (`{name,html}`) ab; Handler analog Quiz (Recreate bei Hash-Änderung, danach `moodle_set_completion({cmid, completion: 1})` für die Aufgabe? Nein: `completionSubmit: 1` beim Anlegen setzt Abschluss bei Abgabe). Kriterien-CMIDs: Quizze **und** Aufgaben.

- [ ] **Step 5: Tests grün, Bauskript gegen die Box** — `node moodle/build-course.mjs` legt Aufgabe (noch keine, weil s03/s06 fehlen — nur Lehrkraft-Seiten/Ordner entstehen: README-Platzhalterseite? Nein: erst mit Task 7 gibt es Markdown; hier nur Ordner) an; zweiter Lauf idempotent. Commit `feat(model,moodle): boss checks, badges, iframe height, assignment/page/folder items`.

---

### Task 4: Etappe Holz — Stationen DS 1 und DS 3 (Inhalt)

**Content-Task.** Die deutschen Texte werden nach den Vorgaben unten in einfacher Sprache **ausformuliert** (nicht transkribiert); der Reviewer prüft A2/B1-Regeln, Schema und Konsistenz mit dem Python. Struktur, Python und Blockbeschreibung stehen hier verbindlich.

**Files:** `src/data/stations.js`, `src/i18n/de.js`, `src/content/de.js`; Tests laufen über `content.test.js` (Schema) + neuer `tests/blocks-consistency.test.js`.

**Vorgaben DS 1 „Die neue Welt" (`s01`, etappe holz, ds 1, iframeHeight 1300):**
- Story (6 Zeilen): Ankunft; der Agent steht da; Dani ruft ihn, nichts passiert; Nour: „Er versteht nur Code"; Dani: „Und wie sage ich ihm etwas?"; Nour: „Mit einem Zauberwort im Chat. Ich zeige es dir."
- Konzept (4 Absätze): Was ist der Agent; Code Builder öffnen (Taste C); ein Befehl = eine Zeile; das Zauberwort startet das Programm.
- Python (Entwurf):
  ```python
  def on_hi():
      agent.teleport_to_player()
      agent.move(FORWARD, 1)
  player.on_chat("hi", on_hi)
  ```
- Blocks: `onChat "hi"` → `agent.teleportToPlayer`, `agent.move forward 1`.
- Aufgaben: Auftrag „Sag hi": Zauberwort `hi`, der Agent kommt und geht einen Schritt. Noch einer: Zauberwort ändern (`hallo`), Schritte auf 3. Remix: ein zweites Zauberwort erfinden.
- Tipps 1–3 (Frage / Richtung / Gerüst), tipSolution mit Remix-Pflicht.
- Übungen: `predict` (Start (2,4,N), Programm `forward 1`) und `parsons` (3 Zeilen: teleport, move, on_chat-Zeile).
- Quiz (4 Fragen): Wozu ist das Zauberwort da; Welche Taste öffnet den Code Builder; Was macht `agent.teleport_to_player()`; Der Agent versteht … (nur Code).

**Vorgaben DS 3 „Zauberwörter" (`s03`, ds 3, iframeHeight 1500, `bossCheck: { key: 'boss-holz', gradeMax: 100 }`):**
- Story: Dani will zwei Sachen: einen Weg und einen Turm; Nour: zwei Zauberwörter, zwei Programme; Dani: „Und wenn ich beide sage?"; Nour: „Dann laufen beide, eins nach dem anderen."
- Konzept: Ereignis = etwas passiert (Chat), dann läuft ein Programm; mehrere Ereignisse nebeneinander; jedes Zauberwort ist ein eigener Hut-Block.
- Python (Entwurf):
  ```python
  def on_weg():
      agent.teleport_to_player()
      agent.set_item(GRASS, 64, 1)
      agent.move(FORWARD, 1)
      agent.place(BACK)
      agent.move(FORWARD, 1)
      agent.place(BACK)
  player.on_chat("weg", on_weg)

  def on_turm():
      agent.teleport_to_player()
      agent.set_item(STONE, 64, 1)
      agent.place(FORWARD)
      agent.move(UP, 1)
      agent.place(FORWARD)
      agent.move(UP, 1)
      agent.place(FORWARD)
  player.on_chat("turm", on_turm)
  ```
- Blocks: zwei Hüte `onChat "weg"` und `onChat "turm"` mit den entsprechenden Körpern (`agent.move dir 'up'`).
- Aufgaben: Auftrag: beide Zauberwörter ausprobieren. Noch einer: Turm auf 5 Blöcke. Remix: drittes Zauberwort `brücke` (Weg über eine Lücke).
- Boss-Check Holz (i18n `bossCheck`): Titel „Boss-Check Holz: Das L"; Aufgabe: „Der Agent legt ein L aus Blöcken: 4 Blöcke geradeaus, dann Ecke, dann 2 Blöcke. Ohne Tipp-Leiter. Gib den Share-Link ab und schreibe drei Sätze: Was macht dein Programm? Warum ist die Reihenfolge wichtig? Was war schwer?"
- Übungen: `predict` (Start (0,4,N), Programm `forward 2, right, forward 2`), `parsons` (5 Zeilen des Weg-Programms).
- Quiz: Was ist ein Ereignis; Wie viele Programme laufen bei zwei Zauberwörtern; Was macht `agent.move(UP, 1)`; Reihenfolge bei zwei Chat-Befehlen (der zuerst getippte läuft zuerst).

- [ ] **Step 1: Failing test** `tests/blocks-consistency.test.js`: für jede Station mit `blocks` und einem `predict`-Exercise gilt nicht zwingend Gleichheit (Übung ≠ Programm); stattdessen: `flattenBlocks(blocks)` wirft nicht, jeder Hut hat `word`, und die Zahl der Hut-Blöcke entspricht der Zahl der `player.on_chat(` im Python.
- [ ] **Step 2: Daten schreiben** nach Vorgaben; Sprachregeln aus dem Kopf von `de.js`.
- [ ] **Step 3:** `npm test` grün; Dev-Server: `#/station/s01`, `#/station/s03` prüfen (Story, Blöcke, Übungen lösbar).
- [ ] **Step 4:** Commit `feat(content): stations DS 1 and DS 3 (Holz) with boss check`.

---

### Task 5: Etappe Stein — Stationen DS 4, 5, 6 (Inhalt)

**Content-Task** wie Task 4. Files wie Task 4.

**DS 4 „Wiederholen" (`s04`, iframeHeight 1500):** Story: Nacht kommt, Mauer aus 10 Blöcken; Dani schreibt zehnmal dasselbe; Nour: „Dafür gibt es die Schleife." Konzept: `repeat`/`for` — ein Befehl, viele Male; Zählen von 0. Python:
```python
def on_mauer():
    agent.teleport_to_player()
    agent.set_item(COBBLESTONE, 64, 1)
    for index in range(10):
        agent.move(FORWARD, 1)
        agent.place(BACK)
player.on_chat("mauer", on_mauer)
```
Blocks: `onChat "mauer"` → teleport, setItem cobblestone, `for index from 0 to 9` [move forward 1, place back]. Aufgaben: Auftrag Mauer; Noch einer: 20 Blöcke, andere Blockart; Remix: zwei Mauern mit Lücke. Übungen: predict (Start (2,4,N), `forward 3`), parsons (Schleifenzeilen, Einrückung als Teil der Zeile). Quiz: Was spart die Schleife; `range(10)` = wie oft; Erste Zahl beim Zählen; Was passiert bei `range(0)`.

**DS 5 „Schleife in der Schleife" (`s05`, iframeHeight 1600):** Story: Mauer ist eine Reihe, Dani will eine Wand; Nour: Reihe wiederholen, nach jeder Reihe eine Ebene hoch. Python:
```python
def on_wand():
    agent.teleport_to_player()
    agent.set_item(COBBLESTONE, 64, 1)
    for index in range(3):
        for index2 in range(6):
            agent.move(FORWARD, 1)
            agent.place(BACK)
        agent.move(UP, 1)
        agent.turn(LEFT_TURN)
        agent.turn(LEFT_TURN)
player.on_chat("wand", on_wand)
```
Blocks: `for index 0..2` [ `for index2 0..5` [move, place], move up 1, turn left, turn left ]. Aufgaben: Auftrag Wand 6×3; Noch einer: 8×4; Remix: Fenster (eine Reihe kürzer). Übungen: predict (Start (0,4,N), `forward 2, left, left, forward 1`), parsons (innere und äußere Schleife). Quiz: Wie viele Blöcke bei 3×6; Was macht die innere Schleife; Warum zweimal drehen; Reihenfolge innen/außen.

**DS 6 „Das Haus" (`s06`, iframeHeight 1600, `bossCheck: { key: 'boss-stein', gradeMax: 100 }`):** Story: vier Wände; Dani: viermal die Wand-Schleife kopieren; Nour: nein, eine Schleife außen herum mit Drehung. Python:
```python
def on_haus():
    agent.teleport_to_player()
    agent.set_item(PLANKS_OAK, 64, 1)
    for index in range(4):
        for index2 in range(5):
            agent.move(FORWARD, 1)
            agent.place(BACK)
        agent.turn(LEFT_TURN)
player.on_chat("haus", on_haus)
```
Blocks entsprechend. Aufgaben: Auftrag Ring 5×5; Noch einer: Ring 3 hoch (dritte Schleife); Remix: Tür lassen. Boss-Check Stein: „Zaun um dich herum: ein Ring aus 8×8 Blöcken, ohne Tipp-Leiter; Share-Link und drei Sätze: Was spart die Schleife? Wie viele Befehle wären es ohne Schleife?" Übungen: predict (Start (2,4,N), `forward 2, left, forward 2, left, forward 2`), parsons. Quiz: Wie viele Wände bei `range(4)`; Wo steht `turn`; Warum nur eine Drehung pro Wand; Blöcke bei 4×5.

- [ ] Steps wie Task 4; Commit `feat(content): stations DS 4–6 (Stein) with boss check`.

---

### Task 6: Charaktere Nour und Dani (Media Factory)

**Files:** `scripts/characters.mjs`, `src/assets/characters/*.png`, `src/components/StoryPanel.jsx` (Pose nach `mood`), Kostenprotokoll im docker-Repo `_assets/media-factory/cost-log.jsonl`

**Interfaces:**
- Dateinamen `{nour|dani}-{erklaerend|fragend|begeistert|nachdenklich|ueberrascht}.png`, 512×512, Comic-Stil, neutraler heller Hintergrund; `StoryPanel` wählt `FACE[who][mood]`, Fallback SVG.
- Verfahren: (1) Skill `media-factory` laden, `generators/ai-image.md` und `cost-tracker.md` folgen; (2) je Figur ein Referenzbild (Nano Banana, ~0,04 USD) mit festem Prompt (Alter 17, Kleidung, Haarfarbe, Comic, klare Konturen, kein Text); Dirk sieht das Referenzbild (Datei) und gibt frei; (3) fünf Posen je Figur mit dem Referenzbild als Bildeingabe und dem Posen-Prompt; (4) Kosten je Aufruf protokollieren; Abbruch bei 5 USD.
- Prompt-Kern Nour: „17-year-old student, warm confident smile, short dark curly hair, hoodie in forest green, comic illustration, flat colours, clean outlines, white background, bust portrait". Dani: „17-year-old student, curious wide eyes, straight brown hair with a fringe, yellow t-shirt, same style". Posen: erklärend (Hand erhoben), fragend (Kopf schief, Finger am Kinn), begeistert (beide Daumen hoch), nachdenklich (Hand am Kopf), überrascht (offener Mund).

- [ ] **Step 1:** `scripts/characters.mjs` (liest `GOOGLE_API_KEY` aus `../docker/.env`, `--who nour --pose erklaerend --ref path`), Kostenanzeige vor jedem Aufruf, JSONL-Log, Datei schreiben.
- [ ] **Step 2:** Referenzbilder erzeugen → **Stopp: Dirk-Freigabe** der beiden Referenzen (Dateien zeigen).
- [ ] **Step 3:** zehn Posen erzeugen; Sichtprüfung auf Konsistenz (Haare, Kleidung); bei Ausreißern einmal neu (Budget prüfen).
- [ ] **Step 4:** `StoryPanel` mit `mood`; `content/de.js` Dialoge bekommen `mood`; Test: Panel rendert `img[src*="nour-erklaerend"]`.
- [ ] **Step 5:** Commit `feat(story): comic characters Nour and Dani, five poses each` + Kostenzeile im Report.

---

### Task 7: Lehrkraft-Abschnitt — Setup, Weltbauplan, Stundenverläufe

**Files:** `content/lehrkraft/setup.md`, `welt-ankunft.md`, `ds01.md` … `ds06.md`, `scripts/minecraft/welt-ankunft-bau.py`

**Vorgaben:**
- `setup.md`: Lizenzen (A3/A5-Toggle, Auto-Claim), Installation Windows 64-bit, Login Schulkonto, MakeCode-Editor auf Englisch stellen (Pfad im Editor), Weltdatei importieren (Doppelklick), Join-Code für später, Firewall `*.minecrafteduservices.com`, Checkliste eine Woche vor Start.
- `welt-ankunft.md`: Flachwelt „Grasebene", Startzone 20×20 bei 0/4/0 mit Spawn, Schildertexte DS 1–6 (deutsch, kurz), Beispielbauten (Weg 3 Blöcke, Turm 3, Mauer 10, Wand 6×3, Ring 5×5) mit Koordinaten in einer Tabelle, Bereich „Erkunden" für Eisen freigehalten; Anleitung Export `.mcworld` → Upload in den Moodle-Ordner „Weltdateien".
- `welt-ankunft-bau.py`: MakeCode-Python (Entwurf), Zauberwort `bau`: Startplattform 20×20 aus `STONE` mit `blocks.fill`, Wegmarken (je ein `GOLD_BLOCK` alle 5 Blöcke), die fünf Beispielbauten aus Schleifen (dieselben Programme wie DS 2–6, in Funktionen). Kommentar: „Entwurf, im Editor gegenprüfen".
- `dsNN.md` (je ~40 Zeilen): Ziel der Stunde, Ablauf mit Minuten (Story 5 / Konzept 10 / Spiel 45 / Check 20 / Spielstand 5), was die Lehrkraft sagt/zeigt, typische Fehler und Hilfen, Lösung der Aufgaben (Python), Differenzierung (Auftrag/Noch einer/Remix), Boss-Check-Bewertung (bei DS 3 und 6).

- [ ] Steps: Dateien schreiben; `node moodle/build-course.mjs` legt acht Seiten + Ordner im Abschnitt 1 an (versteckt); zweiter Lauf idempotent; Commit `docs(lehrkraft): setup, world plan, lesson plans DS 1–6`.

---

### Task 8: Forum und Badges per PHP

**Files:** `moodle/apply-php.sh`, `moodle/php/create-forum.php`, `moodle/php/create-badges.php`, `moodle/php/test-student.php`, `src/assets/badges/{holz,stein}.svg`, `scripts/badge-icons.mjs`, `moodle/registry.json`

**Interfaces:**
- `apply-php.sh <script.php> [args…]`: `docker cp` nach `/tmp/`, `MSYS_NO_PATHCONV=1 docker exec ki-kurs-moodle php /tmp/<script> args`, gibt stdout durch.
- `create-forum.php <courseid> <name-mlang> <intro-html>`: `create_module((object)[modulename:'forum', course, section:0, visible:1, name, introeditor:['text','format'=>FORMAT_HTML,'itemid'=>0], type:'general', assessed:0, scale:0, forcesubscribe:FORUM_CHOOSESUBSCRIBE, grade_forum:0, cmidnumber:'', groupmode:0, groupingid:0, completion:0])`; idempotent: existiert ein Forum mit dem Namen im Kurs → dessen cmid ausgeben. Ausgabe `cmid=<n>`; das Bauskript-Nachlaufskript `moodle/postbuild.mjs` ruft es auf und trägt `items['forum-nour'].cmid` ins Register.
- `create-badges.php <courseid> <json>`: JSON `[{ key, name (mlang), description (mlang), icon (Pfad im Container), cmids: [..] }]`; je Badge: existiert Badge mit `name` im Kurs → Kriterien aktualisieren, sonst `badge::create_badge($data, $courseid)` mit `version '1.0', language 'de', imagecaption '', issuername 'Code-Welt', issuerurl '', issuercontact ''`, `badges_process_badge_image($badge, $iconpath)`; Kriterien: `award_criteria::build(['criteriatype'=>BADGE_CRITERIA_TYPE_OVERALL,'badgeid'=>$id])->save(['agg'=>BADGE_CRITERIA_AGGREGATION_ALL])`, dann `…TYPE_ACTIVITY…->save(['agg'=>ALL, 'module_<cmid>'=>cmid, …])`; `$badge->set_status(BADGE_STATUS_ACTIVE)`. Ausgabe `badge=<key> id=<n>`.
- `test-student.php <courseid>`: legt `schueler1` (Passwort `Test-2026!`) an, falls fehlt, schreibt ihn als Student ein (`enrol_manual`), gibt `userid=<n>` aus.
- `scripts/badge-icons.mjs`: `sharp` rendert `src/assets/badges/*.svg` → 256×256 PNG nach `moodle/badges/` (gitignored? nein, committen, klein).
- Badge-Icons: einfache flache SVG-Silhouetten (Holz: Axt in Braun/Beige; Stein: Spitzhacke in Grau), 200×200, ohne Text.

- [ ] **Step 1:** Wrapper + Icons + PNG-Skript; `npm i sharp`.
- [ ] **Step 2:** PHP-Skripte; `postbuild.mjs` (liest Register, ruft Forum und Badges mit CMIDs der Quizze/Aufgaben je Etappe, aktualisiert Register: `items['forum-nour']`, `badges: { 'badge-holz': id }`).
- [ ] **Step 3:** Lauf gegen die Box: Forum erscheint in Abschnitt 0 (Sichtprüfung `moodle_get_course_contents`), zwei Badges aktiv (`SELECT name,status FROM {badge} WHERE courseid=10`).
- [ ] **Step 4 (Nachweis):** Testschüler anlegen; per PHP die Abschlüsse der Holz-Checks und des Boss-Checks für den Schüler setzen (`$completion = new completion_info($course); $completion->update_state($cm, COMPLETION_COMPLETE, $userid, true)` — der vierte Parameter `override=true` ist nötig, weil die Aktivitäten automatischen Abschluss haben), dann `$badge->review_all_criteria()`; `moodle_get_user_badges({ userId, courseId: 10 })` zeigt „Holz". Ausgabe in den Report.
- [ ] **Step 5:** Commit `feat(moodle): forum and badges via php, test student, badge icons`.

---

### Task 9: Übersetzung Holz und Stein

**Files:** `src/i18n/{en,uk,ar,es,it}.js` (generiert), `tests/glossary-terms.test.js` (neu), `tests/etappen-names.test.js`

- [ ] **Step 1:** Vor der Neuübersetzung die Handkorrekturen pinnen: `tests/glossary-terms.test.js` prüft für es und uk die sechs Glossarbegriffe (Orden/Programa/Secuencia/Palabra mágica/Bloques/Error; Команда/Програма/Послідовність/Чарівне слово/Блоки/Помилка).
- [ ] **Step 2:** `node scripts/translate.mjs --lang all` (sourceHash hat sich geändert → alle fünf werden neu erzeugt; Chunks ui, glossary, etappen, sechs Stationen = 9 je Sprache). Kosten protokollieren (erwartet < 1 USD).
- [ ] **Step 3:** `npm test`: `i18n-complete`, `etappen-names`, `glossary-terms` grün; scheitert ein Begriff, **Handkorrektur mit Vermerk** wie in Plan 1 und Prompt-Regel schärfen.
- [ ] **Step 4:** Stichprobe je Sprache (Titel, eine Aufgabe, eine Quizfrage von s05) im Report; Commit `feat(i18n): six stations in six languages`.

---

### Task 10: Smokes härten und erweitern

**Files:** `moodle/smoke-box.mjs`, `scripts/smoke.mjs`, `moodle/lib/registry-ops.mjs` (falls Reihenfolge-Helfer nötig)

- Box-Smoke: Aufwärm-GET auf `/login/index.php` (Antwort verwerfen), dann Login mit `await page.waitForSelector('input[name="logintoken"]')` vor dem Ausfüllen; nach dem Login `page.url()` prüfen und bei `/login/` einmal wiederholen. Neue Checks: Soll-Reihenfolge je Abschnitt 2 und 3 (CMIDs aus dem Register als geordnete Teilfolge der Kursinhalte); Forum sichtbar in Abschnitt 0; Boss-Check-Aufgabe in Abschnitt 2 mit `lang=uk`-Namen; Badge-Seite `badges/view.php?type=2&id=10` listet zwei Badges. Erwartet 13 PASS.
- App-Smoke: läuft automatisch über sechs Stationen × sechs Sprachen (36 PASS); zusätzlich prüfen, dass `.blockview` vorhanden ist.
- [ ] Steps: implementieren, dreimal hintereinander laufen lassen (alle grün), Commit `test(smoke): hardened login, order and badge checks, block view check`.

---

### Task 11: Gesamtlauf, Doku, Übergabe an Dirk

- [ ] `node moodle/build-course.mjs` (zweimal) + `bash moodle/apply-completion.sh` + `node moodle/postbuild.mjs` → Register vollständig.
- [ ] `npm run smoke`, `npm run moodle:smoke` grün.
- [ ] README „Stand" auf Plan 2; `docs/lehrkraft-probelauf.md` mit Dirks Ablauf (Sprache uk, Station 1–6, Boss-Check abgeben als Testschüler, Badge sehen).
- [ ] Memory-Update durch den Controller.
- [ ] Commits + Push.

## Definition of Done

Siehe Nachtrag §4. Zusätzlich: die zwei Boss-Checks sind als Testschüler abgebbar, das Holz-Badge wird nach Abschluss vergeben (nachgewiesen), Dirks Probelauf-Dokument liegt bereit.
