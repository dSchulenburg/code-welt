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
  math:      { fill: '#712672', stroke: '#4f1a4f', slot: '#4f1a4f' },
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
  while:                   { cat: 'loops', c: true, label: ['while', { slot: 'cond', kind: 'cond' }, 'do'] },
  if:                      { cat: 'logic', c: true, label: ['if', { slot: 'cond', kind: 'cond' }, 'then'] },
  setVar:                  { cat: 'variables', label: ['set', { slot: 'varName', kind: 'var' }, 'to', { slot: 'value', kind: 'number' }] },
  changeVar:               { cat: 'variables', label: ['change', { slot: 'varName', kind: 'var' }, 'by', { slot: 'value', kind: 'number' }] },
  fill:                    { cat: 'blocks', label: ['fill with', { slot: 'block', kind: 'dropdown' }, 'from', { slot: 'from', kind: 'pos' }, 'to', { slot: 'to', kind: 'pos' }, { slot: 'op', kind: 'dropdown' }] },
  function:                { cat: 'functions', hat: true, label: ['function', { slot: 'name', kind: 'text' }] },
  call:                    { cat: 'functions', label: ['call', { slot: 'name', kind: 'text' }] },
};

export function assertKnown(b) {
  if (!BLOCK_SPECS[b.kind]) throw new Error(`Unbekannte Blockart: ${b.kind}`);
}

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

// Bewegungsbefehle fuer agentSim.simulate: Schleifen werden entrollt, anderes uebersprungen.
// vars sammelt die Werte aus setVar, damit repeat/for ihren Zaehler ueber Variablennamen
// oder Minus-Ausdruecke ({ minus: [name, k] }) aufloesen koennen (Plan 3 Task 1).
export function blocksToProgram(tree, out = [], vars = {}) {
  for (const b of tree) {
    assertKnown(b);
    if (b.kind === 'if' || b.kind === 'while') {
      throw new Error(`blocksToProgram kennt keine Bedingungen (${b.kind})`);
    } else if (b.kind === 'setVar') {
      vars[b.varName] = b.value;
    } else if (b.kind === 'agent.move' && (b.dir === 'forward' || b.dir === 'back')) {
      out.push(`${b.dir === 'forward' ? 'forward' : 'back'} ${b.n ?? 1}`);
    } else if (b.kind === 'agent.turn') {
      out.push(b.dir === 'left' ? 'left' : 'right');
    } else if (b.kind === 'repeat') {
      const n = resolveCount(b.n, vars);
      for (let i = 0; i < n; i++) blocksToProgram(b.body || [], out, vars);
    } else if (b.kind === 'for') {
      const to = resolveCount(b.to, vars);
      for (let i = 0; i <= to; i++) blocksToProgram(b.body || [], out, vars);
    } else if (b.body) {
      blocksToProgram(b.body, out, vars);
    }
  }
  return out;
}

// Slot-Anzeige im Editor-Wortlaut.
export function slotText(b, slot) {
  const v = b[slot.slot];
  if (slot.kind === 'cond') return condText(v);
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
  if (slot.kind === 'cond') return 'cond';
  if (slot.kind === 'pos') return 'pos';
  if (v && typeof v === 'object' && Array.isArray(v.minus)) return 'math';
  if (slot.kind === 'number' && typeof v === 'string') return 'var';
  return slot.kind;
}
