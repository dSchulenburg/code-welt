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
