import nour from '../assets/characters/nour.svg';
import dani from '../assets/characters/dani.svg';
import Support from './Support.jsx';
import { pair } from '../lib/bilingual.js';

const FACE = { nour, dani };
const NAME = { nour: 'Nour', dani: 'Dani' };

export default function StoryPanel({ lines, short, ui, sui, showSupport }) {
  return (
    <section className="card story" aria-labelledby="story-h">
      <h2 id="story-h">{pair(ui.storyHeading, sui?.storyHeading)}</h2>
      {lines.map((l, i) => (
        <div key={i} className={`bubble bubble-${l.who}`}>
          <img src={FACE[l.who]} alt="" width="48" height="48" />
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
