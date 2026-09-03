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
