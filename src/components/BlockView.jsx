import { BLOCK_SPECS, CATEGORY_COLORS, slotText, slotKind, assertKnown } from '../lib/blocks.js';

// Zeichnet eine Blockbeschreibung als SVG im Look des MakeCode-Editors:
// Hutbloecke (on …), C-Bloecke (repeat/for/if) mit eingerueckter Rumpfspalte,
// Statement-Bloecke mit Kerbe, Slots als Pillen. Monospace 600 12pt wie .blocklyText.
const ROW = 30, IND = 18, PAD = 10, CH = 7.6, FONT = 'Consolas, Monaco, Menlo, "Ubuntu Mono", monospace';

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

function measure(spec, b) {
  let w = PAD;
  for (const part of spec.label) {
    if (typeof part === 'string') { w += part.length * CH + 8; continue; }
    if (part.kind === 'cond') { w += condWidth(b[part.slot]) + 8; continue; }
    w += slotText(b, part).length * CH + 20;
  }
  return Math.max(w, 120);
}

function layout(tree, depth = 0, y = 0, rows = []) {
  for (const b of tree) {
    assertKnown(b);
    const spec = BLOCK_SPECS[b.kind];
    // Luft vor jedem weiteren Hut: zwei Programme nebeneinander (s03: "weg" und "turm")
    // klebten sonst aneinander und sahen aus wie ein einziger Stapel.
    if (spec.hat && rows.length > 0) y += ROW * 0.5;
    rows.push({ b, spec, depth, y, w: measure(spec, b) });
    y += ROW;
    if (spec.c || spec.hat) {
      y = layout(b.body || [], depth + 1, y, rows).y;
      if (b.elseBody) {
        rows.push({ b, spec, depth, y, w: 60, elseRow: true });
        y += ROW;
        y = layout(b.elseBody, depth + 1, y, rows).y;
      }
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

// Natuerliche Breite der Zeichnung in SVG-Einheiten (1 Einheit = 1 CSS-Pixel bei natural).
export function blockViewWidth(blocks) {
  const { rows } = layout(blocks);
  if (rows.length === 0) return 0;
  return Math.max(...rows.map((r) => r.depth * IND + r.w)) + PAD;
}

// natural: SVG in natuerlicher Groesse statt auf 100 % der Spalte skaliert; CSS
// (.blockview { max-width: 100% }) verkleinert nur, wenn der Platz nicht reicht. Die Zuordnung
// (MatchBlocksPython) braucht das: breite fill-Bloecke wurden sonst auf wenige Pixel Schrift
// gestaucht, schmale Bloecke aufgeblasen.
export default function BlockView({ blocks, natural = false }) {
  const { rows, y } = layout(blocks);
  if (rows.length === 0) return null;
  const width = Math.max(...rows.map((r) => r.depth * IND + r.w)) + PAD;
  return (
    <svg className="blockview" viewBox={`0 0 ${width} ${y + 8}`} width={natural ? width : '100%'} role="img" aria-label="MakeCode-Blöcke" style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13 }}>
      {rows.map((row, i) => {
        const col = CATEGORY_COLORS[row.spec.cat];
        const x = row.depth * IND;
        if (row.elseRow) return (
          <g key={i} data-else="true" transform={`translate(${x},${row.y})`}>
            <path d={`M0,0 h${row.w} v${ROW - 4} h-${row.w} z`} fill={col.fill} stroke={col.stroke} strokeWidth="2" />
            <text x={PAD} y={ROW / 2 + 4} fill="#fff">else</text>
          </g>
        );
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
              if (part.kind === 'cond') {
                const cond = row.b[part.slot];
                const el = <g key={j} data-slot="cond" transform={`translate(${cx},4)`}><Cond c={cond} /></g>;
                cx += condWidth(cond) + 8;
                return el;
              }
              const text = slotText(row.b, part);
              const w = text.length * CH + 12;
              const kind = slotKind(row.b, part);
              const dark = kind === 'dropdown';
              const varSlot = kind === 'var';
              const mathSlot = kind === 'math';
              const fill = dark ? col.slot : varSlot ? CATEGORY_COLORS.variables.fill : mathSlot ? CATEGORY_COLORS.math.fill : '#fff';
              const ink = dark || varSlot || mathSlot ? '#fff' : '#111';
              const el = (
                <g key={j} data-slot={part.slot}>
                  <rect x={cx} y={5} width={w} height={ROW - 14} rx={(ROW - 14) / 2} fill={fill} />
                  <text x={cx + 6} y={ROW / 2 + 4} fill={ink}>{text}</text>
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
