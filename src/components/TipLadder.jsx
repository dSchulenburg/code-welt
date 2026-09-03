import { format } from '../lib/format.js';
import Support from './Support.jsx';

// Vier Stufen: Frage, Richtung, Geruest (Leit-Ebene, deutsch) und Loesung (Stuetz-Ebene,
// uebersetzt). Native <details>, jede Stufe einzeln auf- und zuklappbar; die Loesung
// traegt den Remix-Hinweis.
export default function TipLadder({ tips, solution, supportSolution, ui, showSupport }) {
  const steps = [...tips, solution];
  return (
    <section className="card tips" aria-labelledby="tips-h">
      <h2 id="tips-h">{ui.tipsHeading}</h2>
      {steps.map((t, i) => (
        <details key={i}>
          <summary>{i < tips.length ? format(ui.tipStep, { n: i + 1 }) : ui.tipSolution}</summary>
          <p>{t}</p>
          {i === tips.length && <p className="remix-note">{ui.tipRemixNote}</p>}
          {i === tips.length && <Support show={showSupport}>{supportSolution}</Support>}
        </details>
      ))}
    </section>
  );
}
