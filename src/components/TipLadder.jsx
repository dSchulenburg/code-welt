import { format } from '../lib/format.js';
import Support from './Support.jsx';
import { pair } from '../lib/bilingual.js';

// Vier Stufen: Frage, Richtung, Geruest (Leit-Ebene, deutsch) und Loesung (Stuetz-Ebene,
// uebersetzt). Native <details>, jede Stufe einzeln auf- und zuklappbar; die Loesung
// traegt den Remix-Hinweis.
export default function TipLadder({ tips, solution, supportSolution, ui, sui, showSupport }) {
  const steps = [...tips, solution];
  return (
    <section className="card tips" aria-labelledby="tips-h">
      <h2 id="tips-h">{pair(ui.tipsHeading, sui?.tipsHeading)}</h2>
      {steps.map((t, i) => (
        <details key={i}>
          <summary>{i < tips.length ? format(pair(ui.tipStep, sui?.tipStep), { n: i + 1 }) : pair(ui.tipSolution, sui?.tipSolution)}</summary>
          <p>{t}</p>
          {i === tips.length && <p className="remix-note">{ui.tipRemixNote}</p>}
          {i === tips.length && <Support show={showSupport}>{supportSolution}</Support>}
        </details>
      ))}
    </section>
  );
}
