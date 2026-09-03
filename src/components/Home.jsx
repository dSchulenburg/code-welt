import { ETAPPEN, STATIONS } from '../data/stations.js';
import de from '../i18n/de.js';
import { getBundle, isSupport } from '../i18n/index.js';
import { navigate } from '../lib/router.js';
import { format } from '../lib/format.js';
import { pair } from '../lib/bilingual.js';

function loadVisited() {
  try { return new Set(JSON.parse(localStorage.getItem('code-welt:besucht') || '[]')); } catch { return new Set(); }
}

export default function Home({ switcher, lang }) {
  const ui = de.ui;
  const sui = isSupport(lang) ? getBundle(lang).ui : null;
  const visited = loadVisited();
  const total = Object.keys(STATIONS).length;
  return (
    <div className="home">
      <div className="topbar">{switcher}</div>
      <header className="hero">
        <h1>{ui.appTitle}</h1>
        <p className="tagline">{ui.tagline}</p>
        <p>{format(pair(ui.progress, sui?.progress), { done: [...visited].filter((v) => STATIONS[v]).length, total })}</p>
      </header>
      {ETAPPEN.map((e) => (
        <section key={e.id} className="card etappe">
          <h2>{e.emoji} {de.etappen[e.id].name}</h2>
          {e.stations.length === 0 && <p className="muted">…</p>}
          <ul className="station-list">
            {e.stations.map((sid) => (
              <li key={sid}>
                <button type="button" className="btn btn-station" onClick={() => navigate(`/station/${sid}`)}>
                  {format(ui.ds, { n: STATIONS[sid].ds })} · {de.stations[sid].title} {visited.has(sid) ? '✓' : ''}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <footer className="foot">{ui.footer}</footer>
    </div>
  );
}
