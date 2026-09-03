import CodeView from './CodeView.jsx';
import Support from './Support.jsx';
import BlockView from './BlockView.jsx';
import { pair } from '../lib/bilingual.js';

export default function ConceptCard({ paragraphs, bridge, supportBridge, python, blockImage, blocks, ui, sui, showSupport }) {
  return (
    <section className="card concept" aria-labelledby="concept-h">
      <h2 id="concept-h">{pair(ui.conceptHeading, sui?.conceptHeading)}</h2>
      {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      <div className="bridge">
        <div><strong>{pair(ui.bridgeGame, sui?.bridgeGame)}</strong><p>{bridge.game}</p><Support show={showSupport}>{supportBridge?.game}</Support></div>
        <div><strong>{pair(ui.bridgeCode, sui?.bridgeCode)}</strong><p>{bridge.code}</p><Support show={showSupport}>{supportBridge?.code}</Support></div>
      </div>
      <div className="side-by-side">
        <figure className="blocks">
          <figcaption>{pair(ui.blocksLabel, sui?.blocksLabel)}</figcaption>
          {blockImage
            ? <img src={blockImage} alt="MakeCode-Blöcke des Programms" />
            : blocks
              ? <BlockView blocks={blocks} />
              : <div className="blocks-missing">Block-Bild folgt</div>}
        </figure>
        <CodeView code={python} label={pair(ui.pythonLabel, sui?.pythonLabel)} />
      </div>
    </section>
  );
}
