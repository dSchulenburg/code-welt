// Starter fuer Code-Welt gegen die PRODUKTION (moodle.dirk-schulenburg.net).
// Holt URL und Schluessel aus claude-proxies/context-keys.mjs (Kontext education) und gibt
// den Schluessel nie aus.
//   node moodle/cw-prod.mjs probe                   nur lesen: Werkzeugliste, Kategorien, Kurs vorhanden?
//   node moodle/cw-prod.mjs call <tool> '<json>'    ein einzelner Aufruf (Ausgabe gekuerzt)
//   node moodle/cw-prod.mjs build <kategorieId>     Bauskript mit REG_ENV=prod, nur Abschnitt 0 + Holz sichtbar
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

process.env.MCP_CONTEXT = 'education';
const ck = await import(pathToFileURL(path.join(os.homedir(), 'entwicklung', 'docker', 'claude-proxies', 'context-keys.mjs')).href);
// Fest wie in scripts/rotate-moodle-admin-key.py; aus getServerUrl abgeleitet ergab es 404.
const RPC = 'https://mcp-moodle.dirk-schulenburg.net/mcp/rpc';
const KEY = ck.getKeyForContext('moodle');
if (!KEY) { console.error('Kein Moodle-Schluessel im Kontext education gefunden.'); process.exit(1); }

async function rpc(method, params) {
  const res = await fetch(RPC, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': KEY }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
  const j = await res.json();
  if (j.error) throw new Error(JSON.stringify(j.error));
  return j.result;
}
const text = (r) => (r?.content || []).map((c) => c.text).join('\n');

const [, , mode, a1, a2] = process.argv;
if (mode === 'probe') {
  const tools = (await rpc('tools/list', {})).tools.map((t) => t.name);
  console.log(`Werkzeuge (${tools.length}):`, tools.filter((n) => /categor|filter|enrol|user|cohort|plugin|course/.test(n)).join(', '));
  if (tools.includes('moodle_list_categories')) console.log(text(await rpc('tools/call', { name: 'moodle_list_categories', arguments: {} })).slice(0, 3000));
  const courses = text(await rpc('tools/call', { name: 'moodle_list_courses', arguments: {} }));
  console.log('Kurzname code-welt schon vorhanden:', courses.includes('**Kurzname:** code-welt\n'));
} else if (mode === 'call') {
  console.log(text(await rpc('tools/call', { name: a1, arguments: JSON.parse(a2 || '{}') })).slice(0, 4000));
} else if (mode === 'build') {
  if (!a1) { console.error('Kategorie-ID fehlt'); process.exit(1); }
  const here = path.dirname(fileURLToPath(import.meta.url));
  const r = spawnSync('node', ['moodle/build-course.mjs'], {
    cwd: path.join(here, '..'), stdio: 'inherit',
    env: { ...process.env, MCP_URL: RPC, MCP_API_KEY: KEY, REG_ENV: 'prod', CATEGORY_ID: a1,
      APP_BASE: 'https://lernmodule.dirk-schulenburg.net/code-welt/', VISIBLE_SECTIONS: '0,2' },
  });
  process.exit(r.status ?? 1);
} else {
  console.log('Aufruf: node moodle/cw-prod.mjs probe | call <tool> <json> | build <kategorieId>');
}
