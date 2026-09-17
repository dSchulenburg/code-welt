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
