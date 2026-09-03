import { useState } from 'react';
import { shuffleDeterministic, checkOrder } from '../lib/parsons.js';
import Support from './Support.jsx';

export default function ParsonsPuzzle({ exercise, prompt, supportPrompt, ui, showSupport, seed = 7 }) {
  const solution = exercise.lines;
  const [lines, setLines] = useState(() => shuffleDeterministic(solution, seed));
  const [result, setResult] = useState(null);
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= lines.length) return;
    const next = [...lines];
    [next[i], next[j]] = [next[j], next[i]];
    setLines(next);
    setResult(null);
  };
  return (
    <section className="exercise parsons">
      <p className="prompt">{ui.parsonsPrompt}</p>
      <p>{prompt}</p>
      <Support show={showSupport}>{supportPrompt}</Support>
      <ol className="parsons-list" data-testid="parsons">
        {lines.map((l, i) => (
          <li key={l} data-line={l}>
            <code>{l}</code>
            <span className="parsons-btns">
              <button type="button" data-dir="up" onClick={() => move(i, -1)} aria-label={ui.parsonsUp}>↑</button>
              <button type="button" data-dir="down" onClick={() => move(i, 1)} aria-label={ui.parsonsDown}>↓</button>
            </span>
          </li>
        ))}
      </ol>
      <button type="button" className="btn" onClick={() => setResult(checkOrder(lines, solution))}>{ui.parsonsCheck}</button>
      {result !== null && <p className={result ? 'ok' : 'nope'} role="status">{result ? ui.parsonsRight : ui.parsonsWrong}</p>}
    </section>
  );
}
