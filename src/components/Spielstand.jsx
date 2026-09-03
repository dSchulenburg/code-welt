import { useState } from 'react';

const KEY = (id) => `code-welt:spielstand:${id}`;

export default function Spielstand({ id, ui }) {
  const [text, setText] = useState(() => { try { return localStorage.getItem(KEY(id)) || ''; } catch { return ''; } });
  const [saved, setSaved] = useState(false);
  return (
    <section className="card spielstand" aria-labelledby="sp-h">
      <h2 id="sp-h">{ui.spielstandHeading}</h2>
      <p>{ui.spielstandPrompt}</p>
      <textarea rows="4" value={text} onChange={(e) => { setText(e.target.value); setSaved(false); }} />
      <button type="button" className="btn" onClick={() => { try { localStorage.setItem(KEY(id), text); } catch { /* ignore */ } setSaved(true); }}>{ui.spielstandSave}</button>
      {saved && <p className="ok" role="status">{ui.spielstandSaved}</p>}
    </section>
  );
}
