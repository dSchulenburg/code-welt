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
