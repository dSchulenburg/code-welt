import CodeView from './CodeView.jsx';
import Support from './Support.jsx';

export default function ConceptCard({ paragraphs, bridge, supportBridge, python, blockImage, ui, showSupport }) {
  return (
    <section className="card concept" aria-labelledby="concept-h">
      <h2 id="concept-h">{ui.conceptHeading}</h2>
      {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      <div className="bridge">
        <div><strong>{ui.bridgeGame}</strong><p>{bridge.game}</p><Support show={showSupport}>{supportBridge?.game}</Support></div>
        <div><strong>{ui.bridgeCode}</strong><p>{bridge.code}</p><Support show={showSupport}>{supportBridge?.code}</Support></div>
      </div>
      <div className="side-by-side">
        <figure className="blocks">
          <figcaption>{ui.blocksLabel}</figcaption>
          {blockImage
            ? <img src={blockImage} alt="MakeCode-Blöcke des Programms" />
            : <div className="blocks-missing">Block-Bild folgt</div>}
        </figure>
        <CodeView code={python} label={ui.pythonLabel} />
      </div>
    </section>
  );
}
