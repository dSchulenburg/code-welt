// Spike: Block-Bilder ueber den MakeCode-Renderer erzeugen.
// Aufruf: node scripts/render-blocks.mjs s02
// Liest die JavaScript-Fassung aus scripts/blocks-js/<id>.js, schreibt src/assets/blocks/<blockImage>.
//
// Renderer am 03.09.2026 nicht erreichbar: Kein "renderready" innerhalb 60s.
// Befund (Spike, Zeitbox eingehalten):
//   - iframe https://minecraft.makecode.com/--docs?render=1 laedt (HTTP 200) und
//     definiert window.pxt.runner.startRenderServer, aber der automatische
//     Trigger (Regex /render=1/i auf window.location.href in der inline-Boot-
//     Logik der Seite) feuert im Headless-Kontext nicht -> kein "renderready"
//     via postMessage, nur ein unabhaengiges {"type":"ready"} vom Simulator-
//     Embed. Erst ein manueller Aufruf von pxt.runner.startRenderServer() im
//     iframe-Kontext (Diagnose ausserhalb dieses Skripts) loeste "renderready"
//     aus - das ist aber kein Aufruf, den ein Doku-Consumer von aussen machen
//     kann/soll, und weicht vom in der Aufgabe beschriebenen Protokoll ab.
//   - Selbst danach schlug die anschliessende "renderblocks"-Anfrage fuer den
//     Minecraft-spezifischen Code (agent/player-Namespace) mit einem internen
//     Fehler "Cannot read properties of undefined (reading 'host')" fehl -
//     vermutlich fehlen im Docs-Render-Kontext die Minecraft-Editor-
//     Extensions/Pakete, die zum Dekompilieren dieser Bloecke noetig sind.
//   - Getestete Varianten:
//       1) https://minecraft.makecode.com/--docs?render=1 (wie oben, Standardpfad
//          aus der Aufgabenstellung) -> renderready timeout nach 60s.
//       2) https://minecraft.makecode.com/--render (aelterer pxt-Pfad, mit und
//          ohne ?render=1) -> HTTP 404, Route existiert auf diesem Server nicht.
//       3) https://minecraft.makecode.com/?render=1 (Root-Origin) -> laedt den
//          vollen interaktiven Editor (kein pxt.runner/startRenderServer im
//          Scope), keine renderready-Nachricht; die Seite ist im Headless-Setup
//          zudem irgendwann gecrasht (zu schwer fuer den 1x1px-iframe-Kontext).
// Rueckfall: manueller Screenshot im Browser-Editor (Projektinhaber, siehe
// Task-7-Brief Schritt 3) statt automatisierter Render-Pipeline.
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolveBrowser } from './resolveBrowser.mjs';
import { STATIONS } from '../src/data/stations.js';

const id = process.argv[2];
if (!id || !STATIONS[id]) { console.error('Station-ID fehlt oder unbekannt'); process.exit(2); }
const js = readFileSync(new URL(`./blocks-js/${id}.js`, import.meta.url), 'utf8');

const HOST = `<!doctype html><html><body>
<iframe id="f" src="https://minecraft.makecode.com/--docs?render=1" style="width:1px;height:1px;border:0"></iframe>
<script>
window.__result = null;
window.addEventListener('message', (ev) => {
  const m = ev.data || {};
  if (m.type === 'renderready') { window.__ready = true; }
  if (m.type === 'renderblocks') { window.__result = { uri: m.uri, width: m.width, height: m.height }; }
});
window.__send = (code) => document.getElementById('f').contentWindow.postMessage({ type: 'renderblocks', id: 'x', code, options: { snippetMode: false } }, '*');
</script></body></html>`;

const browser = await chromium.launch({ executablePath: resolveBrowser(), headless: true });
const page = await browser.newPage();
await page.setContent(HOST);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
await page.evaluate((code) => window.__send(code), js);
await page.waitForFunction(() => window.__result !== null, null, { timeout: 60000 });
const { uri, width, height } = await page.evaluate(() => window.__result);
await browser.close();

const png = Buffer.from(uri.split(',')[1], 'base64');
mkdirSync(new URL('../src/assets/blocks/', import.meta.url), { recursive: true });
const out = new URL(`../src/assets/blocks/${STATIONS[id].blockImage}`, import.meta.url);
writeFileSync(out, png);
console.log(`ok ${STATIONS[id].blockImage} ${width}x${height} ${png.length} bytes`);
