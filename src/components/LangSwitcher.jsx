import { LANGS } from '../i18n/index.js';

export default function LangSwitcher({ lang, setLang, label }) {
  return (
    <label className="lang-switcher">
      <span aria-hidden="true">🌐</span>
      <select value={lang} aria-label={label} onChange={(e) => setLang(e.target.value)}>
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
        ))}
      </select>
    </label>
  );
}
