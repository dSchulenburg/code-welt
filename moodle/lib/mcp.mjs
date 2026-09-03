// JSON-RPC-Client fuer den Moodle-MCP (Endpunkt /mcp/rpc, Header x-api-key).
// Antworten sind Markdown-Text; IDs werden mit extractId herausgelesen.
const URL = process.env.MCP_URL || 'http://localhost:8000/mcp/rpc';
const KEY = process.env.MCP_API_KEY || 'ki-kurs-lokal';
let seq = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function callTool(name, args, { retries = 3 } = {}) {
  const body = JSON.stringify({ jsonrpc: '2.0', id: ++seq, method: 'tools/call', params: { name, arguments: args } });
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': KEY }, body });
    if (res.status === 429 && attempt < retries) { await sleep(30000); continue; }
    if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
    const json = await res.json();
    if (json.error) throw new Error(`${name}: ${json.error.message}`);
    const text = (json.result?.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n');
    if (text.trimStart().startsWith('❌')) throw new Error(`${name}: ${text.slice(0, 300)}`);
    return text;
  }
}

export function hasShortname(listText, shortname) {
  return listText.includes(`**Kurzname:** ${shortname}\n`);
}

export function extractId(text, label) {
  const re = new RegExp(`\\*\\*${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?: \\(cmid\\))?:\\*\\*\\s*(\\d+)`);
  const m = text.match(re);
  if (!m) throw new Error(`${label} nicht in Antwort: ${text.slice(0, 160)}`);
  return Number(m[1]);
}

export async function sleepBetween(ms = 1500) { await sleep(ms); }

// Liest aus der Markdown-Antwort von moodle_get_course_contents fuer einen Abschnitt die
// Section-ID und die CMIDs aller Module in Anzeige-Reihenfolge heraus.
// Format (siehe moodle_get_course_contents):
//   ### 📁 Abschnitt 2: Wood
//   - **Section ID:** 26
//   - **Sichtbar:** Ja
//
//   **Module (2):**
//     - 📝 **…** (quiz)
//       - CMID: 54, quiz-ID: 5
//     - 🏷️ **…** (label)
//       - CMID: 69, label-ID: 36
// Gibt null zurueck, wenn der Abschnitt nicht in der Antwort vorkommt.
export function parseSectionModules(contentsText, sectionNum) {
  const re = new RegExp(`### 📁 Abschnitt ${sectionNum}:[^\\n]*\\n([\\s\\S]*?)(?=\\n### 📁 Abschnitt \\d+:|$)`);
  const m = contentsText.match(re);
  if (!m) return null;
  const block = m[1];
  const idMatch = block.match(/\*\*Section ID:\*\*\s*(\d+)/);
  const cmids = [...block.matchAll(/CMID:\s*(\d+)/g)].map((c) => Number(c[1]));
  return { sectionId: idMatch ? Number(idMatch[1]) : null, cmids };
}
