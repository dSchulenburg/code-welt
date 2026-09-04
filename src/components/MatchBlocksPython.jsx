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
              {/* Zahl steht bewusst ausserhalb des Buttons: sonst wuerde sie im textContent
                  vor der Python-Zeile kleben (z. B. "1for index in range(...)"). */}
              <span className="match-num">{n + 1}</span>
              <button type="button" className={`match-line${Object.values(assign).includes(lineIdx) ? ' paired' : ''}`}
                data-testid={`match-line-${lineIdx}`} onClick={() => drop(lineIdx)}>
                <code>{pairs[lineIdx].python}</code>
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
