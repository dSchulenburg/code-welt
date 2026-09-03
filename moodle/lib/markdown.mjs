import { marked } from 'marked';
import { toEntities } from './entities.mjs';
// Lehrkraft-Seiten: Markdown -> HTML (deutsch, keine mlang), Umlaute als Entities.
export function mdToHtml(md) { return toEntities(marked.parse(md, { gfm: true })); }
export function titleOf(md) { const m = md.match(/^#\s+(.+)$/m); return m ? m[1].trim() : 'Ohne Titel'; }
