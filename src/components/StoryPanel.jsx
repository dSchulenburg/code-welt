import nourSvg from '../assets/characters/nour.svg';
import daniSvg from '../assets/characters/dani.svg';
import Support from './Support.jsx';
import { pair } from '../lib/bilingual.js';

// Alle Posen-Portraits auf einmal einsammeln. Vite loest import.meta.glob zur
// Bauzeit in feste Imports auf; der Schluessel ist der relative Pfad. Die
// Referenzbilder (*-ref.png) sind nur Vorlage fuer die Generierung und bleiben
// draussen, damit sie nicht mit ins Bundle wandern.
const PORTRAITS = import.meta.glob(
  ['../assets/characters/*-*.png', '!**/*-ref.png'],
  { eager: true, import: 'default' },
);
const SILHOUETTE = { nour: nourSvg, dani: daniSvg };
const NAME = { nour: 'Nour', dani: 'Dani' };

// Portrait zu Figur und Stimmung. Fehlt die Datei (oder traegt die Zeile keine
// mood), bleibt die SVG-Silhouette - eine neue Stimmung im Content kann das
// Panel so nie brechen, sie zeigt nur vorerst kein Gesicht.
function face(who, mood) {
  return PORTRAITS[`../assets/characters/${who}-${mood}.png`] ?? SILHOUETTE[who];
}

export default function StoryPanel({ lines, short, ui, sui, showSupport }) {
  return (
    <section className="card story" aria-labelledby="story-h">
      <h2 id="story-h">{pair(ui.storyHeading, sui?.storyHeading)}</h2>
      {lines.map((l, i) => (
        <div key={i} className={`bubble bubble-${l.who}`}>
          <img src={face(l.who, l.mood)} alt="" width="64" height="64" />
          <div>
            <strong>{NAME[l.who]}</strong>
            <p>{l.text}</p>
          </div>
        </div>
      ))}
      <Support show={showSupport}>{short}</Support>
    </section>
  );
}
