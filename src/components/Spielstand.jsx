import { useState } from 'react';
import { pair } from '../lib/bilingual.js';

const KEY = (id) => `code-welt:spielstand:${id}`;

export default function Spielstand({ id, ui, sui }) {
  const [text, setText] = useState(() => { try { return localStorage.getItem(KEY(id)) || ''; } catch { return ''; } });
  const [saved, setSaved] = useState(false);
  return (
    <section className="card spielstand" aria-labelledby="sp-h">
      <h2 id="sp-h">{pair(ui.spielstandHeading, sui?.spielstandHeading)}</h2>
      <p>{pair(ui.spielstandPrompt, sui?.spielstandPrompt)}</p>
      <textarea rows="4" value={text} onChange={(e) => { setText(e.target.value); setSaved(false); }} />
      <button type="button" className="btn" onClick={() => { try { localStorage.setItem(KEY(id), text); } catch { /* ignore */ } setSaved(true); }}>{ui.spielstandSave}</button>
      {saved && <p className="ok" role="status">{ui.spielstandSaved}</p>}
    </section>
  );
}
