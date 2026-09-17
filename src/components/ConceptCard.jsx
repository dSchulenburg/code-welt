import CodeView from './CodeView.jsx';
import Support from './Support.jsx';
import BlockView, { blockViewWidth } from './BlockView.jsx';
import { pair } from '../lib/bilingual.js';

// Ab dieser natuerlichen Breite stehen Block und Python untereinander. Breitere Bloecke wurden
// nebeneinander auf unlesbare Schrift gestaucht (Befund Plan 3: s08/s09 fill). Holz bis s07 liegen bei hoechstens 494 und bleiben unveraendert (gemessen 17.09.2026).
const WIDE_MAIN = 500;

export default function ConceptCard({ paragraphs, bridge, supportBridge, python, blockImage, blocks, ui, sui, showSupport }) {
  const wide = !blockImage && Array.isArray(blocks) && blocks.length > 0 && blockViewWidth(blocks) > WIDE_MAIN;
  return (
    <section className="card concept" aria-labelledby="concept-h">
      <h2 id="concept-h">{pair(ui.conceptHeading, sui?.conceptHeading)}</h2>
      {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      <div className="bridge">
        <div><strong>{pair(ui.bridgeGame, sui?.bridgeGame)}</strong><p>{bridge.game}</p><Support show={showSupport}>{supportBridge?.game}</Support></div>
        <div><strong>{pair(ui.bridgeCode, sui?.bridgeCode)}</strong><p>{bridge.code}</p><Support show={showSupport}>{supportBridge?.code}</Support></div>
      </div>
      <div className={`side-by-side${wide ? ' side-by-side-stacked' : ''}`} data-stacked={wide ? 'true' : 'false'}>
        <figure className="blocks">
          <figcaption>{pair(ui.blocksLabel, sui?.blocksLabel)}</figcaption>
          {blockImage
            ? <img className="blockimage" src={blockImage} alt="MakeCode-Blöcke des Programms" />
            : blocks && blocks.length > 0
              ? <BlockView blocks={blocks} />
              : <div className="blocks-missing">Block-Bild folgt</div>}
        </figure>
        <CodeView code={python} label={pair(ui.pythonLabel, sui?.pythonLabel)} />
      </div>
    </section>
  );
}
