import { useEffect, useState } from 'react';
import { STATIONS, ETAPPEN } from '../data/stations.js';
import de from '../i18n/de.js';
import content from '../content/de.js';
import { getBundle, isSupport } from '../i18n/index.js';
import { format } from '../lib/format.js';
import { pair } from '../lib/bilingual.js';
import StoryPanel from './StoryPanel.jsx';
import ConceptCard from './ConceptCard.jsx';
import TaskCard from './TaskCard.jsx';
import TipLadder from './TipLadder.jsx';
import AgentGrid from './AgentGrid.jsx';
import ParsonsPuzzle from './ParsonsPuzzle.jsx';
import Spielstand from './Spielstand.jsx';

const BLOCK_IMAGES = import.meta.glob('../assets/blocks/*.png', { eager: true, import: 'default' });
const VISITED = 'code-welt:besucht';

export function markVisited(id) {
  try {
    const set = new Set(JSON.parse(localStorage.getItem(VISITED) || '[]'));
    set.add(id);
    localStorage.setItem(VISITED, JSON.stringify([...set]));
  } catch { /* ignore */ }
}

export default function StationView({ id, lang }) {
  const s = STATIONS[id];
  const t = de.stations[id];          // Leit-Ebene Stuetz-Felder auf Deutsch (immer sichtbar)
  const c = content.stations[id];     // Leit-Ebene Erklaerung (nur Deutsch)
  const support = isSupport(lang) ? getBundle(lang) : null;
  const st = support?.stations[id];   // Stuetz-Ebene in der gewaehlten Sprache
  const ui = de.ui;
  const sui = support?.ui || null;
  const [showSupport, setShowSupport] = useState(true);
  useEffect(() => { markVisited(id); }, [id]);
  if (!s || !t || !c) return <p>Station {id} gibt es nicht.</p>;

  const etappe = ETAPPEN.find((e) => e.id === s.etappe);
  const blockImage = BLOCK_IMAGES[`../assets/blocks/${s.blockImage}`] || null;

  return (
    <article className="station">
      <header className="station-head">
        <p className="crumb">{etappe.emoji} {pair(de.etappen[etappe.id].name, support?.etappen?.[etappe.id]?.name)} · {format(pair(ui.ds, sui?.ds), { n: s.ds })}</p>
        <h1>{t.title}{st && st.title !== t.title && <span className="title-support"> · {st.title}</span>}</h1>
        {support && (
          <button type="button" className="btn btn-support" onClick={() => setShowSupport((v) => !v)}>
            {showSupport ? sui.supportHide : sui.supportShow}
          </button>
        )}
      </header>

      <StoryPanel lines={c.story} short={st?.storyShort} ui={ui} sui={sui} showSupport={!!(support && showSupport)} />
      <ConceptCard paragraphs={c.concept} bridge={t.bridge} supportBridge={st?.bridge} python={s.python} blockImage={blockImage} blocks={s.blocks} ui={ui} sui={sui} showSupport={!!(support && showSupport)} />
      <TaskCard tasks={t.tasks} supportTasks={st?.tasks} ui={ui} sui={sui} showSupport={!!(support && showSupport)} />
      <TipLadder tips={c.tips} solution={t.tipSolution} supportSolution={st?.tipSolution} ui={ui} sui={sui} showSupport={!!(support && showSupport)} />

      <section className="card check" aria-labelledby="check-h">
        <h2 id="check-h">{pair(ui.checkHeading, sui?.checkHeading)}</h2>
        {s.exercises.map((ex, i) => {
          const props = { exercise: ex, prompt: t.exercises[i].prompt, supportPrompt: st?.exercises?.[i]?.prompt, ui, sui, showSupport: !!(support && showSupport) };
          if (ex.type === 'predict') return <AgentGrid key={`${id}-${i}`} {...props} />;
          if (ex.type === 'parsons') return <ParsonsPuzzle key={`${id}-${i}`} {...props} />;
          return null;
        })}
      </section>

      <Spielstand id={id} ui={ui} sui={sui} />
    </article>
  );
}
