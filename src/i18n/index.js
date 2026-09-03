// Sprachregistry. Deutsch ist die Leitsprache und kanonische Quelle; die fuenf anderen
// Dateien sind Stuetz-Uebersetzungen (generiert) und duerfen Luecken haben — getBundle
// fuellt sie feldweise aus de.
import { deepMerge } from '../lib/merge.js';
import de from './de.js';
import en from './en.js';
import uk from './uk.js';
import ar from './ar.js';
import es from './es.js';
import it from './it.js';

export const LANGS = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
];
export const RTL = new Set(['ar']);
export const DEFAULT_LANG = 'de';
const BUNDLES = { de, en, uk, ar, es, it };
const KEY = 'code-welt:lang';

export function isKnown(code) { return Object.prototype.hasOwnProperty.call(BUNDLES, code); }
export function isSupport(code) { return code !== DEFAULT_LANG; }

// Reihenfolge: ?lang= (Moodle setzt ihn im iframe) -> localStorage -> Browser -> de
export function detectLang() {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q && isKnown(q)) return q;
  } catch { /* kein window */ }
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && isKnown(saved)) return saved;
  } catch { /* privater Modus */ }
  try {
    const nav = (navigator.language || '').slice(0, 2).toLowerCase();
    if (isKnown(nav)) return nav;
  } catch { /* ignore */ }
  return DEFAULT_LANG;
}

export function saveLang(code) {
  try { localStorage.setItem(KEY, code); } catch { /* ignore */ }
}

export function applyDir(code) {
  const el = document.documentElement;
  el.setAttribute('lang', code);
  el.setAttribute('dir', RTL.has(code) ? 'rtl' : 'ltr');
}

export function getBundle(code) {
  return deepMerge(de, isKnown(code) ? BUNDLES[code] : {});
}
