import { useState } from 'react';
import Support from './Support.jsx';

// Fehlersuche: genau eine Zeile ist falsch. Zeilen sind Buttons (Tastatur: Tab + Enter);
// nach "Pruefen" erscheint bei Treffer die Erklaerung (i18n stations.<sid>.exercises[i].explain).
export default function FindBug({ exercise, prompt, supportPrompt, explain, supportExplain, ui, showSupport }) {
  const [picked, setPicked] = useState(null);
  const [result, setResult] = useState(null);
  const check = () => setResult(picked === exercise.wrong);
  return (
    <section className="exercise findbug" data-testid="findbug">
      <p className="prompt">{ui.findbugPrompt}</p>
      <p>{prompt}</p>
      <Support show={showSupport}>{supportPrompt}</Support>
      <ol className="findbug-list">
        {exercise.lines.map((line, i) => (
          <li key={i}>
            <button type="button" className={`findbug-line${picked === i ? ' selected' : ''}`} aria-pressed={picked === i}
              data-testid={`findbug-line-${i}`} onClick={() => { setPicked(i); setResult(null); }}>
              <code>{line}</code>
            </button>
          </li>
        ))}
      </ol>
      {/* Ohne gewaehlte Zeile gaebe "Pruefen" sonst "Nein, diese Zeile ist richtig." aus. */}
      <button type="button" className="btn" data-testid="findbug-check" onClick={check} disabled={picked === null}>{ui.checkButton}</button>
      {result !== null && <p className={result ? 'ok' : 'nope'} role="status">{result ? ui.findbugRight : ui.findbugWrong}</p>}
      {result === true && explain && <p className="explain" data-testid="findbug-explain">{explain}</p>}
      {result === true && <Support show={showSupport}>{supportExplain}</Support>}
    </section>
  );
}
