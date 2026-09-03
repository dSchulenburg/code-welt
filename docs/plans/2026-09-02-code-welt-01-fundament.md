# Code-Welt · Plan 1 von 6: Fundament — Implementation Plan

> Verschoben aus dem privaten docker-Repo am 03.09.2026. Pfade wie `docker/ki-kurs-box/…` meinen dort die lokale Kurs-in-a-Box; `docs/…` meint dieses Repo.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein durchgehender Beweis der Architektur: Box vorbereitet, App-Gerüst mit sechs Sprachen, Übersetzungsskript, Moodle-Bauskript, und **eine** Station (DS 2 „Reihenfolge zählt") komplett von der Story bis zum mehrsprachigen Moodle-Quiz.

**Architecture:** Moodle liefert die mehrsprachige Hülle über den Filter `multilang2` (Profilsprache der Lernenden), eine React/Vite-App liefert die Stationsinhalte im iframe und bekommt die Sprache per `?lang=`. Deutsche Inhalte sind die einzige Quelle; fünf Stütz-Übersetzungen entstehen per Skript, und ein Bauskript legt daraus den Moodle-Kurs über den Box-MCP an. Alles aus Git reproduzierbar.

**Tech Stack:** Node 24, React 18, Vite 6, Vitest, Testing Library, prismjs, playwright-core + Edge (kein Chrome auf Deus Machina), `@anthropic-ai/sdk` (Modell `claude-opus-5`), Moodle 5.0 Kurs-in-a-Box (`ki-kurs-moodle`, MCP unter `http://localhost:8000/mcp/rpc`, Key `ki-kurs-lokal`), Bash für die Box-Skripte.

**Spec:** `docs/specs/2026-09-02-code-welt-minecraft-kurs-design.md` — dieser Plan setzt Abschnitt 10 Phase 1 um. Die Pläne 2 bis 6 (Holz+Stein, Eisen+Gold, Diamant bis Enderdrache, Übersetzung+Audio, Gate+Umzug) folgen, sobald dieses Fundament steht, weil sie auf den hier festgelegten Datenstrukturen aufbauen.

## Global Constraints

- **Zwei Repos.** App-Code lebt in `C:\Users\mail\entwicklung\code-welt\` (neu, eigenes Git-Repo, öffentlich `dSchulenburg/code-welt`). Box-Skripte und dieser Plan leben in `C:\Users\mail\entwicklung\docker\` (Branch `master`). Vor jedem Commit `git branch --show-current` prüfen (Memory: Branch kann unter dir gewechselt werden).
- **Sprachen:** genau `de, en, uk, ar, es, it` in dieser Reihenfolge. `de` ist kanonisch. `ar` ist RTL.
- **Deutsch ist Leitsprache.** Übersetzt wird nur die Stütz-Ebene (`src/i18n/*`); die Leit-Ebene (`src/content/de.js`) wird nie übersetzt. Spec 5.3.
- **Multilang-Syntax:** jedes mehrsprachige Moodle-Feld = `{mlang de}…{mlang}{mlang en}…{mlang}…{mlang it}…{mlang}{mlang other}<deutsch>{mlang}`. Quizfragen nie über GIFT (der MCP strippt `{mlang}` dort). Dieser Plan legt Fragen mit `moodle_add_quiz_question_multichoice` an; der XML-Import aus der Spec bleibt der Weg für Fragetypen, die das Einzelfragen-Werkzeug nicht kennt (Plan 2 ff.).
- **Umlaute:** in HTML-Feldern (Label-Inhalt, Quiz-Fragetext, Kurs-Summary) als Entities (`&uuml;`), in Klartextfeldern (Abschnittsname, Aktivitätsname, Fragename) als echte Zeichen. Nicht-lateinische Schrift bleibt immer echtes Unicode.
- **Kursformat** `topics`, Kurzname `code-welt`, 9 Abschnitte (0 bis 8), Abschnitt 1 versteckt.
- **MakeCode-Editor auf Englisch.** Python-Beispiele werden aus dem Browser-Editor `https://minecraft.makecode.com` übernommen (Blöcke bauen → Python-Umschalter → Text kopieren), nie aus dem Gedächtnis geschrieben.
- **Box-Schreibzugriffe** sind erlaubt (lokale Lernbox). **Produktion wird in diesem Plan nicht berührt.**
- **Browser für Skripte:** `playwright-core` mit Edge unter `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe` (Muster `docker/dashboard/smoke/resolveBrowser.mjs`), nie ein Chromium-Download.
- **Commit-Trailer** in beiden Repos, jede Message endet mit:
  ```
  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01CrVe4qxK9KdjDspm6Gr84p
  ```
- **Tests grün vor jedem Commit:** `npm test` (Vitest) im App-Repo.
- **Kein Deploy nach `lernmodule.dirk-schulenburg.net` in diesem Plan** (Phase 6). Die Box bettet die App von `http://localhost:3030/code-welt/` ein.

---

## Dateistruktur

**docker-Repo (neu):**

| Datei | Verantwortung |
|---|---|
| `ki-kurs-box/docker-compose.code-welt.yml` | Overlay: hängt `multilang2` und `customcert` als Bind-Mounts in den Moodle-Container |
| `ki-kurs-box/prepare-code-welt.sh` | Idempotente Box-Vorbereitung: Plugins klonen, Overlay hochfahren, Upgrade, Filter, Sprachpakete, Verifikation |
| `ki-kurs-box/plugins-extra/` | Klone der zwei Plugins (gitignored) |
| `.gitignore` | Eintrag `ki-kurs-box/plugins-extra/` |
| `CLAUDE.md` | Zeile in der Service-Tabelle „Code-Welt (in Arbeit)" |

**App-Repo `code-welt/`:**

| Datei | Verantwortung |
|---|---|
| `package.json`, `vite.config.js`, `index.html`, `.gitignore`, `LICENSE`, `LICENSE-CONTENT.md`, `README.md` | Gerüst, Lizenz (MIT Code, CC BY 4.0 Inhalte) |
| `src/main.jsx`, `src/App.jsx`, `src/styles.css` | Einstieg, Routing, Layout |
| `src/lib/router.js` | Hash-Router `#/` und `#/station/<id>` |
| `src/lib/format.js` | Platzhalter `{n}` füllen |
| `src/lib/merge.js` | `deepMerge(base, overlay)` für Bundle-Fallback auf Deutsch |
| `src/lib/agentSim.js` | Simulation des Agents auf einem Raster (Vorhersage-Übung) |
| `src/lib/parsons.js` | Mischen und Prüfen für das Sortier-Puzzle |
| `src/i18n/index.js` | Sprachregistry, `detectLang` (`?lang=` → localStorage → Browser → de), RTL, `getBundle` |
| `src/i18n/de.js` | **Stütz-Ebene, kanonisch:** ui, glossar, etappen, stations (title, storyShort, bridge, tasks, tipSolution, exercises-Prompts, quiz) |
| `src/i18n/{en,uk,ar,es,it}.js` | generiert von `scripts/translate.mjs` |
| `src/content/de.js` | **Leit-Ebene, nur Deutsch:** story-Dialog, concept, tips 1–3 |
| `src/data/stations.js` | sprachfreie Strukturdaten: ETAPPEN, STATIONS (python, blockImage, exercises-Logik) |
| `src/components/*.jsx` | `LangSwitcher`, `StoryPanel`, `ConceptCard`, `CodeView`, `TaskCard`, `TipLadder`, `AgentGrid`, `ParsonsPuzzle`, `Spielstand`, `StationView`, `Home` |
| `src/assets/blocks/s02-weg.png` | Block-Bild der Station 2 |
| `scripts/translate.mjs` | DE → 5 Sprachen über die Claude-API, `sourceHash` |
| `scripts/resolveBrowser.mjs`, `scripts/smoke.mjs` | App-Smoke in sechs Sprachen |
| `scripts/render-blocks.mjs` | Spike: Block-Bilder über den MakeCode-Render-Dienst |
| `moodle/lib/mcp.mjs` | JSON-RPC-Client für den Moodle-MCP, `callTool`, `extractId` |
| `moodle/lib/mlang.mjs` | `mlang({de,en,…})`, `pick(bundles, path)` |
| `moodle/lib/entities.mjs` | `toEntities(html)` |
| `moodle/probe.mjs` | Encoding- und Multilang-Probe in einem Wegwerfkurs |
| `moodle/course-def.mjs` | Kursdefinition aus Bundles + Strukturdaten |
| `moodle/build-course.mjs` | legt den Kurs an oder aktualisiert ihn, führt `moodle/registry.json` |
| `moodle/registry.json` | CMID-Register pro Umgebung |
| `moodle/php/set-quiz-completion.php` | Abschluss „Bestehensnote erreicht" für alle Quizze eines Kurses |
| `moodle/apply-completion.sh` | kopiert das PHP in den Container und führt es aus |
| `moodle/smoke-box.mjs` | End-to-End in der Box: Profilsprache, Abschnittsnamen, iframe, Quizfrage, RTL |
| `tests/*.test.js(x)` | Vitest |

---

### Task 1: Box-Overlay und Vorbereitungsskript

**Files:**
- Create: `docker/ki-kurs-box/docker-compose.code-welt.yml`
- Create: `docker/ki-kurs-box/prepare-code-welt.sh`
- Modify: `docker/.gitignore` (Eintrag anhängen)

**Interfaces:**
- Produces: eine Box, in der `filter_multilang2` (2.0.5.5) und `mod_customcert` (MOODLE_500_STABLE) installiert sind, die Filter `multilang2` und `codehighlighter` global an sind, `$CFG->stringfilters = 'multilang2'`, Sprachpakete `ar,de,en,es,it,uk` liegen und `$CFG->lang = 'de'` ist. Der MCP bleibt unter `http://localhost:8000/mcp/rpc` erreichbar.

- [ ] **Step 1: Overlay schreiben**

```yaml
# ki-kurs-box/docker-compose.code-welt.yml
# Overlay fuer den Kurs "Code-Welt": zwei Zusatz-Plugins als Bind-Mounts.
# Der Moodle-Code liegt IM Image (kein /var/www/html-Volume), deshalb ueberleben
# per `docker cp` eingespielte Plugins kein `compose down`. Bind-Mounts schon.
#
# Nutzung (immer beide Files, sonst verschwinden die Mounts wieder):
#   docker compose -f docker-compose.yml -f docker-compose.code-welt.yml up -d
# Der Klon der Plugins passiert in prepare-code-welt.sh.
services:
  moodle:
    volumes:
      - ./plugins-extra/multilang2:/var/www/html/filter/multilang2:ro
      - ./plugins-extra/customcert:/var/www/html/mod/customcert:ro
```

- [ ] **Step 2: Vorbereitungsskript schreiben**

```bash
#!/usr/bin/env bash
# ki-kurs-box/prepare-code-welt.sh
# Bereitet die Kurs-in-a-Box fuer "Code-Welt" vor. Idempotent: beliebig oft ausfuehrbar.
#   1. Plugins klonen/aktualisieren  (filter_multilang2 2.0.5.5, mod_customcert MOODLE_500_STABLE)
#   2. Moodle-Container mit Overlay neu erstellen (Bind-Mounts)
#   3. Moodle-Upgrade (installiert die Plugins in der DB)
#   4. Filter multilang2 + codehighlighter an, multilang2 auch auf Ueberschriften
#   5. Sprachpakete de en ar uk es it, Standardsprache de
#   6. Caches leeren, Verifikation ausgeben
set -euo pipefail
cd "$(dirname "$0")"

EXTRA=plugins-extra
mkdir -p "$EXTRA"

clone_or_update() { # url dir ref
  if [ -d "$2/.git" ]; then
    git -C "$2" fetch -q --tags origin
    git -C "$2" checkout -q "$3"
  else
    git clone -q --depth 1 --branch "$3" "$1" "$2"
  fi
  echo "[plugin] $2 @ $3"
}
clone_or_update https://github.com/iarenaza/moodle-filter_multilang2.git "$EXTRA/multilang2" 2.0.5.5
clone_or_update https://github.com/mdjnelson/moodle-mod_customcert.git "$EXTRA/customcert" MOODLE_500_STABLE

echo "[box] Moodle-Container mit Overlay hochfahren"
docker compose -f docker-compose.yml -f docker-compose.code-welt.yml up -d moodle

echo -n "[box] warte auf Moodle "
for i in $(seq 1 60); do
  if curl -sf -o /dev/null http://localhost:8080/login/index.php; then echo "ok"; break; fi
  echo -n "."; sleep 2
  if [ "$i" -eq 60 ]; then echo; echo "Moodle antwortet nicht"; exit 1; fi
done

PHP='docker exec ki-kurs-moodle php'
$PHP /var/www/html/admin/cli/upgrade.php --non-interactive --allow-unstable

$PHP -r '
define("CLI_SCRIPT", true);
require("/var/www/html/config.php");
require_once($CFG->libdir . "/filterlib.php");
filter_set_global_state("multilang2", TEXTFILTER_ON);
filter_set_global_state("codehighlighter", TEXTFILTER_ON);
filter_set_applies_to_strings("multilang2", true);
set_config("lang", "de");
echo "[filter] multilang2 + codehighlighter an, stringfilters gesetzt, lang=de\n";
'

$PHP -r '
define("CLI_SCRIPT", true);
require("/var/www/html/config.php");
$c = new \tool_langimport\controller();
$c->install_languagepacks(["de", "ar", "uk", "es", "it"]);   // en ist Core und immer da
foreach ($c->info as $m) echo "[lang] $m\n";
foreach ($c->errors as $m) echo "[lang] FEHLER $m\n";
'

$PHP /var/www/html/admin/cli/purge_caches.php

echo "=== Verifikation ==="
$PHP -r '
define("CLI_SCRIPT", true);
require("/var/www/html/config.php");
echo "multilang2=" . get_config("filter_multilang2", "version") . "\n";
echo "customcert=" . get_config("mod_customcert", "version") . "\n";
$on = [];
foreach ($DB->get_records("filter_active", ["contextid" => 1]) as $f) if ($f->active == 1) $on[] = $f->filter;
sort($on);
echo "filters_on=" . implode(",", $on) . "\n";
echo "stringfilters=" . $CFG->stringfilters . "\n";
$l = array_keys(get_string_manager()->get_list_of_translations());
sort($l);
echo "langs=" . implode(",", $l) . "\n";
echo "lang=" . $CFG->lang . "\n";
'
```

- [ ] **Step 3: `.gitignore` ergänzen**

Am Ende von `docker/.gitignore` anhängen:

```
# Code-Welt: geklonte Zusatz-Plugins fuer die Box (prepare-code-welt.sh legt sie an)
ki-kurs-box/plugins-extra/
```

- [ ] **Step 4: Skript ausführen**

Run (Git Bash): `bash ki-kurs-box/prepare-code-welt.sh`
Expected, letzte Zeilen:
```
multilang2=2026041801
customcert=<zehnstellige Zahl>
filters_on=activitynames,codehighlighter,displayh5p,emoticon,mathjaxloader,mediaplugin,multilang2,urltolink
stringfilters=multilang2
langs=ar,de,en,es,it,uk
lang=de
```
Wenn `upgrade.php` mit „Plugin … requires …" abbricht: Branch/Tag prüfen (`git -C ki-kurs-box/plugins-extra/customcert log -1`), nicht weitermachen.

- [ ] **Step 5: Nachweis, dass nichts verloren ging**

Run: `docker ps --format '{{.Names}} {{.Status}}' | grep ki-kurs` und `curl -s -X POST http://localhost:8000/mcp/rpc -H 'Content-Type: application/json' -H 'x-api-key: ki-kurs-lokal' -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"moodle_list_courses","arguments":{}}}' | grep -o 'Kurzname:\*\* [A-Za-z0-9-]*'`
Expected: alle fünf `ki-kurs-*` Container `Up`; Kurzname-Liste enthält `KI-HANDEL-MOODLE` (der Box-Kurs ist noch da; das Erststart-Skript hat wegen Marker übersprungen).

- [ ] **Step 6: Zweiter Lauf beweist Idempotenz**

Run: `bash ki-kurs-box/prepare-code-welt.sh | tail -6`
Expected: dieselbe Verifikation, keine Fehler, `[plugin] … @ …` ohne erneuten Klon.

- [ ] **Step 7: Commit (docker-Repo)**

```bash
cd /c/Users/mail/entwicklung/docker && git branch --show-current
git add ki-kurs-box/docker-compose.code-welt.yml ki-kurs-box/prepare-code-welt.sh .gitignore
git commit -m "feat(ki-kurs-box): Code-Welt-Vorbereitung — multilang2, customcert, sechs Sprachpakete

Overlay mit Bind-Mounts statt docker cp, weil der Moodle-Code im Image liegt.
stringfilters=multilang2, damit der Filter auch Abschnitts- und Aktivitaetsnamen trifft.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01CrVe4qxK9KdjDspm6Gr84p"
```

---

### Task 2: App-Repo-Gerüst

**Files:**
- Create: `code-welt/package.json`, `vite.config.js`, `index.html`, `.gitignore`, `LICENSE`, `LICENSE-CONTENT.md`, `README.md`, `src/main.jsx`, `src/App.jsx`, `src/styles.css`, `tests/app.test.jsx`

**Interfaces:**
- Produces: `npm run dev` auf Port 3030 unter Basis `/code-welt/`; `npm test` läuft Vitest mit jsdom; `npm run build` erzeugt `dist/`.

- [ ] **Step 1: Repo anlegen**

```bash
mkdir -p /c/Users/mail/entwicklung/code-welt && cd /c/Users/mail/entwicklung/code-welt && git init -q -b main
```

- [ ] **Step 2: `package.json`**

```json
{
  "name": "code-welt",
  "private": false,
  "version": "0.1.0",
  "type": "module",
  "license": "MIT",
  "author": "Dirk Schulenburg (https://dirk-schulenburg.net)",
  "homepage": "https://lernmodule.dirk-schulenburg.net/code-welt/",
  "description": "Code-Welt: Programmieren lernen mit Minecraft Education. Deutsch als Leitsprache, Stuetze in EN/AR/UK/ES/IT. Open Educational Resource (Inhalte CC BY 4.0).",
  "scripts": {
    "dev": "vite --port 3030",
    "build": "vite build",
    "preview": "vite preview --port 4173",
    "test": "vitest run",
    "test:watch": "vitest",
    "translate": "node scripts/translate.mjs",
    "smoke": "node scripts/smoke.mjs",
    "moodle:build": "node moodle/build-course.mjs",
    "moodle:smoke": "node moodle/smoke-box.mjs"
  },
  "dependencies": {
    "prismjs": "^1.29.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@anthropic-ai/sdk": "^0.90.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.1",
    "playwright-core": "^1.49.0",
    "vite": "^6.0.5",
    "vitest": "^3.2.7"
  }
}
```

Run: `npm install`
Expected: `node_modules/` ohne Fehler. Wenn npm eine neuere Major-Version eines Pakets meldet, die Pinnung beibehalten.

- [ ] **Step 3: `vite.config.js`**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Basis-Pfad ist build-konfigurierbar, damit EIN Code zwei Ziele bedient:
//   Standalone-Image        -> CODEWELT_BASE=/
//   hinter Traefik          -> CODEWELT_BASE=/code-welt/  (Default, auch lokal)
export default defineConfig({
  plugins: [react()],
  base: process.env.CODEWELT_BASE || '/code-welt/',
  server: { port: 3030 },
  build: {
    rollupOptions: { output: { manualChunks: { vendor: ['react', 'react-dom'] } } },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    globals: true,
  },
});
```

- [ ] **Step 4: `tests/setup.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/styles.css`**

`tests/setup.js`:
```js
import '@testing-library/jest-dom/vitest';
```

`index.html`:
```html
<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#1b2a1f" />
    <title>Code-Welt — Programmieren mit Minecraft</title>
    <meta name="description" content="Der Agent versteht nur Code. Lerne Programmieren mit Minecraft Education. Einfaches Deutsch, Stuetze in fuenf Sprachen." />
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      "name": "Code-Welt",
      "description": "Programmieren lernen mit Minecraft Education: Bloecke, dann Python. Deutsch als Leitsprache, Stuetze in EN/AR/UK/ES/IT.",
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "isAccessibleForFree": true,
      "learningResourceType": "interactive exercise",
      "inLanguage": ["de", "en", "uk", "ar", "es", "it"],
      "educationalLevel": "A2-B1",
      "author": { "@type": "Person", "name": "Dirk Schulenburg", "url": "https://dirk-schulenburg.net" }
    }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

`src/main.jsx`:
```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

`src/App.jsx` (Gerüst, wird in Task 6 ersetzt):
```jsx
export default function App() {
  return <main className="page"><h1>Code-Welt</h1></main>;
}
```

`src/styles.css` (Basis; Komponenten-Stile kommen in Task 6):
```css
:root {
  --bg: #f4f1e8;
  --ink: #1b2a1f;
  --accent: #3f8f4a;
  --accent-ink: #ffffff;
  --card: #ffffff;
  --line: #d9d4c7;
  --support: #eef4ff;
  --support-line: #b9c9ea;
  --warn: #b5e505;
  --code-bg: #1e2a24;
  --code-ink: #e8f0e9;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 17px;
  line-height: 1.5;
  color: var(--ink);
  background: var(--bg);
}
* { box-sizing: border-box; }
body { margin: 0; }
.page { max-width: 900px; margin: 0 auto; padding: 16px; }
[dir="rtl"] .page { text-align: right; }
```

- [ ] **Step 5: Ersten Test schreiben und laufen lassen**

`tests/app.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react';
import App from '../src/App.jsx';

test('App rendert die Wortmarke', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /Code-Welt/ })).toBeInTheDocument();
});
```

Run: `npm test`
Expected: `1 passed`.

- [ ] **Step 6: Lizenzen, README, .gitignore**

`.gitignore`:
```
node_modules
dist
.env
*.local
```

`LICENSE`: MIT-Text mit `Copyright (c) 2026 Dirk Schulenburg` (aus `strudel-kurs/LICENSE` kopieren, Jahr prüfen).

`LICENSE-CONTENT.md`:
```markdown
# Lizenz der Inhalte

Texte, Aufgaben, Geschichten, Grafiken und Audio in `src/i18n/`, `src/content/` und `src/assets/`
stehen unter **CC BY 4.0** (https://creativecommons.org/licenses/by/4.0/).
Namensnennung: „Code-Welt, Dirk Schulenburg, dirk-schulenburg.net".

Der Programmcode steht unter MIT (siehe `LICENSE`).

Minecraft ist eine Marke von Mojang/Microsoft. Dieses Projekt ist kein offizielles
Minecraft-Produkt und nicht von Mojang oder Microsoft genehmigt oder mit ihnen verbunden.
```

`README.md`:
```markdown
# Code-Welt — Programmieren lernen mit Minecraft Education

Lern-App zum Moodle-Kurs „Code-Welt" für AVM-Klassen (16–18, Deutsch A2–B1).
Deutsch ist die Leitsprache, Stütze in Englisch, Arabisch, Ukrainisch, Spanisch, Italienisch.

- Design: `docker/docs/specs/2026-09-02-code-welt-minecraft-kurs-design.md` (privates Repo)
- Live: https://lernmodule.dirk-schulenburg.net/code-welt/ (ab Phase 6)

## Entwickeln

    npm install
    npm run dev        # http://localhost:3030/code-welt/
    npm test

## Sprachen

`src/i18n/de.js` ist die Quelle. `npm run translate -- --lang all` erzeugt die fünf anderen
Dateien (braucht `ANTHROPIC_API_KEY`). `src/content/de.js` wird nie übersetzt.

## Moodle

`npm run moodle:build` legt den Kurs in der Kurs-in-a-Box an oder aktualisiert ihn
(`moodle/registry.json` merkt sich die IDs). `npm run moodle:smoke` prüft ihn End-to-End.
```

- [ ] **Step 7: GitHub-Repo und erster Commit**

```bash
git add -A && git commit -q -m "chore: scaffold code-welt (vite, react, vitest)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01CrVe4qxK9KdjDspm6Gr84p"
gh repo create dSchulenburg/code-welt --public --source=. --remote=origin --push \
  --description "Code-Welt: Programmieren lernen mit Minecraft Education (OER, CC BY 4.0)"
```

Expected: `https://github.com/dSchulenburg/code-welt` existiert, Branch `main` gepusht. Die Spec sieht das öffentliche Repo vor (Abschnitt 5.1).

---

### Task 3: Sprachregistry mit `?lang=` und RTL

**Files:**
- Create: `code-welt/src/i18n/index.js`, `src/i18n/{en,uk,ar,es,it}.js` (leer), `src/lib/merge.js`, `src/lib/format.js`
- Test: `tests/i18n.test.js`, `tests/merge.test.js`

**Interfaces:**
- Produces: `LANGS` (Array von `{code,label,flag}`), `RTL` (Set), `DEFAULT_LANG='de'`, `detectLang() → code`, `saveLang(code)`, `applyDir(code)`, `getBundle(code) → deepMerge(de, bundle)`, `isSupport(code) → code !== 'de'`, `deepMerge(base, overlay)`, `format(str, vars)`.
- `src/i18n/de.js` wird in Task 4 gefüllt; hier existiert es als `export default { ui: {}, glossary: {}, etappen: {}, stations: {} }`.

- [ ] **Step 1: Failing tests**

`tests/merge.test.js`:
```js
import { deepMerge } from '../src/lib/merge.js';

test('deepMerge nimmt Overlay-Werte und faellt sonst auf base zurueck', () => {
  const base = { a: 1, n: { x: 'de', y: 'de' }, arr: ['a', 'b'] };
  const over = { n: { x: 'uk' }, arr: ['c'] };
  expect(deepMerge(base, over)).toEqual({ a: 1, n: { x: 'uk', y: 'de' }, arr: ['c'] });
});

test('deepMerge veraendert base nicht', () => {
  const base = { n: { x: 'de' } };
  deepMerge(base, { n: { x: 'uk' } });
  expect(base.n.x).toBe('de');
});
```

`tests/i18n.test.js`:
```js
import { LANGS, RTL, DEFAULT_LANG, detectLang, saveLang, applyDir, getBundle, isSupport } from '../src/i18n/index.js';

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/code-welt/');
});

test('sechs Sprachen in fester Reihenfolge, nur ar ist RTL', () => {
  expect(LANGS.map((l) => l.code)).toEqual(['de', 'en', 'uk', 'ar', 'es', 'it']);
  expect([...RTL]).toEqual(['ar']);
  expect(DEFAULT_LANG).toBe('de');
});

test('?lang= gewinnt ueber localStorage', () => {
  saveLang('es');
  window.history.replaceState({}, '', '/code-welt/?lang=uk');
  expect(detectLang()).toBe('uk');
});

test('localStorage gewinnt ueber Browser-Sprache, unbekannte Sprache faellt auf de', () => {
  saveLang('it');
  expect(detectLang()).toBe('it');
  window.history.replaceState({}, '', '/code-welt/?lang=xx');
  expect(detectLang()).toBe('it');
  localStorage.clear();
  expect(['de', 'en', 'uk', 'ar', 'es', 'it']).toContain(detectLang());
});

test('applyDir setzt lang und dir', () => {
  applyDir('ar');
  expect(document.documentElement.getAttribute('dir')).toBe('rtl');
  expect(document.documentElement.getAttribute('lang')).toBe('ar');
  applyDir('de');
  expect(document.documentElement.getAttribute('dir')).toBe('ltr');
});

test('getBundle faellt feldweise auf Deutsch zurueck; de ist keine Stuetze', () => {
  const de = getBundle('de');
  const uk = getBundle('uk');
  expect(Object.keys(uk)).toEqual(Object.keys(de));
  expect(isSupport('de')).toBe(false);
  expect(isSupport('uk')).toBe(true);
});
```

Run: `npm test`
Expected: FAIL, Module nicht gefunden.

- [ ] **Step 2: Implementieren**

`src/lib/merge.js`:
```js
// Tiefe Zusammenfuehrung: Werte aus overlay ersetzen base, fehlende Felder bleiben aus base.
// Arrays werden als Ganzes ersetzt (eine uebersetzte Aufgabenliste ersetzt die deutsche).
export function deepMerge(base, overlay) {
  if (Array.isArray(base) || Array.isArray(overlay)) return overlay === undefined ? base : overlay;
  if (typeof base !== 'object' || base === null) return overlay === undefined ? base : overlay;
  const out = { ...base };
  if (overlay && typeof overlay === 'object') {
    for (const [k, v] of Object.entries(overlay)) {
      out[k] = k in base ? deepMerge(base[k], v) : v;
    }
  }
  return out;
}
```

`src/lib/format.js`:
```js
// format('Station {n}', { n: 2 }) -> 'Station 2'. Unbekannte Platzhalter bleiben stehen.
export function format(str, vars = {}) {
  return String(str).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}
```

`src/i18n/de.js` (Gerüst, Task 4 füllt es):
```js
export default { ui: {}, glossary: {}, etappen: {}, stations: {} };
```

`src/i18n/en.js`, `uk.js`, `ar.js`, `es.js`, `it.js` — je:
```js
// Wird von scripts/translate.mjs erzeugt. Bis dahin leer; die App faellt auf Deutsch zurueck.
export default {};
```

`src/i18n/index.js`:
```js
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
```

- [ ] **Step 3: Tests grün**

Run: `npm test`
Expected: alle Tests `passed` (app, merge, i18n).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -q -m "feat(i18n): six-language registry, ?lang= detection, RTL, deep-merge fallback to German

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01CrVe4qxK9KdjDspm6Gr84p"
```

---

### Task 4: Inhaltsmodell und Station 2 auf Deutsch

**Files:**
- Create: `code-welt/src/data/stations.js`, `src/content/de.js`
- Modify: `src/i18n/de.js`
- Test: `tests/content.test.js`

**Interfaces:**
- Produces:
  - `ETAPPEN`: Array `{ id, emoji, stations: [ids] }` in Kursreihenfolge (`holz, stein, eisen, gold, diamant, netherite, enderdrache`).
  - `STATIONS[id]`: `{ etappe, ds, python, blockImage, exercises: [ {type:'predict', grid:{w,h}, start:{x,y,dir}, program:[…]}, {type:'parsons', lines:[…]} ] }` — sprachfrei.
  - `i18n.de.stations[id]`: `{ title, storyShort, bridge:{game, code}, tasks:[{kind,title,text}×3], tipSolution, exercises:[{prompt}×n], quiz:[{q, answers:[{text, correct}]}×4] }`.
  - `content.de.stations[id]`: `{ story:[{who:'nour'|'dani', text}], concept:[…Absätze], tips:[3 Strings] }`.
  - `i18n.de.ui` und `i18n.de.glossary` (Begriffe mit `term` und `short`).
- Alle späteren Stationen folgen exakt diesem Schema.

- [ ] **Step 1: Python-Beispiel im Browser-Editor verifizieren (manuell, Dirk oder Ausführende:r mit Edge)**

Auf `https://minecraft.makecode.com` → *New Project* → Blöcke zusammenklicken:
`on chat command "weg"` → `agent teleport to player` → `agent set item grass 64 in slot 1` → `agent move forward by 1` → `agent place back` → `agent move forward by 1` → `agent place back` → `agent turn left` → `agent move forward by 1` → `agent place back`.
Dann oben auf **Python** umschalten und den Text wörtlich kopieren. Erwartete Form (falls der Editor abweicht, gilt der Editor):

```python
def on_weg():
    agent.teleport_to_player()
    agent.set_item(GRASS, 64, 1)
    agent.move(FORWARD, 1)
    agent.place(BACK)
    agent.move(FORWARD, 1)
    agent.place(BACK)
    agent.turn(LEFT_TURN)
    agent.move(FORWARD, 1)
    agent.place(BACK)
player.on_chat("weg", on_weg)
```

Den verifizierten Text in `STATIONS.s02.python` eintragen. Zusätzlich das Programm einmal im Spiel laufen lassen (Chat `weg`): Erwartet ist eine Reihe aus drei Grasblöcken, die um die Ecke geht.

- [ ] **Step 2: Failing test**

`tests/content.test.js`:
```js
import { ETAPPEN, STATIONS } from '../src/data/stations.js';
import de from '../src/i18n/de.js';
import content from '../src/content/de.js';

test('Etappen in Kursreihenfolge, jede Station genau einer Etappe zugeordnet', () => {
  expect(ETAPPEN.map((e) => e.id)).toEqual(['holz', 'stein', 'eisen', 'gold', 'diamant', 'netherite', 'enderdrache']);
  for (const e of ETAPPEN) for (const sid of e.stations) expect(STATIONS[sid].etappe).toBe(e.id);
});

test('jede Station hat Stuetz-Ebene und Leit-Ebene mit vollstaendigem Schema', () => {
  for (const [id, s] of Object.entries(STATIONS)) {
    const t = de.stations[id];
    const c = content.stations[id];
    expect(t, id).toBeDefined();
    expect(c, id).toBeDefined();
    expect(typeof t.title).toBe('string');
    expect(typeof t.storyShort).toBe('string');
    expect(Object.keys(t.bridge)).toEqual(['game', 'code']);
    expect(t.tasks.map((x) => x.kind)).toEqual(['auftrag', 'nochEiner', 'remix']);
    expect(t.exercises).toHaveLength(s.exercises.length);
    expect(t.quiz.length).toBeGreaterThanOrEqual(3);
    for (const q of t.quiz) expect(q.answers.filter((a) => a.correct)).toHaveLength(1);
    expect(c.story.length).toBeGreaterThanOrEqual(3);
    expect(c.story.every((l) => ['nour', 'dani'].includes(l.who))).toBe(true);
    expect(c.tips).toHaveLength(3);
    expect(typeof s.python).toBe('string');
    expect(s.python.length).toBeGreaterThan(20);
  }
});

test('Etappennamen und UI-Strings vorhanden', () => {
  for (const e of ETAPPEN) expect(typeof de.etappen[e.id].name).toBe('string');
  for (const k of ['appTitle', 'home', 'support', 'supportShow', 'supportHide', 'station', 'check', 'next', 'prev', 'play', 'langLabel'])
    expect(typeof de.ui[k], k).toBe('string');
});
```

Run: `npm test`
Expected: FAIL (`src/data/stations.js` fehlt).

- [ ] **Step 3: `src/data/stations.js`**

```js
// Sprachfreie Strukturdaten. Alles Uebersetzbare liegt in src/i18n/<lang>.js,
// alles Deutsche der Leit-Ebene in src/content/de.js — beide mit denselben Station-IDs.
export const ETAPPEN = [
  { id: 'holz', emoji: '🪵', stations: ['s02'] },
  { id: 'stein', emoji: '🪨', stations: [] },
  { id: 'eisen', emoji: '⛏️', stations: [] },
  { id: 'gold', emoji: '🟡', stations: [] },
  { id: 'diamant', emoji: '💎', stations: [] },
  { id: 'netherite', emoji: '🏙️', stations: [] },
  { id: 'enderdrache', emoji: '🐉', stations: [] },
];

export const STATIONS = {
  s02: {
    etappe: 'holz',
    ds: 2,
    // Aus dem Browser-Editor uebernommen (Task 4 Step 1), nicht abgetippt.
    python: `def on_weg():
    agent.teleport_to_player()
    agent.set_item(GRASS, 64, 1)
    agent.move(FORWARD, 1)
    agent.place(BACK)
    agent.move(FORWARD, 1)
    agent.place(BACK)
    agent.turn(LEFT_TURN)
    agent.move(FORWARD, 1)
    agent.place(BACK)
player.on_chat("weg", on_weg)`,
    blockImage: 's02-weg.png',
    exercises: [
      {
        type: 'predict',
        grid: { w: 5, h: 5 },
        start: { x: 2, y: 4, dir: 'N' },
        program: ['forward 2', 'left', 'forward 1'],
      },
      {
        type: 'parsons',
        lines: [
          'agent.teleport_to_player()',
          'agent.move(FORWARD, 2)',
          'agent.turn(LEFT_TURN)',
          'agent.move(FORWARD, 1)',
        ],
      },
    ],
  },
};
```

- [ ] **Step 4: `src/content/de.js` (Leit-Ebene, nie übersetzt)**

```js
// Leit-Ebene: nur Deutsch, einfache Sprache (A2/B1). Kurze Saetze. Ein Gedanke pro Satz.
// Dialog: Nour war letztes Jahr im Kurs. Dani ist neu und fragt, was alle fragen.
export default {
  stations: {
    s02: {
      story: [
        { who: 'dani', text: 'Gestern habe ich dem Agent gesagt: Geh los! Er hat nichts gemacht.' },
        { who: 'nour', text: 'Klar. Der Agent versteht kein Deutsch. Nur Code.' },
        { who: 'dani', text: 'Und wenn ich ihm drei Befehle gebe?' },
        { who: 'nour', text: 'Dann macht er sie. Einen nach dem anderen. Genau in der Reihenfolge.' },
        { who: 'dani', text: 'Also ist die Reihenfolge wichtig?' },
        { who: 'nour', text: 'Sehr wichtig. Erst gehen, dann drehen ist etwas anderes als erst drehen, dann gehen. Probier es aus.' },
      ],
      concept: [
        'Ein Programm ist eine Liste von Befehlen. Der Agent liest die Liste von oben nach unten.',
        'Er macht jeden Befehl genau einmal. Dann kommt der nächste Befehl.',
        'Das nennt man eine Sequenz. Sequenz heißt: Reihenfolge.',
        'Der Agent denkt nicht mit. Wenn die Reihenfolge falsch ist, geht er falsch. Das ist kein Fehler von dir. Das ist ein Missverständnis. Du kannst es reparieren.',
      ],
      tips: [
        'Frage: Was macht der Agent zuerst? Lies dein Programm von oben nach unten.',
        'Richtung: Der Agent geht, wohin seine Nase zeigt. Nach agent.turn(LEFT_TURN) zeigt die Nase nach links.',
        'Gerüst: Erst agent.move(FORWARD, ___), dann agent.turn(___), dann agent.move(FORWARD, ___). Setze die Zahlen ein.',
      ],
    },
  },
};
```

- [ ] **Step 5: `src/i18n/de.js` (Stütz-Ebene, kanonisch)**

```js
// Stuetz-Ebene, kanonische Quelle. Alle anderen Sprachdateien werden aus dieser Datei
// erzeugt (scripts/translate.mjs) und haben dieselbe Form.
// Regeln: einfache Sprache (A2/B1), kurze Saetze. Code-Woerter (agent.move, FORWARD)
// bleiben wie sie sind. Platzhalter wie {n} bleiben in jeder Sprache erhalten.
export default {
  ui: {
    appTitle: 'Code-Welt',
    tagline: 'Der Agent versteht nur Code.',
    home: 'Übersicht',
    station: 'Station {n}',
    ds: 'Doppelstunde {n}',
    support: 'In deiner Sprache',
    supportShow: 'Hilfe in deiner Sprache anzeigen',
    supportHide: 'Hilfe ausblenden',
    storyHeading: 'Die Geschichte',
    conceptHeading: 'Die Idee',
    bridgeGame: 'Im Spiel',
    bridgeCode: 'Im Code',
    blocksLabel: 'So sieht es als Blöcke aus',
    pythonLabel: 'So sieht es als Python aus',
    tasksHeading: 'Deine Aufgaben im Spiel',
    taskAuftrag: 'Auftrag',
    taskNochEiner: 'Noch einer',
    taskRemix: 'Remix',
    tipsHeading: 'Tipp-Leiter',
    tipStep: 'Tipp {n}',
    tipSolution: 'Lösung',
    tipRemixNote: 'Wenn du die Lösung nimmst: Ändere danach eine Sache. Das ist Pflicht.',
    check: 'Check',
    checkHeading: 'Verstanden?',
    predictPrompt: 'Wo steht der Agent am Ende? Klicke auf das Feld.',
    predictRight: 'Richtig! Der Agent steht genau da.',
    predictWrong: 'Noch nicht. Lies das Programm von oben nach unten. Wohin zeigt die Nase?',
    parsonsPrompt: 'Bring die Zeilen in die richtige Reihenfolge.',
    parsonsUp: 'nach oben',
    parsonsDown: 'nach unten',
    parsonsCheck: 'Prüfen',
    parsonsRight: 'Richtig! Das ist die Reihenfolge.',
    parsonsWrong: 'Noch nicht. Was muss der Agent zuerst tun?',
    spielstandHeading: 'Spielstand',
    spielstandPrompt: 'Was kannst du jetzt? Schreib drei kurze Sätze.',
    spielstandSave: 'Speichern',
    spielstandSaved: 'Gespeichert. Nur auf diesem Gerät.',
    progress: 'Du hast {done} von {total} Stationen besucht.',
    next: 'Weiter',
    prev: 'Zurück',
    play: 'Vorlesen',
    langLabel: 'Sprache',
    footer: 'Ein Lernmodul von Dirk Schulenburg · CC BY 4.0 · Kein offizielles Minecraft-Produkt.',
  },

  glossary: {
    befehl: { term: 'Befehl', short: 'Eine Zeile Code. Der Agent macht genau das.' },
    programm: { term: 'Programm', short: 'Viele Befehle, von oben nach unten.' },
    sequenz: { term: 'Sequenz', short: 'Die Reihenfolge der Befehle.' },
    agent: { term: 'Agent', short: 'Der Roboter in Minecraft. Er versteht nur Code.' },
    zauberwort: { term: 'Zauberwort', short: 'Ein Wort im Chat. Es startet dein Programm.' },
    python: { term: 'Python', short: 'Eine Programmiersprache. Dein Code als Text.' },
    bloecke: { term: 'Blöcke', short: 'Dein Code als Bausteine zum Ziehen.' },
    fehler: { term: 'Fehler', short: 'Der Agent hat dich falsch verstanden. Du kannst es reparieren.' },
  },

  etappen: {
    holz: { name: 'Holz' },
    stein: { name: 'Stein' },
    eisen: { name: 'Eisen' },
    gold: { name: 'Gold' },
    diamant: { name: 'Diamant' },
    netherite: { name: 'Netherite' },
    enderdrache: { name: 'Enderdrache' },
  },

  stations: {
    s02: {
      title: 'Reihenfolge zählt',
      storyShort: 'Der Agent macht Befehle genau in der Reihenfolge, wie du sie schreibst. Erst gehen, dann drehen ist nicht dasselbe wie erst drehen, dann gehen.',
      bridge: {
        game: 'Der Agent geht Schritt für Schritt und legt hinter sich Blöcke ab.',
        code: 'Ein Programm ist eine Liste von Befehlen. Der Computer macht sie von oben nach unten.',
      },
      tasks: [
        { kind: 'auftrag', title: 'Der Weg', text: 'Schreibe das Zauberwort weg in den Chat. Der Agent legt drei Blöcke. Schau genau: Wo ist die Ecke?' },
        { kind: 'nochEiner', title: 'Länger', text: 'Ändere das Programm. Der Agent soll fünf Blöcke legen, dann um die Ecke, dann noch zwei.' },
        { kind: 'remix', title: 'Dein Muster', text: 'Baue ein eigenes Muster aus Blöcken. Zum Beispiel ein Z oder ein U. Zeig es deinem Partner oder deiner Partnerin.' },
      ],
      tipSolution: 'Für fünf Blöcke: Schreibe agent.move(FORWARD, 1) und agent.place(BACK) fünfmal. Dann agent.turn(LEFT_TURN). Dann noch zweimal move und place.',
      exercises: [
        { prompt: 'Der Agent steht unten in der Mitte. Seine Nase zeigt nach oben. Das Programm: 2 Schritte vor, links drehen, 1 Schritt vor.' },
        { prompt: 'Der Agent soll zu dir kommen, zwei Schritte gehen, links drehen und noch einen Schritt gehen.' },
      ],
      quiz: [
        {
          q: 'Der Agent soll 3 Schritte gehen und dann nach links drehen. Welche Reihenfolge ist richtig?',
          answers: [
            { text: 'Erst agent.move(FORWARD, 3), dann agent.turn(LEFT_TURN)', correct: true },
            { text: 'Erst agent.turn(LEFT_TURN), dann agent.move(FORWARD, 3)', correct: false },
            { text: 'Die Reihenfolge ist egal', correct: false },
          ],
        },
        {
          q: 'Du schreibst agent.move(FORWARD, 3) zweimal untereinander. Was macht der Agent?',
          answers: [
            { text: 'Er geht 6 Schritte', correct: true },
            { text: 'Er geht 3 Schritte', correct: false },
            { text: 'Er meldet einen Fehler', correct: false },
          ],
        },
        {
          q: 'Wann startet dein Programm?',
          answers: [
            { text: 'Wenn du das Zauberwort in den Chat schreibst', correct: true },
            { text: 'Sofort, wenn du den Code Builder öffnest', correct: false },
            { text: 'Wenn du den Agent anklickst', correct: false },
          ],
        },
        {
          q: 'Der Agent versteht …',
          answers: [
            { text: 'nur Code', correct: true },
            { text: 'Deutsch und Englisch', correct: false },
            { text: 'jede Sprache', correct: false },
          ],
        },
      ],
    },
  },
};
```

- [ ] **Step 6: Tests grün**

Run: `npm test`
Expected: alle `passed`.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -q -m "feat(content): station model and DS 2 'Reihenfolge zaehlt' in German (support + lead layer)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01CrVe4qxK9KdjDspm6Gr84p"
```

---

### Task 5: Agent-Simulation und Sortier-Logik (TDD)

**Files:**
- Create: `code-welt/src/lib/agentSim.js`, `src/lib/parsons.js`
- Test: `tests/agentSim.test.js`, `tests/parsons.test.js`

**Interfaces:**
- Produces: `simulate(grid, start, program) → { x, y, dir, trail: [{x,y}] }`. Koordinaten: `x` nach rechts, `y` nach unten (0 oben), `dir ∈ N,E,S,W`. Befehle: `forward n`, `left`, `right`. Der Agent läuft nicht aus dem Raster (Clamp).
- `shuffleDeterministic(lines, seed) → lines'` (nie identisch mit Eingabe bei ≥ 2 Zeilen), `checkOrder(current, solution) → boolean`.

- [ ] **Step 1: Failing tests**

`tests/agentSim.test.js`:
```js
import { simulate, turn } from '../src/lib/agentSim.js';

const grid = { w: 5, h: 5 };

test('turn dreht im Uhrzeigersinn und dagegen', () => {
  expect(turn('N', 'left')).toBe('W');
  expect(turn('N', 'right')).toBe('E');
  expect(turn('W', 'left')).toBe('S');
  expect(turn('S', 'right')).toBe('W');
});

test('forward folgt der Nase; Beispiel aus Station 2', () => {
  const r = simulate(grid, { x: 2, y: 4, dir: 'N' }, ['forward 2', 'left', 'forward 1']);
  expect(r).toMatchObject({ x: 1, y: 2, dir: 'W' });
  expect(r.trail).toEqual([{ x: 2, y: 4 }, { x: 2, y: 3 }, { x: 2, y: 2 }, { x: 1, y: 2 }]);
});

test('Reihenfolge zaehlt: erst drehen, dann gehen landet woanders', () => {
  const a = simulate(grid, { x: 2, y: 4, dir: 'N' }, ['forward 2', 'left']);
  const b = simulate(grid, { x: 2, y: 4, dir: 'N' }, ['left', 'forward 2']);
  expect([a.x, a.y]).toEqual([2, 2]);
  expect([b.x, b.y]).toEqual([0, 4]);
});

test('Agent bleibt im Raster', () => {
  const r = simulate(grid, { x: 0, y: 0, dir: 'N' }, ['forward 3']);
  expect(r).toMatchObject({ x: 0, y: 0 });
});

test('unbekannter Befehl wirft', () => {
  expect(() => simulate(grid, { x: 0, y: 0, dir: 'N' }, ['jump'])).toThrow(/jump/);
});
```

`tests/parsons.test.js`:
```js
import { shuffleDeterministic, checkOrder } from '../src/lib/parsons.js';

const lines = ['a', 'b', 'c', 'd'];

test('shuffleDeterministic ist reproduzierbar und nie die Loesung', () => {
  const s1 = shuffleDeterministic(lines, 7);
  const s2 = shuffleDeterministic(lines, 7);
  expect(s1).toEqual(s2);
  expect(s1).not.toEqual(lines);
  expect([...s1].sort()).toEqual([...lines].sort());
});

test('checkOrder vergleicht Position fuer Position', () => {
  expect(checkOrder(['a', 'b', 'c', 'd'], lines)).toBe(true);
  expect(checkOrder(['b', 'a', 'c', 'd'], lines)).toBe(false);
  expect(checkOrder(['a', 'b', 'c'], lines)).toBe(false);
});
```

Run: `npm test`
Expected: FAIL, Module fehlen.

- [ ] **Step 2: Implementieren**

`src/lib/agentSim.js`:
```js
// Kleine Simulation des Minecraft-Agents auf einem Raster fuer die Vorhersage-Uebung.
// x nach rechts, y nach unten (0 = oben). Nase: N E S W.
const DIRS = ['N', 'E', 'S', 'W'];
const DELTA = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };

export function turn(dir, side) {
  const i = DIRS.indexOf(dir);
  return side === 'left' ? DIRS[(i + 3) % 4] : DIRS[(i + 1) % 4];
}

export function simulate(grid, start, program) {
  let { x, y, dir } = start;
  const trail = [{ x, y }];
  for (const raw of program) {
    const [cmd, arg] = String(raw).trim().split(/\s+/);
    if (cmd === 'left' || cmd === 'right') { dir = turn(dir, cmd); continue; }
    if (cmd === 'forward') {
      const n = Number(arg || 1);
      for (let k = 0; k < n; k++) {
        const nx = Math.min(grid.w - 1, Math.max(0, x + DELTA[dir][0]));
        const ny = Math.min(grid.h - 1, Math.max(0, y + DELTA[dir][1]));
        if (nx === x && ny === y) break; // Rand
        x = nx; y = ny;
        trail.push({ x, y });
      }
      continue;
    }
    throw new Error(`Unbekannter Befehl: ${cmd}`);
  }
  return { x, y, dir, trail };
}
```

`src/lib/parsons.js`:
```js
// Sortier-Puzzle (Parsons-Problem): Zeilen mischen und Reihenfolge pruefen.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleDeterministic(lines, seed = 1) {
  if (lines.length < 2) return [...lines];
  const rnd = mulberry32(seed);
  let out;
  let guard = 0;
  do {
    out = [...lines];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    guard++;
  } while (out.every((l, i) => l === lines[i]) && guard < 20);
  if (out.every((l, i) => l === lines[i])) out = [...lines.slice(1), lines[0]];
  return out;
}

export function checkOrder(current, solution) {
  return current.length === solution.length && current.every((l, i) => l === solution[i]);
}
```

- [ ] **Step 3: Tests grün, Commit**

Run: `npm test` → alle `passed`.

```bash
git add -A && git commit -q -m "feat(lib): agent grid simulation and parsons shuffle/check (tdd)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01CrVe4qxK9KdjDspm6Gr84p"
```

---

### Task 6: Komponenten, Station-Ansicht, Startseite

**Files:**
- Create: `code-welt/src/lib/router.js`, `src/components/{LangSwitcher,StoryPanel,ConceptCard,CodeView,TaskCard,TipLadder,AgentGrid,ParsonsPuzzle,Spielstand,StationView,Home}.jsx`, `src/assets/characters/{nour,dani}.svg`, `src/assets/blocks/.gitkeep`
- Modify: `src/App.jsx`, `src/styles.css`
- Test: `tests/station.test.jsx`

**Interfaces:**
- Consumes: alles aus Task 3–5.
- Produces: Routen `#/` (Home) und `#/station/<id>`; `StationView({ id, lang })` rendert die Leit-Ebene auf Deutsch und, wenn `lang !== 'de'`, die Stütz-Ebene aus `getBundle(lang)` in aufklappbaren Blöcken; `AgentGrid` ist zugleich Übung (Klick → Auswertung mit `simulate`); `ParsonsPuzzle` mit ↑/↓-Buttons.
- Charakterbilder: einfache SVG-Silhouetten mit Namen als Zwischenstand; die Comic-Charaktere aus der Media Factory ersetzen sie in Plan 2 unter denselben Dateinamen.

- [ ] **Step 1: Failing test**

`tests/station.test.jsx`:
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import StationView from '../src/components/StationView.jsx';

test('Station 2 zeigt Titel, Dialog, Python und Aufgaben auf Deutsch', () => {
  const { container } = render(<StationView id="s02" lang="de" />);
  expect(screen.getByRole('heading', { name: /Reihenfolge zählt/ })).toBeInTheDocument();
  expect(screen.getByText(/Der Agent versteht kein Deutsch/)).toBeInTheDocument();
  // Prism zerlegt den Code in Token-Spans, deshalb den Gesamttext des Code-Blocks pruefen
  expect(container.querySelector('.code pre code').textContent).toMatch(/agent\.turn\(LEFT_TURN\)/);
  expect(screen.getAllByText(/Auftrag/).length).toBeGreaterThan(0);
  expect(screen.queryByText(/Hilfe in deiner Sprache/)).not.toBeInTheDocument();
});

test('mit Stuetzsprache erscheint der Umschalter, Deutsch bleibt sichtbar', () => {
  const { container } = render(<StationView id="s02" lang="uk" />);
  expect(screen.getByText(/Der Agent versteht kein Deutsch/)).toBeInTheDocument();
  const toggle = container.querySelector('.btn-support');
  expect(toggle).not.toBeNull();
  // Stuetze ist beim Laden eingeblendet; einmal aus, einmal wieder an
  expect(screen.getAllByTestId('support').length).toBeGreaterThan(0);
  fireEvent.click(toggle);
  expect(screen.queryAllByTestId('support')).toHaveLength(0);
  fireEvent.click(toggle);
  expect(screen.getAllByTestId('support').length).toBeGreaterThan(0);
});

test('Vorhersage-Raster wertet Klick aus', () => {
  render(<StationView id="s02" lang="de" />);
  fireEvent.click(screen.getByTestId('cell-1-2'));
  expect(screen.getByText(/Richtig! Der Agent steht genau da/)).toBeInTheDocument();
});

test('Sortier-Puzzle laesst sich loesen', () => {
  render(<StationView id="s02" lang="de" />);
  const list = screen.getByTestId('parsons');
  // Solange sortieren, bis die Reihenfolge stimmt: Zeile "teleport" ganz nach oben usw.
  const want = ['agent.teleport_to_player()', 'agent.move(FORWARD, 2)', 'agent.turn(LEFT_TURN)', 'agent.move(FORWARD, 1)'];
  for (let target = 0; target < want.length; target++) {
    for (let guard = 0; guard < 10; guard++) {
      const items = [...list.querySelectorAll('li')].map((li) => li.dataset.line);
      const pos = items.indexOf(want[target]);
      if (pos === target) break;
      fireEvent.click(list.querySelectorAll('li')[pos].querySelector('button[data-dir="up"]'));
    }
  }
  fireEvent.click(screen.getByRole('button', { name: /Prüfen/ }));
  expect(screen.getByText(/Richtig! Das ist die Reihenfolge/)).toBeInTheDocument();
});
```

Run: `npm test` → FAIL (StationView fehlt).

- [ ] **Step 2: Router**

`src/lib/router.js`:
```js
import { useEffect, useState } from 'react';

/** Hash-Router ohne Abhaengigkeit.  #/  -> home   #/station/<id> -> Station */
export function parseHash(hash) {
  const clean = (hash || '').replace(/^#\/?/, '');
  const [path, param] = clean.split('/');
  if (path === 'station' && param) return { view: 'station', id: param };
  return { view: 'home' };
}

export function navigate(path) {
  window.location.hash = path.startsWith('#') ? path : `#${path}`;
  window.scrollTo({ top: 0 });
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
```

- [ ] **Step 3: Kleine Komponenten**

`src/components/LangSwitcher.jsx`:
```jsx
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
```

`src/components/Support.jsx` (Hilfsbaustein für die Stütz-Ebene, in mehreren Komponenten genutzt):
```jsx
// Zeigt einen Stuetz-Text unter dem deutschen Text. Nur sichtbar, wenn eine
// Stuetzsprache aktiv ist UND die Person die Hilfe eingeblendet hat.
export default function Support({ show, children }) {
  if (!show || !children) return null;
  return <div className="support" data-testid="support">{children}</div>;
}
```

`src/components/StoryPanel.jsx`:
```jsx
import nour from '../assets/characters/nour.svg';
import dani from '../assets/characters/dani.svg';
import Support from './Support.jsx';

const FACE = { nour, dani };
const NAME = { nour: 'Nour', dani: 'Dani' };

export default function StoryPanel({ lines, short, ui, showSupport }) {
  return (
    <section className="card story" aria-labelledby="story-h">
      <h2 id="story-h">{ui.storyHeading}</h2>
      {lines.map((l, i) => (
        <div key={i} className={`bubble bubble-${l.who}`}>
          <img src={FACE[l.who]} alt="" width="48" height="48" />
          <div>
            <strong>{NAME[l.who]}</strong>
            <p>{l.text}</p>
          </div>
        </div>
      ))}
      <Support show={showSupport}>{short}</Support>
    </section>
  );
}
```

`src/components/CodeView.jsx`:
```jsx
import Prism from 'prismjs';
import 'prismjs/components/prism-python.js';

export default function CodeView({ code, label }) {
  const html = Prism.highlight(code, Prism.languages.python, 'python');
  return (
    <figure className="code">
      {label && <figcaption>{label}</figcaption>}
      <pre><code className="language-python" dangerouslySetInnerHTML={{ __html: html }} /></pre>
    </figure>
  );
}
```

`src/components/ConceptCard.jsx`:
```jsx
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
```

`src/components/TaskCard.jsx`:
```jsx
import Support from './Support.jsx';

const LABEL = { auftrag: 'taskAuftrag', nochEiner: 'taskNochEiner', remix: 'taskRemix' };

export default function TaskCard({ tasks, supportTasks, ui, showSupport }) {
  return (
    <section className="card tasks" aria-labelledby="tasks-h">
      <h2 id="tasks-h">{ui.tasksHeading}</h2>
      <ol className="task-list">
        {tasks.map((t, i) => (
          <li key={t.kind} className={`task task-${t.kind}`}>
            <span className="task-kind">{ui[LABEL[t.kind]]}</span>
            <strong>{t.title}</strong>
            <p>{t.text}</p>
            <Support show={showSupport}>{supportTasks?.[i] && <><strong>{supportTasks[i].title}</strong> {supportTasks[i].text}</>}</Support>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

`src/components/TipLadder.jsx`:
```jsx
import { format } from '../lib/format.js';
import Support from './Support.jsx';

// Vier Stufen: Frage, Richtung, Geruest (Leit-Ebene, deutsch) und Loesung (Stuetz-Ebene,
// uebersetzt). Native <details>, jede Stufe einzeln auf- und zuklappbar; die Loesung
// traegt den Remix-Hinweis.
export default function TipLadder({ tips, solution, supportSolution, ui, showSupport }) {
  const steps = [...tips, solution];
  return (
    <section className="card tips" aria-labelledby="tips-h">
      <h2 id="tips-h">{ui.tipsHeading}</h2>
      {steps.map((t, i) => (
        <details key={i}>
          <summary>{i < tips.length ? format(ui.tipStep, { n: i + 1 }) : ui.tipSolution}</summary>
          <p>{t}</p>
          {i === tips.length && <p className="remix-note">{ui.tipRemixNote}</p>}
          {i === tips.length && <Support show={showSupport}>{supportSolution}</Support>}
        </details>
      ))}
    </section>
  );
}
```

`src/components/AgentGrid.jsx`:
```jsx
import { useState } from 'react';
import { simulate } from '../lib/agentSim.js';
import Support from './Support.jsx';

const ARROW = { N: '▲', E: '▶', S: '▼', W: '◀' };

export default function AgentGrid({ exercise, prompt, supportPrompt, ui, showSupport }) {
  const { grid, start, program } = exercise;
  const target = simulate(grid, start, program);
  const [picked, setPicked] = useState(null);
  const right = picked && picked.x === target.x && picked.y === target.y;
  return (
    <section className="exercise predict">
      <p className="prompt">{ui.predictPrompt}</p>
      <p>{prompt}</p>
      <Support show={showSupport}>{supportPrompt}</Support>
      <pre className="mini-program">{program.join('\n')}</pre>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${grid.w}, 40px)` }} role="group" aria-label="Raster">
        {Array.from({ length: grid.h }, (_, y) =>
          Array.from({ length: grid.w }, (_, x) => {
            const isStart = x === start.x && y === start.y;
            const isPick = picked && picked.x === x && picked.y === y;
            return (
              <button
                key={`${x}-${y}`}
                type="button"
                data-testid={`cell-${x}-${y}`}
                className={`cell${isStart ? ' start' : ''}${isPick ? (right ? ' right' : ' wrong') : ''}`}
                onClick={() => setPicked({ x, y })}
                aria-label={`Feld ${x + 1}, ${y + 1}`}
              >
                {isStart ? ARROW[start.dir] : ''}
              </button>
            );
          }),
        )}
      </div>
      {picked && <p className={right ? 'ok' : 'nope'} role="status">{right ? ui.predictRight : ui.predictWrong}</p>}
    </section>
  );
}
```

`src/components/ParsonsPuzzle.jsx`:
```jsx
import { useState } from 'react';
import { shuffleDeterministic, checkOrder } from '../lib/parsons.js';
import Support from './Support.jsx';

export default function ParsonsPuzzle({ exercise, prompt, supportPrompt, ui, showSupport, seed = 7 }) {
  const solution = exercise.lines;
  const [lines, setLines] = useState(() => shuffleDeterministic(solution, seed));
  const [result, setResult] = useState(null);
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= lines.length) return;
    const next = [...lines];
    [next[i], next[j]] = [next[j], next[i]];
    setLines(next);
    setResult(null);
  };
  return (
    <section className="exercise parsons">
      <p className="prompt">{ui.parsonsPrompt}</p>
      <p>{prompt}</p>
      <Support show={showSupport}>{supportPrompt}</Support>
      <ol className="parsons-list" data-testid="parsons">
        {lines.map((l, i) => (
          <li key={l} data-line={l}>
            <code>{l}</code>
            <span className="parsons-btns">
              <button type="button" data-dir="up" onClick={() => move(i, -1)} aria-label={ui.parsonsUp}>↑</button>
              <button type="button" data-dir="down" onClick={() => move(i, 1)} aria-label={ui.parsonsDown}>↓</button>
            </span>
          </li>
        ))}
      </ol>
      <button type="button" className="btn" onClick={() => setResult(checkOrder(lines, solution))}>{ui.parsonsCheck}</button>
      {result !== null && <p className={result ? 'ok' : 'nope'} role="status">{result ? ui.parsonsRight : ui.parsonsWrong}</p>}
    </section>
  );
}
```

`src/components/Spielstand.jsx`:
```jsx
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
```

- [ ] **Step 4: `StationView`, `Home`, `App`**

`src/components/StationView.jsx`:
```jsx
import { useEffect, useState } from 'react';
import { STATIONS, ETAPPEN } from '../data/stations.js';
import de from '../i18n/de.js';
import content from '../content/de.js';
import { getBundle, isSupport } from '../i18n/index.js';
import { format } from '../lib/format.js';
import StoryPanel from './StoryPanel.jsx';
import ConceptCard from './ConceptCard.jsx';
import TaskCard from './TaskCard.jsx';
import TipLadder from './TipLadder.jsx';
import AgentGrid from './AgentGrid.jsx';
import ParsonsPuzzle from './ParsonsPuzzle.jsx';
import Spielstand from './Spielstand.jsx';

const BLOCK_IMAGES = import.meta.glob('../assets/blocks/*.png', { eager: true, import: 'default' });
const VISITED = 'code-welt:besucht';

export function markVisited(id) {
  try {
    const set = new Set(JSON.parse(localStorage.getItem(VISITED) || '[]'));
    set.add(id);
    localStorage.setItem(VISITED, JSON.stringify([...set]));
  } catch { /* ignore */ }
}

export default function StationView({ id, lang }) {
  const s = STATIONS[id];
  const t = de.stations[id];          // Leit-Ebene Stuetz-Felder auf Deutsch (immer sichtbar)
  const c = content.stations[id];     // Leit-Ebene Erklaerung (nur Deutsch)
  const support = isSupport(lang) ? getBundle(lang) : null;
  const st = support?.stations[id];   // Stuetz-Ebene in der gewaehlten Sprache
  const ui = de.ui;
  const sui = support?.ui;
  const [showSupport, setShowSupport] = useState(true);
  useEffect(() => { markVisited(id); }, [id]);
  if (!s || !t || !c) return <p>Station {id} gibt es nicht.</p>;

  const etappe = ETAPPEN.find((e) => e.id === s.etappe);
  const blockImage = BLOCK_IMAGES[`../assets/blocks/${s.blockImage}`] || null;

  return (
    <article className="station">
      <header className="station-head">
        <p className="crumb">{etappe.emoji} {de.etappen[etappe.id].name} · {format(ui.ds, { n: s.ds })}</p>
        <h1>{t.title}{st && st.title !== t.title && <span className="title-support"> · {st.title}</span>}</h1>
        {support && (
          <button type="button" className="btn btn-support" onClick={() => setShowSupport((v) => !v)}>
            {showSupport ? sui.supportHide : sui.supportShow}
          </button>
        )}
      </header>

      <StoryPanel lines={c.story} short={st?.storyShort} ui={ui} showSupport={!!(support && showSupport)} />
      <ConceptCard paragraphs={c.concept} bridge={t.bridge} supportBridge={st?.bridge} python={s.python} blockImage={blockImage} ui={ui} showSupport={!!(support && showSupport)} />
      <TaskCard tasks={t.tasks} supportTasks={st?.tasks} ui={ui} showSupport={!!(support && showSupport)} />
      <TipLadder tips={c.tips} solution={t.tipSolution} supportSolution={st?.tipSolution} ui={ui} showSupport={!!(support && showSupport)} />

      <section className="card check" aria-labelledby="check-h">
        <h2 id="check-h">{ui.checkHeading}</h2>
        {s.exercises.map((ex, i) => {
          const props = { key: i, exercise: ex, prompt: t.exercises[i].prompt, supportPrompt: st?.exercises?.[i]?.prompt, ui, showSupport: !!(support && showSupport) };
          if (ex.type === 'predict') return <AgentGrid {...props} />;
          if (ex.type === 'parsons') return <ParsonsPuzzle {...props} />;
          return null;
        })}
      </section>

      <Spielstand id={id} ui={ui} />
    </article>
  );
}
```

`src/components/Home.jsx`:
```jsx
import { ETAPPEN, STATIONS } from '../data/stations.js';
import de from '../i18n/de.js';
import { navigate } from '../lib/router.js';
import { format } from '../lib/format.js';

function loadVisited() {
  try { return new Set(JSON.parse(localStorage.getItem('code-welt:besucht') || '[]')); } catch { return new Set(); }
}

export default function Home({ switcher }) {
  const ui = de.ui;
  const visited = loadVisited();
  const total = Object.keys(STATIONS).length;
  return (
    <div className="home">
      <div className="topbar">{switcher}</div>
      <header className="hero">
        <h1>{ui.appTitle}</h1>
        <p className="tagline">{ui.tagline}</p>
        <p>{format(ui.progress, { done: [...visited].filter((v) => STATIONS[v]).length, total })}</p>
      </header>
      {ETAPPEN.map((e) => (
        <section key={e.id} className="card etappe">
          <h2>{e.emoji} {de.etappen[e.id].name}</h2>
          {e.stations.length === 0 && <p className="muted">…</p>}
          <ul className="station-list">
            {e.stations.map((sid) => (
              <li key={sid}>
                <button type="button" className="btn btn-station" onClick={() => navigate(`/station/${sid}`)}>
                  {format(ui.ds, { n: STATIONS[sid].ds })} · {de.stations[sid].title} {visited.has(sid) ? '✓' : ''}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <footer className="foot">{ui.footer}</footer>
    </div>
  );
}
```

`src/App.jsx`:
```jsx
import { useEffect, useState } from 'react';
import { detectLang, saveLang, applyDir, getBundle } from './i18n/index.js';
import de from './i18n/de.js';
import { useRoute, navigate } from './lib/router.js';
import LangSwitcher from './components/LangSwitcher.jsx';
import Home from './components/Home.jsx';
import StationView from './components/StationView.jsx';

export default function App() {
  const route = useRoute();
  const [lang, setLang] = useState(detectLang);
  useEffect(() => { applyDir(lang); saveLang(lang); }, [lang]);
  const switcher = <LangSwitcher lang={lang} setLang={setLang} label={getBundle(lang).ui.langLabel} />;

  if (route.view === 'station') {
    return (
      <main className="page">
        <div className="topbar">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>← {de.ui.home}</button>
          {switcher}
        </div>
        <StationView id={route.id} lang={lang} />
      </main>
    );
  }
  return <main className="page"><Home switcher={switcher} /></main>;
}
```

- [ ] **Step 5: Charakter-Zwischenbilder und Stile**

`src/assets/characters/nour.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="24" r="22" fill="#3f8f4a"/><circle cx="24" cy="19" r="8" fill="#f4f1e8"/><path d="M10 40c2-9 26-9 28 0" fill="#f4f1e8"/><text x="24" y="46" font-size="6" text-anchor="middle" fill="#1b2a1f">Nour</text></svg>
```
`src/assets/characters/dani.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="24" r="22" fill="#e0a100"/><circle cx="24" cy="19" r="8" fill="#f4f1e8"/><path d="M10 40c2-9 26-9 28 0" fill="#f4f1e8"/><text x="24" y="46" font-size="6" text-anchor="middle" fill="#1b2a1f">Dani</text></svg>
```

Stile an `src/styles.css` anhängen:
```css
.topbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; }
.lang-switcher select { font: inherit; padding: 6px 8px; border-radius: 8px; border: 1px solid var(--line); }
.card { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 16px 18px; margin: 14px 0; }
.card h2 { margin: 0 0 10px; font-size: 1.15rem; }
.hero h1 { font-size: 2rem; margin: 0; }
.tagline { font-size: 1.2rem; }
.btn { font: inherit; padding: 10px 14px; border-radius: 10px; border: 1px solid var(--line); background: var(--accent); color: var(--accent-ink); cursor: pointer; }
.btn-ghost { background: transparent; color: var(--ink); }
.btn-support { background: var(--support); color: var(--ink); border-color: var(--support-line); }
.btn-station { width: 100%; text-align: start; margin: 4px 0; }
.station-list { list-style: none; padding: 0; margin: 0; }
.crumb { color: #555; margin: 0; }
.title-support { font-weight: normal; color: #555; }
.bubble { display: flex; gap: 12px; align-items: flex-start; margin: 8px 0; }
.bubble p { margin: 2px 0 0; }
.bubble-nour strong { color: var(--accent); }
.bubble-dani strong { color: #b07d00; }
.support { background: var(--support); border-inline-start: 4px solid var(--support-line); padding: 8px 12px; margin: 8px 0; border-radius: 8px; }
.bridge { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; }
.bridge > div { background: var(--bg); border-radius: 8px; padding: 10px; }
.side-by-side { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 700px) { .bridge, .side-by-side { grid-template-columns: 1fr; } }
figure { margin: 0; }
figcaption { font-weight: bold; margin-bottom: 6px; }
.blocks img { max-width: 100%; border: 1px solid var(--line); border-radius: 8px; }
.blocks-missing { border: 1px dashed var(--line); padding: 40px 10px; text-align: center; color: #777; }
.code pre { background: var(--code-bg); color: var(--code-ink); padding: 12px; border-radius: 8px; overflow-x: auto; direction: ltr; text-align: left; font-size: 0.95rem; }
.token.keyword { color: #ffb454; } .token.function { color: #7fd7ff; } .token.string { color: #b8e986; } .token.number { color: #ff9ab8; } .token.punctuation { color: #cfd8d3; }
.task-list { padding-inline-start: 0; list-style: none; }
.task { border: 1px solid var(--line); border-radius: 10px; padding: 10px 12px; margin: 8px 0; }
.task-kind { display: inline-block; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; background: var(--bg); padding: 2px 8px; border-radius: 6px; margin-bottom: 4px; }
.task-remix { border-color: var(--warn); }
details { border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px; margin: 6px 0; }
summary { cursor: pointer; font-weight: bold; }
.remix-note { color: #8a6d00; font-style: italic; }
.exercise { margin: 14px 0; padding-top: 10px; border-top: 1px dashed var(--line); }
.prompt { font-weight: bold; }
.mini-program { background: var(--bg); padding: 8px; border-radius: 8px; direction: ltr; text-align: left; display: inline-block; }
.grid { display: grid; gap: 3px; margin: 8px 0; direction: ltr; }
.cell { width: 40px; height: 40px; border: 1px solid var(--line); background: #fff; border-radius: 6px; cursor: pointer; font-size: 1.1rem; }
.cell.start { background: #fff3c4; }
.cell.right { background: #c8f0c8; }
.cell.wrong { background: #ffd6d6; }
.parsons-list { list-style: none; padding: 0; direction: ltr; text-align: left; }
.parsons-list li { display: flex; justify-content: space-between; align-items: center; gap: 8px; border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px; margin: 4px 0; background: #fff; }
.parsons-btns button { font: inherit; padding: 2px 8px; margin-inline-start: 4px; }
.ok { color: #1f7a2e; font-weight: bold; }
.nope { color: #9b2c2c; font-weight: bold; }
textarea { width: 100%; font: inherit; padding: 8px; border-radius: 8px; border: 1px solid var(--line); }
.muted { color: #888; }
.foot { color: #666; font-size: 0.9rem; margin: 20px 0; text-align: center; }
```

- [ ] **Step 6: Tests grün, Dev-Server ansehen**

Run: `npm test` → alle `passed`.
Run: `npm run dev` (Hintergrund) und `http://localhost:3030/code-welt/#/station/s02` sowie `…/?lang=ar#/station/s02` im Browser öffnen.
Expected: Station rendert; mit `ar` steht `dir="rtl"` am `<html>`, Code-Blöcke bleiben links-nach-rechts, Stütz-Blöcke sind sichtbar (noch mit deutschem Text, weil die Übersetzung erst in Task 8 kommt).

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -q -m "feat(ui): station view with story, concept, tasks, tip ladder, agent grid, parsons puzzle, spielstand

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01CrVe4qxK9KdjDspm6Gr84p"
```

---

### Task 7: Block-Bild für Station 2 (Render-Spike mit Screenshot-Rückfall)

**Files:**
- Create: `code-welt/scripts/resolveBrowser.mjs`, `scripts/render-blocks.mjs`, `src/assets/blocks/s02-weg.png`

**Interfaces:**
- Produces: `src/assets/blocks/s02-weg.png` (≥ 5 KB, Blöcke auf Englisch). Wenn der Render-Dienst funktioniert, außerdem ein Skript, das aus einer JavaScript-Fassung jedes Programms ein PNG erzeugt (spart in Plan 2 bis 4 rund 50 Screenshots).

- [ ] **Step 1: Browser-Auflösung (Kopie des Repo-Musters)**

`scripts/resolveBrowser.mjs`:
```js
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

// Auf Deus Machina gibt es kein Chrome, aber Edge (x86-Pfad). Reihenfolge wie im docker-Repo.
export function resolveBrowser() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  ].filter(Boolean);
  for (const p of candidates) if (existsSync(p)) return p;
  const pwRoot = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  if (existsSync(pwRoot)) {
    for (const dir of readdirSync(pwRoot)) {
      const exe = path.join(pwRoot, dir, 'chrome-win64', 'chrome.exe');
      if (existsSync(exe)) return exe;
    }
  }
  throw new Error('Kein Chromium-Binary gefunden (Chrome/Edge/Playwright).');
}
```

- [ ] **Step 2: Render-Spike (Zeitbox 45 Minuten)**

MakeCode bietet für Doku-Seiten einen Block-Renderer: ein iframe auf `https://minecraft.makecode.com/--docs?render=1` meldet sich mit `postMessage({type:'renderready'})`, nimmt `{type:'renderblocks', id, code}` (Code in MakeCode-JavaScript, nicht Python) und antwortet mit `{type:'renderblocks', id, svg, uri, width, height}` (`uri` ist ein PNG als Data-URL). Das Skript:

`scripts/render-blocks.mjs`:
```js
// Spike: Block-Bilder ueber den MakeCode-Renderer erzeugen.
// Aufruf: node scripts/render-blocks.mjs s02
// Liest die JavaScript-Fassung aus scripts/blocks-js/<id>.js, schreibt src/assets/blocks/<blockImage>.
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
```

`scripts/blocks-js/s02.js` (JavaScript-Fassung, im Browser-Editor per JavaScript-Umschalter aus denselben Blöcken kopieren):
```js
player.onChat("weg", function () {
    agent.teleportToPlayer()
    agent.setItem(GRASS, 64, 1)
    agent.move(FORWARD, 1)
    agent.place(BACK)
    agent.move(FORWARD, 1)
    agent.place(BACK)
    agent.turn(LEFT_TURN)
    agent.move(FORWARD, 1)
    agent.place(BACK)
})
```

Run: `node scripts/render-blocks.mjs s02`
Expected: `ok s02-weg.png <w>x<h> <n> bytes` und ein PNG mit englischen Blöcken. Wenn nach 45 Minuten kein `renderready` oder kein `renderblocks` kommt (Cross-Origin-Beschränkung, geändertes Protokoll): abbrechen, Schritt 3.

- [ ] **Step 3: Rückfall Screenshot (nur wenn Step 2 scheitert)**

Im Browser-Editor die Blöcke aus Task 4 Step 1 anzeigen, Editor-Sprache Englisch, Zoom so, dass alle Blöcke sichtbar sind, Windows-Snipping (`Win+Shift+S`) nur über den Block-Bereich, speichern als `src/assets/blocks/s02-weg.png`. `scripts/render-blocks.mjs` bleibt im Repo mit einem Kopfkommentar „Renderer am <Datum> nicht erreichbar: <Fehler>", damit Plan 2 den Befund kennt.

- [ ] **Step 4: Prüfen, dass die App das Bild zieht**

Run: `npm run build && grep -c "s02-weg" dist/assets/*.js | head -1` und `ls -la src/assets/blocks/s02-weg.png`
Expected: Treffer im Bundle, Datei ≥ 5000 Bytes. Dev-Server: Station 2 zeigt das Bild statt „Block-Bild folgt".

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -q -m "feat(assets): block image for DS 2 (makecode render script or screenshot fallback)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01CrVe4qxK9KdjDspm6Gr84p"
```

---

### Task 8: Übersetzungsskript und fünf Sprachen für Station 2

**Files:**
- Create: `code-welt/scripts/translate.mjs`
- Modify: `src/i18n/{en,uk,ar,es,it}.js` (generiert)
- Test: `tests/i18n-complete.test.js`

**Interfaces:**
- Consumes: `src/i18n/de.js` als Quelle.
- Produces: `node scripts/translate.mjs --lang uk` (oder `all`), Ausgabe `src/i18n/<lang>.js` mit Kopfzeile `sourceHash`, gleicher Form wie `de.js`. `--force` überschreibt. Ohne `--force` wird eine Datei übersprungen, deren `sourceHash` dem aktuellen Hash von `de.js` entspricht; bei abweichendem Hash wird sie neu erzeugt (Veraltung erkannt).
- Modell `claude-opus-5`, JSON-Schema-beschränkt, Streaming mit `finalMessage()`.

> **Ruling 03.09.2026 (Ausführung):** Ein Schema über die ganze `de.js` lehnt die API mit
> „compiled grammar is too large" ab. Das Skript übersetzt deshalb in **Teilbäumen** (`ui`,
> `glossary`, `etappen`, je `stations.<id>`) mit eigenem kleinen Schema und fällt pro Teilbaum
> auf schemaloses Prompting mit `extractJsonFromResponse`/`repairStrayQuotes` (aus
> `esa-mathe/scripts/translate-lessons.mjs`) zurück, wenn Grammatik-Fehler oder ungültiges
> JSON auftreten. Der Code unten zeigt den ursprünglichen Einzelaufruf; maßgeblich ist das
> Skript im Repo.

- [ ] **Step 1: Failing test (Vollständigkeit aller sechs Sprachen)**

`tests/i18n-complete.test.js`:
```js
import de from '../src/i18n/de.js';
import en from '../src/i18n/en.js';
import uk from '../src/i18n/uk.js';
import ar from '../src/i18n/ar.js';
import es from '../src/i18n/es.js';
import it from '../src/i18n/it.js';

function paths(obj, prefix = '') {
  if (Array.isArray(obj)) return obj.flatMap((v, i) => paths(v, `${prefix}[${i}]`));
  if (obj && typeof obj === 'object') return Object.entries(obj).flatMap(([k, v]) => paths(v, prefix ? `${prefix}.${k}` : k));
  return [prefix];
}

const all = { en, uk, ar, es, it };
const want = paths(de);

for (const [code, bundle] of Object.entries(all)) {
  test(`${code} hat exakt die Schluessel von de`, () => {
    expect(paths(bundle)).toEqual(want);
  });
  test(`${code}: Code-Woerter und Platzhalter bleiben erhalten`, () => {
    expect(bundle.stations.s02.quiz[0].answers[0].text).toMatch(/agent\.move\(FORWARD, 3\)/);
    expect(bundle.ui.station).toMatch(/\{n\}/);
    expect(bundle.ui.progress).toMatch(/\{done\}.*\{total\}/);
  });
  test(`${code}: quiz.correct bleibt boolean und genau einmal wahr`, () => {
    for (const q of bundle.stations.s02.quiz) expect(q.answers.filter((a) => a.correct === true)).toHaveLength(1);
  });
}
```

Run: `npm test`
Expected: FAIL für alle fünf Sprachen (leere Bundles).

- [ ] **Step 2: Übersetzungsskript**

`scripts/translate.mjs`:
```js
#!/usr/bin/env node
/**
 * Uebersetzt die Stuetz-Ebene src/i18n/de.js in die fuenf Stuetzsprachen.
 *
 *   node scripts/translate.mjs --lang uk
 *   node scripts/translate.mjs --lang all
 *   node scripts/translate.mjs --lang ar,it --force
 *
 * Jede erzeugte Datei traegt den sourceHash der deutschen Quelle. Stimmt er noch,
 * wird uebersprungen; weicht er ab, wird neu uebersetzt. --force erzwingt es.
 * ANTHROPIC_API_KEY aus der Umgebung, sonst aus ./.env oder ../docker/.env.
 * Muster: docker/esa-mathe/scripts/translate-lessons.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODEL = 'claude-opus-5';
const TARGETS = ['en', 'uk', 'ar', 'es', 'it'];
const NAMES = { en: 'English', uk: 'Ukrainian', ar: 'Arabic (Modern Standard, simple)', es: 'Spanish', it: 'Italian' };

function parseArgs(argv) {
  const a = { force: false, lang: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--force') a.force = true;
    else if (argv[i] === '--lang') a.lang = argv[++i];
  }
  return a;
}
function hash(s) { return crypto.createHash('sha256').update(s).digest('hex').slice(0, 12); }
function loadDotenv() {
  if (process.env.ANTHROPIC_API_KEY) return;
  for (const p of [path.join(ROOT, '.env'), path.resolve(ROOT, '..', 'docker', '.env')]) {
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"]*)"?\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
    if (process.env.ANTHROPIC_API_KEY) return;
  }
}
function readSourceHash(file) {
  if (!fs.existsSync(file)) return null;
  const m = fs.readFileSync(file, 'utf8').match(/sourceHash: ([0-9a-f]{12})/);
  return m ? m[1] : null;
}
function schemaFrom(data) {
  if (typeof data === 'string') return { type: 'string' };
  if (typeof data === 'number') return { type: 'number' };
  if (typeof data === 'boolean') return { type: 'boolean' };
  if (Array.isArray(data)) return { type: 'array', items: data.length ? schemaFrom(data[0]) : {} };
  const properties = {}; const required = [];
  for (const [k, v] of Object.entries(data)) { properties[k] = schemaFrom(v); required.push(k); }
  return { type: 'object', properties, required, additionalProperties: false };
}
function systemPrompt(lang) {
  return [
    `You translate a German learning app for a coding course (Minecraft Education, MakeCode, Python) into ${NAMES[lang]}.`,
    `Audience: vocational-school students aged 16-18 who are learning German (A2-B1) and speak ${NAMES[lang]} at home. The German stays visible next to your text; yours is the SUPPORT layer. Use short, plain sentences, informal "du"-register equivalent, no jargon beyond the coding terms.`,
    `HARD RULES:`,
    `1. Code words stay byte-identical: anything like agent.move(FORWARD, 3), agent.turn(LEFT_TURN), agent.place(BACK), player.on_chat, GRASS, FORWARD, LEFT_TURN, BACK, "weg" (the chat word), Python, MakeCode, Minecraft, Code Builder.`,
    `2. Placeholders in curly braces like {n}, {done}, {total} stay verbatim.`,
    `3. Character names stay: Nour, Dani. The word "Agent" for the Minecraft robot may be translated the way Minecraft Education names it in ${NAMES[lang]}, otherwise keep "Agent".`,
    `4. JSON keys are never translated; only string values. Booleans and numbers unchanged. Same shape, same array order, no added or removed keys.`,
    `5. Etappen names (Holz, Stein, Eisen, Gold, Diamant, Netherite, Enderdrache) are translated to the Minecraft in-game names in ${NAMES[lang]} (e.g. wood, stone, iron, gold, diamond, netherite, ender dragon).`,
    `6. Quotation marks inside values: use the target language's own quotation marks, never a straight ASCII double quote.`,
    `7. Respond with ONLY the JSON object.`,
  ].join('\n');
}

async function translate(client, data, lang) {
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    system: systemPrompt(lang),
    messages: [{ role: 'user', content: `Translate the string values of this JSON from German into ${NAMES[lang]}. Keep the exact shape.\n\n${JSON.stringify(data, null, 2)}` }],
    output_config: { format: { type: 'json_schema', schema: schemaFrom(data) } },
  });
  const final = await stream.finalMessage();
  if (final.stop_reason === 'refusal') throw new Error('model refused');
  if (final.stop_reason === 'max_tokens') throw new Error('max_tokens hit');
  const text = final.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  return { json: JSON.parse(text), usage: final.usage };
}

function serialize(data, meta) {
  return [
    '// AUTO-GENERATED by scripts/translate.mjs — NICHT von Hand bearbeiten.',
    `// Source: src/i18n/de.js   sourceHash: ${meta.sourceHash}`,
    `// Language: ${meta.lang}   model: ${meta.model}   generated: ${meta.generatedAt}`,
    '// Stuetz-Ebene: Deutsch bleibt daneben sichtbar. Bei Aenderung an de.js neu erzeugen.',
    '',
    'export default ' + JSON.stringify(data, null, 2) + ';',
    '',
  ].join('\n');
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.lang) { console.error('--lang <code|code,code|all> fehlt'); process.exit(1); }
  loadDotenv();
  if (!process.env.ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY fehlt'); process.exit(1); }
  const langs = args.lang === 'all' ? TARGETS : args.lang.split(',').map((s) => s.trim());
  for (const l of langs) if (!TARGETS.includes(l)) { console.error(`unbekannte Sprache ${l}`); process.exit(1); }

  const srcPath = path.join(ROOT, 'src', 'i18n', 'de.js');
  const raw = fs.readFileSync(srcPath, 'utf8');
  const sourceHash = hash(raw);
  const data = (await import(pathToFileURL(srcPath).href)).default;
  const client = new Anthropic();
  let tin = 0, tout = 0;

  for (const lang of langs) {
    const out = path.join(ROOT, 'src', 'i18n', `${lang}.js`);
    if (!args.force && readSourceHash(out) === sourceHash) { console.log(`skip ${lang} — aktuell (sourceHash ${sourceHash})`); continue; }
    process.stdout.write(`translate de → ${lang} … `);
    const t0 = Date.now();
    let last;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const { json, usage } = await translate(client, data, lang);
        fs.writeFileSync(out, serialize(json, { sourceHash, lang, model: MODEL, generatedAt: new Date().toISOString() }), 'utf8');
        tin += usage.input_tokens; tout += usage.output_tokens;
        console.log(`ok (${((Date.now() - t0) / 1000).toFixed(1)}s, in=${usage.input_tokens} out=${usage.output_tokens})`);
        last = null; break;
      } catch (err) { last = err; await new Promise((r) => setTimeout(r, 2000 * attempt)); }
    }
    if (last) console.log(`FAIL: ${last.message}`);
  }
  console.log(`\nTokens: in=${tin} out=${tout} — ca. $${((tin / 1e6) * 5 + (tout / 1e6) * 25).toFixed(3)} (${MODEL})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 3: Übersetzen**

Run: `node scripts/translate.mjs --lang all`
Expected: fünf Zeilen `ok (…)`, Kostenzeile unter einem Dollar. Dateien `src/i18n/{en,uk,ar,es,it}.js` beginnen mit `// AUTO-GENERATED`.

- [ ] **Step 4: Tests grün, Stichprobe**

Run: `npm test` → alle `passed`, insbesondere die 15 Tests aus `i18n-complete`.
Stichprobe: `grep -c "agent.move(FORWARD, 3)" src/i18n/ar.js` liefert mindestens 1; `node -e "import('./src/i18n/uk.js').then(m => console.log(m.default.ui.support, '|', m.default.stations.s02.title))"` zeigt kyrillischen Text. Eigennamen wie „Code-Welt" dürfen unübersetzt bleiben.

- [ ] **Step 5: Zweiter Lauf beweist Skip**

Run: `node scripts/translate.mjs --lang all | head -5`
Expected: fünf Zeilen `skip … — aktuell`.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -q -m "feat(i18n): translate script (claude-opus-5, json schema, sourceHash) and five support languages for DS 2

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01CrVe4qxK9KdjDspm6Gr84p"
```

---

### Task 9: App-Smoke in sechs Sprachen

**Files:**
- Create: `code-welt/scripts/smoke.mjs`

**Interfaces:**
- Produces: `npm run smoke` baut die App, startet Vite-Preview auf 4173, öffnet jede Station in jeder Sprache mit Edge und meldet PASS/FAIL. Exit-Code 1 bei Fehlern.

- [ ] **Step 1: Skript**

`scripts/smoke.mjs`:
```js
// App-Smoke: jede Station × jede Sprache rendert ohne Konsolenfehler,
// Arabisch setzt dir=rtl, ?lang gewinnt ueber localStorage, Stuetz-Umschalter da.
import { build, preview } from 'vite';
import { chromium } from 'playwright-core';
import { resolveBrowser } from './resolveBrowser.mjs';
import { STATIONS } from '../src/data/stations.js';
import { LANGS, RTL } from '../src/i18n/index.js';

const PORT = 4173;
const BASE = `http://localhost:${PORT}/code-welt/`;

await build({ logLevel: 'error' });
const server = await preview({ preview: { port: PORT, strictPort: true }, logLevel: 'error' });
const browser = await chromium.launch({ executablePath: resolveBrowser(), headless: true });
let failures = 0;

async function check(label, fn) {
  try { await fn(); console.log(`PASS ${label}`); }
  catch (e) { failures++; console.log(`FAIL ${label}: ${e.message}`); }
}

for (const sid of Object.keys(STATIONS)) {
  for (const { code } of LANGS) {
    await check(`${sid} ${code}`, async () => {
      const page = await browser.newPage();
      const errors = [];
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      page.on('pageerror', (e) => errors.push(e.message));
      // Erst die Origin laden, dann eine andere Sprache in localStorage legen: ?lang muss trotzdem gewinnen.
      await page.goto(BASE, { waitUntil: 'networkidle' });
      await page.evaluate(() => localStorage.setItem('code-welt:lang', 'es'));
      await page.goto(`${BASE}?lang=${code}#/station/${sid}`, { waitUntil: 'networkidle' });
      const dir = await page.evaluate(() => document.documentElement.getAttribute('dir'));
      if (dir !== (RTL.has(code) ? 'rtl' : 'ltr')) throw new Error(`dir=${dir}`);
      const lang = await page.evaluate(() => document.documentElement.getAttribute('lang'));
      if (lang !== code) throw new Error(`lang=${lang} (?lang muss gewinnen)`);
      if (!(await page.locator('h1').first().textContent())) throw new Error('kein h1');
      const supportBtn = await page.locator('.btn-support').count();
      if (code === 'de' ? supportBtn !== 0 : supportBtn !== 1) throw new Error(`Stuetz-Umschalter: ${supportBtn}`);
      if (errors.length) throw new Error(errors.join(' | '));
      await page.close();
    });
  }
}

await browser.close();
await server.close();
console.log(failures ? `\n${failures} FAIL` : '\nalle grün');
process.exit(failures ? 1 : 0);
```

- [ ] **Step 2: Laufen lassen und committen**

Run: `npm run smoke`
Expected: `PASS s02 de` … `PASS s02 it`, dann `alle grün`.

```bash
git add -A && git commit -q -m "test(smoke): app smoke across stations x languages with edge

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01CrVe4qxK9KdjDspm6Gr84p"
```

---

### Task 10: MCP-Client, Multilang-Bausteine, Encoding-Probe in der Box

**Files:**
- Create: `code-welt/moodle/lib/mcp.mjs`, `moodle/lib/mlang.mjs`, `moodle/lib/entities.mjs`, `moodle/probe.mjs`
- Test: `tests/moodle-lib.test.js`

**Interfaces:**
- Produces: `callTool(name, args) → text` (wirft bei JSON-RPC-Fehler oder `❌`-Antwort), `extractId(text, label) → number`, `mlang({de,en,…}) → string`, `pick(bundles, path) → {de,en,…}`, `toEntities(html) → string`. Umgebung über `MCP_URL` (Default `http://localhost:8000/mcp/rpc`) und `MCP_API_KEY` (Default `ki-kurs-lokal`).
- Die Probe beantwortet zwei Fragen, bevor das Bauskript entsteht: (1) kommen Umlaute, Kyrillisch und Arabisch über den MCP unverändert in der Datenbank an, (2) wirkt `{mlang}` auf Abschnittsnamen und Label-Inhalt je nach Profilsprache.

- [ ] **Step 1: Failing tests**

`tests/moodle-lib.test.js`:
```js
import { extractId } from '../moodle/lib/mcp.mjs';
import { mlang, pick } from '../moodle/lib/mlang.mjs';
import { toEntities } from '../moodle/lib/entities.mjs';

test('extractId liest die Antwortformate des MCP', () => {
  expect(extractId('✅ Label erstellt!\n\n- **Text:** x\n- **Modul-ID:** 123', 'Modul-ID')).toBe(123);
  expect(extractId('✅ Quiz erfolgreich erstellt!\n- **Modul-ID (cmid):** 45\n- **Quiz-ID:** 9', 'Modul-ID')).toBe(45);
  expect(extractId('- **Quiz-ID:** 9', 'Quiz-ID')).toBe(9);
  expect(extractId('### Kurs\n- **ID:** 7\n', 'ID')).toBe(7);
  expect(() => extractId('nichts', 'Modul-ID')).toThrow(/Modul-ID/);
});

test('mlang baut sechs Bloecke plus other=de und laesst leere Sprachen aus', () => {
  const s = mlang({ de: 'Holz', en: 'Wood', uk: 'Дерево', ar: 'خشب', es: 'Madera', it: 'Legno' });
  expect(s).toBe('{mlang de}Holz{mlang}{mlang en}Wood{mlang}{mlang uk}Дерево{mlang}{mlang ar}خشب{mlang}{mlang es}Madera{mlang}{mlang it}Legno{mlang}{mlang other}Holz{mlang}');
  expect(mlang({ de: 'A', en: '' })).toBe('{mlang de}A{mlang}{mlang other}A{mlang}');
  expect(() => mlang({ en: 'x' })).toThrow(/de/);
});

test('pick zieht denselben Pfad aus allen Bundles', () => {
  const bundles = { de: { a: { b: 'Hallo' } }, en: { a: { b: 'Hello' } } };
  expect(pick(bundles, 'a.b')).toEqual({ de: 'Hallo', en: 'Hello' });
  expect(pick({ de: { arr: [{ t: 'x' }] } }, 'arr[0].t')).toEqual({ de: 'x' });
});

test('toEntities ersetzt nur deutsche Sonderzeichen', () => {
  expect(toEntities('Büro & Straße ÄÖÜ — Дерево خشب')).toBe('B&uuml;ro & Stra&szlig;e &Auml;&Ouml;&Uuml; — Дерево خشب');
});
```

Run: `npm test` → FAIL.

- [ ] **Step 2: Implementieren**

`moodle/lib/mcp.mjs`:
```js
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

export function extractId(text, label) {
  const re = new RegExp(`\\*\\*${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?: \\(cmid\\))?:\\*\\*\\s*(\\d+)`);
  const m = text.match(re);
  if (!m) throw new Error(`${label} nicht in Antwort: ${text.slice(0, 160)}`);
  return Number(m[1]);
}

export async function sleepBetween(ms = 1500) { await sleep(ms); }
```

`moodle/lib/mlang.mjs`:
```js
// {mlang}-Bloecke fuer filter_multilang2. Reihenfolge fest, other = Deutsch.
export const LANGS = ['de', 'en', 'uk', 'ar', 'es', 'it'];

export function mlang(byLang) {
  const de = byLang.de;
  if (de === undefined || de === null || de === '') throw new Error('mlang: de fehlt');
  let out = '';
  for (const l of LANGS) {
    const v = byLang[l];
    if (v === undefined || v === null || v === '') continue;
    out += `{mlang ${l}}${v}{mlang}`;
  }
  return out + `{mlang other}${de}{mlang}`;
}

// pick({de: bundle, en: bundle,…}, 'stations.s02.title') -> {de:'…', en:'…', …}
export function pick(bundles, path) {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  const out = {};
  for (const [lang, bundle] of Object.entries(bundles)) {
    let cur = bundle;
    for (const p of parts) { cur = cur?.[p]; if (cur === undefined) break; }
    if (cur !== undefined) out[lang] = cur;
  }
  return out;
}
```

`moodle/lib/entities.mjs`:
```js
// Umlaute als Entities — nur fuer HTML-Felder (Label, Fragetext, Summary), nie fuer Namen.
const MAP = { 'ä': '&auml;', 'ö': '&ouml;', 'ü': '&uuml;', 'Ä': '&Auml;', 'Ö': '&Ouml;', 'Ü': '&Uuml;', 'ß': '&szlig;' };
export function toEntities(html) {
  return String(html).replace(/[äöüÄÖÜß]/g, (c) => MAP[c]);
}
```

Run: `npm test` → alle `passed`.

- [ ] **Step 3: Probe-Skript**

`moodle/probe.mjs`:
```js
// Wegwerf-Probe in der Box: legt einen Kurs "probe-mlang" an, schreibt Umlaute, Kyrillisch,
// Arabisch und {mlang}-Bloecke, liest die Rohwerte aus der DB und rendert sie in drei Sprachen.
// Loescht den Kurs am Ende wieder. Aufruf: node moodle/probe.mjs
import { execSync } from 'node:child_process';
import { callTool, extractId, sleepBetween } from './lib/mcp.mjs';
import { mlang } from './lib/mlang.mjs';

const name = mlang({ de: 'Über Holz', en: 'About wood', uk: 'Про дерево', ar: 'عن الخشب', es: 'Sobre madera', it: 'Sul legno' });
const label = mlang({ de: '<p>Grüße aus Deutschland</p>', uk: '<p>Вітання з Німеччини</p>', ar: '<p>تحيات من ألمانيا</p>' });

const created = await callTool('moodle_create_course', { fullname: 'Probe Multilang', shortname: `probe-mlang-${Date.now()}`, categoryid: 1, numsections: 1, visible: 0 });
const courseId = extractId(created, 'ID');
await sleepBetween();
await callTool('moodle_update_section', { courseId, sectionNum: 1, name });
await sleepBetween();
const lab = await callTool('moodle_create_label', { courseId, sectionNum: 1, labelText: label });
const cmid = extractId(lab, 'Modul-ID');

const php = `
define("CLI_SCRIPT", true); require("/var/www/html/config.php");
$sec = $DB->get_record("course_sections", ["course" => ${courseId}, "section" => 1]);
$cm = $DB->get_record("course_modules", ["id" => ${cmid}]);
$lab = $DB->get_record("label", ["id" => $cm->instance]);
echo "RAW_NAME=" . $sec->name . "\\n";
echo "RAW_LABEL=" . $lab->intro . "\\n";
$ctx = context_course::instance(${courseId});
foreach (["de", "uk", "ar", "es"] as $l) {
  force_current_language($l);
  echo "NAME_$l=" . format_string($sec->name, true, ["context" => $ctx]) . "\\n";
  echo "LABEL_$l=" . strip_tags(format_text($lab->intro, FORMAT_HTML, ["context" => $ctx])) . "\\n";
}
`;
const out = execSync(`docker exec -i ki-kurs-moodle php`, { input: `<?php ${php}`, encoding: 'utf8' });
console.log(out);

const raw = Object.fromEntries(out.split('\n').filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));
const checks = [
  ['Rohwert Name unveraendert', raw.RAW_NAME === name],
  ['Rohwert Label unveraendert', raw.RAW_LABEL.includes('Вітання з Німеччини') && raw.RAW_LABEL.includes('تحيات من ألمانيا') && raw.RAW_LABEL.includes('Grüße')],
  ['Name de', raw.NAME_de === 'Über Holz'],
  ['Name uk', raw.NAME_uk === 'Про дерево'],
  ['Name ar', raw.NAME_ar === 'عن الخشب'],
  ['Name es (kein eigener Block → other)', raw.NAME_es === 'Sobre madera'],
  ['Label uk', raw.LABEL_uk.trim() === 'Вітання з Німеччини'],
  ['Label es faellt auf other=de', raw.LABEL_es.trim() === 'Grüße aus Deutschland'],
];
let fail = 0;
for (const [l, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${l}`); if (!ok) fail++; }

await callTool('moodle_delete_course', { courseId });
console.log(fail ? `\n${fail} FAIL — Bauskript NICHT starten, erst Ursache klaeren` : '\nProbe grün');
process.exit(fail ? 1 : 0);
```

- [ ] **Step 4: Probe laufen lassen**

Run: `node moodle/probe.mjs`
Expected: acht `PASS`, `Probe grün`. Wenn „Rohwert … unveraendert" scheitert, zeigt `RAW_*` die Verstümmelung (z. B. `?` statt kyrillischer Zeichen): dann ist die Encoding-Kette MCP → Webservice das Problem, und der Plan hält hier an, bis die Ursache im `moodle-mcp` (Header `charset`) behoben ist. Wenn nur `NAME_*` scheitert, während `LABEL_*` stimmt, greift `stringfilters` nicht: Task 1 Step 4 wiederholen und `purge_caches` prüfen.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -q -m "feat(moodle): mcp rpc client, mlang builder, entity helper, encoding/multilang probe

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01CrVe4qxK9KdjDspm6Gr84p"
```

---

### Task 11: Kursdefinition und Bauskript mit Register

**Files:**
- Create: `code-welt/moodle/course-def.mjs`, `moodle/build-course.mjs`, `moodle/registry.json` (Startwert `{}`)
- Test: `tests/course-def.test.js`

**Interfaces:**
- Consumes: `STATIONS`, `ETAPPEN`, alle sechs Bundles, `mlang`, `pick`, `toEntities`, `callTool`, `extractId`.
- Produces: `buildCourseDef({ bundles, appBase }) → { fullname, shortname, summary, sections: [{ num, name, visible, items: [ {key, type:'label', html} | {key, type:'quiz', name, intro, questions:[{name, text, answers:[{text, fraction}]}]} ] }] }`.
- `node moodle/build-course.mjs` (Env `APP_BASE`, Default `http://localhost:3030/code-welt/`; `REG_ENV`, Default `box`) legt an oder aktualisiert und schreibt `moodle/registry.json[REG_ENV] = { courseId, items: { key: { cmid, quizId?, questions? } } }`. Zweiter Lauf erzeugt nichts doppelt.

- [ ] **Step 1: Failing test**

`tests/course-def.test.js`:
```js
import { buildCourseDef } from '../moodle/course-def.mjs';
import de from '../src/i18n/de.js';
import uk from '../src/i18n/uk.js';

const def = buildCourseDef({ bundles: { de, uk }, appBase: 'http://app/code-welt/' });

test('Kursmetadaten mehrsprachig, Kurzname fest', () => {
  expect(def.shortname).toBe('code-welt');
  expect(def.fullname).toMatch(/^\{mlang de\}Code-Welt/);
  expect(def.fullname).toMatch(/\{mlang other\}/);
});

test('neun Abschnitte, Lehrkraft versteckt, Etappennamen aus den Bundles', () => {
  expect(def.sections.map((s) => s.num)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  expect(def.sections[1].visible).toBe(0);
  expect(def.sections[2].name).toContain('{mlang de}Holz{mlang}');
  expect(def.sections[2].name).toContain(`{mlang uk}${uk.etappen.holz.name}{mlang}`);
});

test('Station 2 liefert Label mit sechs iframe-Varianten und Quiz mit vier Fragen', () => {
  const holz = def.sections[2];
  const label = holz.items.find((i) => i.key === 's02-station');
  expect(label.type).toBe('label');
  expect(label.html).toContain('{mlang uk}<');
  expect(label.html).toContain('http://app/code-welt/?lang=uk#/station/s02');
  expect(label.html).toContain('{mlang other}<');
  const quiz = holz.items.find((i) => i.key === 's02-quiz');
  expect(quiz.type).toBe('quiz');
  expect(quiz.questions).toHaveLength(4);
  expect(quiz.questions[0].answers.filter((a) => a.fraction === 100)).toHaveLength(1);
  expect(quiz.questions[0].text).toMatch(/\{mlang uk\}/);
  expect(quiz.questions[0].text).not.toMatch(/[äöüÄÖÜß]/);
});

test('Willkommen: Sprachwahl-Label ohne mlang, alle Sprachen untereinander', () => {
  const welcome = def.sections[0].items.find((i) => i.key === 'welcome-lang');
  expect(welcome.html).not.toContain('{mlang');
  expect(welcome.html).toContain('Українська');
  expect(welcome.html).toContain('العربية');
});
```

Run: `npm test` → FAIL.

- [ ] **Step 2: `moodle/course-def.mjs`**

```js
// Baut aus den Bundles und den Strukturdaten die Kursdefinition. Reine Funktion, testbar.
import { ETAPPEN, STATIONS } from '../src/data/stations.js';
import { LANGS as LANG_META } from '../src/i18n/index.js';
import { mlang, pick, LANGS } from './lib/mlang.mjs';
import { toEntities } from './lib/entities.mjs';

const COURSE_TITLE = { de: 'Code-Welt: Programmieren mit Minecraft', en: 'Code World: Coding with Minecraft', uk: 'Світ коду: програмування з Minecraft', ar: 'عالم الكود: البرمجة مع Minecraft', es: 'Mundo del código: programar con Minecraft', it: 'Mondo del codice: programmare con Minecraft' };
const COURSE_SUMMARY = { de: '<p>Der Agent versteht nur Code. Lerne Programmieren mit Minecraft Education: erst Blöcke, dann Python.</p><p><em>Kein offizielles Minecraft-Produkt. Nicht von Mojang oder Microsoft genehmigt oder mit ihnen verbunden.</em></p>', en: '<p>The Agent only understands code. Learn coding with Minecraft Education: blocks first, then Python.</p><p><em>Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.</em></p>' };
const SECTION_NAMES = {
  welcome: { de: 'Willkommen', en: 'Welcome', uk: 'Ласкаво просимо', ar: 'أهلاً وسهلاً', es: 'Bienvenida', it: 'Benvenuti' },
  teacher: { de: 'Lehrkraft', en: 'Teacher', uk: 'Для вчителя', ar: 'للمعلّم', es: 'Docente', it: 'Docente' },
};
const CHOOSE = { de: 'Wähle deine Sprache: oben rechts auf deinen Namen klicken → Sprache.', en: 'Choose your language: click your name at the top right → Language.', uk: 'Обери свою мову: натисни на своє ім’я вгорі праворуч → Мова.', ar: 'اختر لغتك: اضغط على اسمك في الأعلى → اللغة.', es: 'Elige tu idioma: haz clic en tu nombre arriba a la derecha → Idioma.', it: 'Scegli la tua lingua: clicca sul tuo nome in alto a destra → Lingua.' };
const STATION_LABEL = { de: 'Station', en: 'Station', uk: 'Станція', ar: 'محطة', es: 'Estación', it: 'Stazione' };
const CHECK_LABEL = { de: 'Check', en: 'Check', uk: 'Перевірка', ar: 'اختبار', es: 'Comprobación', it: 'Verifica' };

function iframeLabel(appBase, sid) {
  const by = {};
  for (const l of LANGS) by[l] = `<div class="cw-station"><iframe src="${appBase}?lang=${l}#/station/${sid}" width="100%" height="1400" style="border:0;border-radius:12px" title="Code-Welt ${sid}" loading="lazy"></iframe></div>`;
  return mlang(by);
}

function welcomeLangLabel() {
  const rows = LANG_META.map((l) => `<p><strong>${l.flag} ${l.label}:</strong> ${CHOOSE[l.code]}</p>`).join('');
  return toEntities(`<div class="cw-welcome">${rows}</div>`);
}

export function buildCourseDef({ bundles, appBase }) {
  const nameOf = (path) => mlang(pick(bundles, path));
  const sections = [
    { num: 0, name: mlang(SECTION_NAMES.welcome), visible: 1, items: [{ key: 'welcome-lang', type: 'label', html: welcomeLangLabel() }] },
    { num: 1, name: mlang(SECTION_NAMES.teacher), visible: 0, items: [{ key: 'teacher-setup', type: 'label', html: toEntities('<p>Setup-Anleitung, Stundenverläufe und Weltdateien folgen in Plan 2.</p>') }] },
  ];
  ETAPPEN.forEach((e, i) => {
    const items = [];
    for (const sid of e.stations) {
      const s = STATIONS[sid];
      const title = pick(bundles, `stations.${sid}.title`);
      const stationName = {}; const checkName = {};
      for (const l of Object.keys(title)) {
        stationName[l] = `DS ${s.ds} · ${STATION_LABEL[l] || STATION_LABEL.de}: ${title[l]}`;
        checkName[l] = `DS ${s.ds} · ${CHECK_LABEL[l] || CHECK_LABEL.de}`;
      }
      // Label ist ein HTML-Feld: Umlaute im Titel als Entities (die iframe-URL hat keine)
      items.push({ key: `${sid}-station`, type: 'label', html: toEntities(`<h4>${mlang(stationName)}</h4>`) + iframeLabel(appBase, sid) });
      const quiz = bundles.de.stations[sid].quiz.map((q, qi) => ({
        name: `${sid} Frage ${qi + 1}`,
        text: toEntities(mlang(pick(bundles, `stations.${sid}.quiz[${qi}].q`))),
        answers: q.answers.map((a, ai) => ({ text: toEntities(mlang(pick(bundles, `stations.${sid}.quiz[${qi}].answers[${ai}].text`))), fraction: a.correct ? 100 : 0 })),
      }));
      items.push({ key: `${sid}-quiz`, type: 'quiz', name: mlang(checkName), intro: '', questions: quiz });
    }
    sections.push({ num: i + 2, name: nameOf(`etappen.${e.id}.name`), visible: 1, items });
  });
  return { fullname: mlang(COURSE_TITLE), shortname: 'code-welt', summary: toEntities(mlang(COURSE_SUMMARY)), sections };
}
```

Run: `npm test` → `course-def` grün.

- [ ] **Step 3: `moodle/build-course.mjs`**

```js
#!/usr/bin/env node
// Legt den Kurs "Code-Welt" in der Box an oder aktualisiert ihn. Idempotent ueber registry.json.
//   node moodle/build-course.mjs            (APP_BASE=http://localhost:3030/code-welt/, REG_ENV=box)
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { callTool, extractId, sleepBetween } from './lib/mcp.mjs';
import { buildCourseDef } from './course-def.mjs';
import de from '../src/i18n/de.js';
import en from '../src/i18n/en.js';
import uk from '../src/i18n/uk.js';
import ar from '../src/i18n/ar.js';
import es from '../src/i18n/es.js';
import it from '../src/i18n/it.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REG_PATH = path.join(HERE, 'registry.json');
const ENV = process.env.REG_ENV || 'box';
const APP_BASE = process.env.APP_BASE || 'http://localhost:3030/code-welt/';

const registry = JSON.parse(fs.readFileSync(REG_PATH, 'utf8'));
const reg = (registry[ENV] ||= { courseId: null, items: {} });
const save = () => fs.writeFileSync(REG_PATH, JSON.stringify(registry, null, 2) + '\n');

const def = buildCourseDef({ bundles: { de, en, uk, ar, es, it }, appBase: APP_BASE });

// 1. Kurs
if (!reg.courseId) {
  const list = await callTool('moodle_list_courses', {});
  if (list.includes(`**Kurzname:** ${def.shortname}\n`)) throw new Error(`Kurs ${def.shortname} existiert schon, aber nicht im Register — courseId von Hand in registry.json eintragen`);
  const r = await callTool('moodle_create_course', { fullname: def.fullname, shortname: def.shortname, categoryid: 1, summary: def.summary, format: 'topics', numsections: 8, visible: 1 });
  reg.courseId = extractId(r, 'ID'); save();
  console.log(`Kurs angelegt: ${reg.courseId}`);
} else {
  await callTool('moodle_update_course', { courseId: reg.courseId, fullname: def.fullname, summary: def.summary });
  console.log(`Kurs aktualisiert: ${reg.courseId}`);
}
const courseId = reg.courseId;
await sleepBetween();

// 2. Abschnitte (Namen + Sichtbarkeit; Abschnitt 0..8 existieren durch numsections=8)
for (const s of def.sections) {
  await callTool('moodle_update_section', { courseId, sectionNum: s.num, name: s.name, visible: s.visible });
  console.log(`Abschnitt ${s.num}: ok`);
  await sleepBetween(800);
}

// 3. Aktivitaeten
for (const s of def.sections) {
  for (const item of s.items) {
    const have = reg.items[item.key];
    if (item.type === 'label') {
      if (have) {
        const r = await callTool('moodle_update_label', { courseId, cmid: have.cmid, labelText: item.html });
        have.cmid = extractId(r, 'Neuer CMID'); save();     // Update = Delete+Recreate, CMID wandert
        console.log(`Label ${item.key}: aktualisiert (cmid ${have.cmid})`);
      } else {
        const r = await callTool('moodle_create_label', { courseId, sectionNum: s.num, labelText: item.html });
        reg.items[item.key] = { cmid: extractId(r, 'Modul-ID') }; save();
        console.log(`Label ${item.key}: angelegt (cmid ${reg.items[item.key].cmid})`);
      }
    }
    if (item.type === 'quiz') {
      if (have) {
        await callTool('moodle_update_quiz', { quizId: have.quizId, name: item.name });
        console.log(`Quiz ${item.key}: Name aktualisiert (${have.questions} Fragen bleiben)`);
      } else {
        const r = await callTool('moodle_create_quiz', { courseId, sectionNum: s.num, quizName: item.name, intro: item.intro, attempts: 0, grademethod: 1, shufflequestions: 0 });
        const entry = { cmid: extractId(r, 'Modul-ID'), quizId: extractId(r, 'Quiz-ID'), questions: 0 };
        reg.items[item.key] = entry; save();
        for (const q of item.questions) {
          await callTool('moodle_add_quiz_question_multichoice', { quizId: entry.quizId, questionText: q.text, answers: q.answers, name: q.name, single: 1, shuffleAnswers: 1 });
          entry.questions++; save();
          await sleepBetween(800);
        }
        console.log(`Quiz ${item.key}: angelegt (quizId ${entry.quizId}, ${entry.questions} Fragen)`);
      }
    }
    await sleepBetween(800);
  }
}

// 4. Kursabschluss: alle Quizze
const quizCmids = Object.entries(reg.items).filter(([k]) => k.endsWith('-quiz')).map(([, v]) => v.cmid);
await callTool('moodle_set_course_completion_criteria', { courseId, cmids: quizCmids.join(','), aggregation: 1 });
console.log(`Kursabschluss-Kriterien: ${quizCmids.length} Quizze`);
console.log(`\nFertig. Kurs: http://localhost:8080/course/view.php?id=${courseId}`);
```

`moodle/registry.json`: `{}`

- [ ] **Step 4: Ersten Lauf ausführen**

Voraussetzung: Probe aus Task 10 grün, `npm run dev` läuft auf 3030 (für den iframe im Browser).
Run: `node moodle/build-course.mjs`
Expected: `Kurs angelegt: <id>`, neun `Abschnitt n: ok`, `Label welcome-lang: angelegt`, `Label teacher-setup: angelegt`, `Label s02-station: angelegt`, `Quiz s02-quiz: angelegt (quizId …, 4 Fragen)`, `Kursabschluss-Kriterien: 1 Quizze`. `moodle/registry.json` enthält `box.courseId` und vier Einträge.

- [ ] **Step 5: Zweiter Lauf beweist Idempotenz**

Run: `node moodle/build-course.mjs && curl -s -X POST http://localhost:8000/mcp/rpc -H 'Content-Type: application/json' -H 'x-api-key: ki-kurs-lokal' -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"moodle_get_course_contents\",\"arguments\":{\"courseId\":$(node -p "require('./moodle/registry.json').box.courseId")}}}" | grep -o 'CMID: [0-9]*' | wc -l`
Expected: Ausgabe „aktualisiert" statt „angelegt"; die CMID-Zählung ergibt **4** (drei Labels, ein Quiz) — oder **5**, wenn Moodle beim ersten Aufruf der Kursseite das Ankündigungsforum angelegt hat (Memory `moodle-newsitems-zwangsabo-forum`; das Forum wird in Plan 2 zu „Fragen an Nour"). Alles über diese Zahl hinaus ist ein Duplikat.

- [ ] **Step 6: quiz_sections vorhanden (Pflicht laut CLAUDE.md)**

Run: `docker exec ki-kurs-moodle php -r 'define("CLI_SCRIPT",true); require("/var/www/html/config.php"); print_r($DB->count_records("quiz_sections", ["quizid" => '"$(node -p "require('./moodle/registry.json').box.items['s02-quiz'].quizId")"']));'`
Expected: `1`. Bei `0`: Abschnitt „KRITISCH: Quiz-Erstellung via API" in `docker/CLAUDE.md` anwenden, danach diesen Schritt wiederholen.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -q -m "feat(moodle): course definition and idempotent build script with cmid registry

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01CrVe4qxK9KdjDspm6Gr84p"
```

---

### Task 12: Quiz-Abschluss „Bestehensnote erreicht"

**Files:**
- Create: `code-welt/moodle/php/set-quiz-completion.php`, `moodle/apply-completion.sh`

**Interfaces:**
- Produces: für jedes Quiz des Kurses `course_modules.completion=2, completiongradeitemnumber=0, completionpassgrade=1` und `grade_items.gradepass = 60 %` der Maximalpunkte. Der MCP hat dafür kein Werkzeug (`moodle_set_completion` kennt nur Ansicht), deshalb PHP im Container.

> **Ruling 03.09.2026 (Ausführung):** Der Code unten schrieb `completionusegrade`, das ist nur
> ein Formularfeld. Die DB-Spalte heißt `completiongradeitemnumber` (0 = eigene Bewertung), und
> Moodles DML verwirft unbekannte Felder **stillschweigend** — der Fehler war nur an `2,,1`
> statt `2,0,1` zu sehen. Maßgeblich ist das Skript im Repo; die Prüfabfrage in Step 2 liest
> `completiongradeitemnumber` und erwartet `2,0,1`.

- [ ] **Step 1: PHP**

`moodle/php/set-quiz-completion.php`:
```php
<?php
// Setzt fuer alle Quizze eines Kurses den Aktivitaetsabschluss auf "Bestehensnote erreicht".
// Aufruf im Container:  php /tmp/set-quiz-completion.php <courseid> [passpercent=60]
define('CLI_SCRIPT', true);
require('/var/www/html/config.php');
require_once($CFG->libdir . '/gradelib.php');
require_once($CFG->libdir . '/completionlib.php');

$courseid = (int)($argv[1] ?? 0);
$pass = (float)($argv[2] ?? 60);
if (!$courseid) { fwrite(STDERR, "usage: set-quiz-completion.php <courseid> [passpercent]\n"); exit(1); }

$course = $DB->get_record('course', ['id' => $courseid], '*', MUST_EXIST);
if (!$course->enablecompletion) {
    $DB->set_field('course', 'enablecompletion', 1, ['id' => $courseid]);
    echo "enablecompletion=1 gesetzt\n";
}

foreach ($DB->get_records('quiz', ['course' => $courseid]) as $quiz) {
    $cm = get_coursemodule_from_instance('quiz', $quiz->id, $courseid, false, MUST_EXIST);
    $DB->update_record('course_modules', (object)[
        'id' => $cm->id, 'completion' => COMPLETION_TRACKING_AUTOMATIC,
        'completionview' => 0, 'completionusegrade' => 1, 'completionpassgrade' => 1,
    ]);
    $gi = grade_item::fetch(['itemtype' => 'mod', 'itemmodule' => 'quiz', 'iteminstance' => $quiz->id, 'courseid' => $courseid]);
    if ($gi) { $gi->gradepass = round($gi->grademax * $pass / 100, 2); $gi->update(); }
    echo "quiz {$quiz->id} cm {$cm->id}: completion=passgrade gradepass=" . ($gi ? $gi->gradepass : 'kein grade_item') . "\n";
}
rebuild_course_cache($courseid, true);
echo "ok\n";
```

`moodle/apply-completion.sh`:
```bash
#!/usr/bin/env bash
# Kopiert set-quiz-completion.php in die Box und fuehrt es fuer den Kurs aus registry.json aus.
set -euo pipefail
cd "$(dirname "$0")"
ENV="${REG_ENV:-box}"
COURSE=$(node -p "require('./registry.json')['$ENV'].courseId")
docker cp php/set-quiz-completion.php ki-kurs-moodle:/tmp/set-quiz-completion.php
docker exec ki-kurs-moodle php /tmp/set-quiz-completion.php "$COURSE" 60
docker exec ki-kurs-moodle php /var/www/html/admin/cli/purge_caches.php
```

- [ ] **Step 2: Ausführen und prüfen**

Run: `bash moodle/apply-completion.sh`
Expected: `quiz <id> cm <cmid>: completion=passgrade gradepass=<60 % von grademax>` und `ok`. Bei der Quiz-Standardnote 10 heißt das `gradepass=6`; der Wert davor in der Zeile ist die tatsächliche `grademax`, gegen die gerechnet wurde.

Run: `docker exec ki-kurs-moodle php -r 'define("CLI_SCRIPT",true); require("/var/www/html/config.php"); $cm=$DB->get_record("course_modules",["id"=>'"$(node -p "require('./moodle/registry.json').box.items['s02-quiz'].cmid")"']); echo $cm->completion.",".$cm->completionusegrade.",".$cm->completionpassgrade."\n";'`
Expected: `2,1,1`.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -q -m "feat(moodle): quiz completion on pass grade via in-container php

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01CrVe4qxK9KdjDspm6Gr84p"
```

---

### Task 13: End-to-End-Smoke in der Box

**Files:**
- Create: `code-welt/moodle/smoke-box.mjs`

**Interfaces:**
- Produces: `npm run moodle:smoke` meldet als Admin angemeldet, ob die Kursseite in `uk` die ukrainischen Namen zeigt und die deutschen nicht, ob das Stations-Label das `?lang=uk`-iframe trägt, ob die Quizfrage im Versuch ukrainisch ist und ob `ar` RTL setzt. Env: `MOODLE_URL` (Default `http://localhost:8080`), `MOODLE_USER`/`MOODLE_PASS` (Default `admin`/`KiKurs-Demo-2026`).

- [ ] **Step 1: Skript**

`moodle/smoke-box.mjs`:
```js
// End-to-End in der Box. Voraussetzungen: Box laeuft, Kurs gebaut (registry.json), App-Dev-Server auf 3030.
import fs from 'node:fs';
import { chromium } from 'playwright-core';
import { resolveBrowser } from '../scripts/resolveBrowser.mjs';
import uk from '../src/i18n/uk.js';

const M = process.env.MOODLE_URL || 'http://localhost:8080';
const USER = process.env.MOODLE_USER || 'admin';
const PASS = process.env.MOODLE_PASS || 'KiKurs-Demo-2026';
const reg = JSON.parse(fs.readFileSync(new URL('./registry.json', import.meta.url), 'utf8'))[process.env.REG_ENV || 'box'];

const browser = await chromium.launch({ executablePath: resolveBrowser(), headless: true });
const page = await browser.newPage();
let failures = 0;
const check = (label, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${ok ? '' : ' ' + extra}`); if (!ok) failures++; };

await page.goto(`${M}/login/index.php`);
await page.fill('#username', USER);
await page.fill('#password', PASS);
await page.click('#loginbtn');
await page.waitForLoadState('networkidle');
check('Login', !(await page.url()).includes('/login/'));

// Kursseite auf Ukrainisch
await page.goto(`${M}/course/view.php?id=${reg.courseId}&lang=uk`, { waitUntil: 'networkidle' });
const body = await page.locator('body').innerText();
check('Abschnitt Holz auf uk', body.includes(uk.etappen.holz.name), `erwartet "${uk.etappen.holz.name}"`);
check('kein rohes {mlang}', !body.includes('{mlang'));
const iframeSrc = await page.locator('.cw-station iframe').first().getAttribute('src');
check('iframe traegt ?lang=uk', !!iframeSrc && iframeSrc.includes('?lang=uk#/station/s02'), iframeSrc || '');

// Quiz: Versuch starten, Frage lesen
const quiz = reg.items['s02-quiz'];
await page.goto(`${M}/mod/quiz/view.php?id=${quiz.cmid}&lang=uk`, { waitUntil: 'networkidle' });
const startBtn = page.locator('form[action*="startattempt"] button, form[action*="startattempt"] input[type=submit]').first();
if (await startBtn.count()) { await startBtn.click(); await page.waitForLoadState('networkidle'); }
const qtext = await page.locator('.qtext').first().innerText().catch(() => '');
check('Quizfrage auf uk', qtext.includes(uk.stations.s02.quiz[0].q.slice(0, 20)) || qtext.includes(uk.stations.s02.quiz[1].q.slice(0, 20)) || qtext.includes(uk.stations.s02.quiz[2].q.slice(0, 20)) || qtext.includes(uk.stations.s02.quiz[3].q.slice(0, 20)), qtext.slice(0, 80));
check('Quizfrage ohne Entity-Rohtext', !/&uuml;|&auml;|&ouml;|&szlig;/.test(qtext));

// Arabisch: RTL
await page.goto(`${M}/course/view.php?id=${reg.courseId}&lang=ar`, { waitUntil: 'networkidle' });
check('ar setzt dir=rtl', (await page.evaluate(() => document.documentElement.getAttribute('dir'))) === 'rtl');

// Zurueck auf Deutsch, damit die Session sauber bleibt
await page.goto(`${M}/course/view.php?id=${reg.courseId}&lang=de`);
await browser.close();
console.log(failures ? `\n${failures} FAIL` : '\nBox-Smoke grün');
process.exit(failures ? 1 : 0);
```

- [ ] **Step 2: Laufen lassen**

Run: `npm run moodle:smoke`
Expected: sieben `PASS`, `Box-Smoke grün`. Bei `Quizfrage auf uk` FAIL mit deutschem Text: Fragetext-Filter prüfen (`format_text` auf Fragen läuft mit Kurskontext; Filter ist global an, also greift er — wenn nicht, `purge_caches`). Bei `iframe traegt ?lang=uk` FAIL: Label-HTML in der DB ansehen (`moodle_get_label`), ob der Editor das iframe entfernt hat.

- [ ] **Step 3: Manuelle Sichtprüfung (Dirk)**

Im Browser als `admin`: Profil → Sprache Ukrainisch → Kurs öffnen → Station 2 anklicken. Erwartet: Abschnittsnamen ukrainisch, im iframe deutscher Haupttext mit ukrainischer Stütze aufgeklappt, Vorhersage-Raster und Puzzle funktionieren, Check-Quiz auf Ukrainisch mit vier Fragen. Danach Sprache auf Arabisch: Seite rechts-nach-links, Code-Blöcke links-nach-rechts.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -q -m "test(moodle): end-to-end box smoke (profile language, section names, iframe lang, quiz, rtl)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01CrVe4qxK9KdjDspm6Gr84p"
```

---

### Task 14: Abschluss des Fundaments — Doku und Register

**Files:**
- Modify: `docker/CLAUDE.md` (Service-Tabelle), `code-welt/README.md`
- Memory: `C:\Users\mail\.claude\projects\C--Users-mail-entwicklung-docker\memory\projects\code-welt-minecraft-kurs.md`

- [ ] **Step 1: `docker/CLAUDE.md` — Zeile in die Service-Tabelle hinter „Hex-Automat"**

```markdown
| **Code-Welt** | _noch nicht deployt (nur lokal + Box)_ | `docker-compose-code-welt.yml` (ab Phase 6) + eigenes Repo [dSchulenburg/code-welt](https://github.com/dSchulenburg/code-welt) | **In Arbeit — nicht ungefragt ausrollen.** Mehrsprachiger Minecraft-Education-Programmierkurs für AVM-Klassen: Moodle-Hülle mit `multilang2` (Box-Vorbereitung `ki-kurs-box/prepare-code-welt.sh`) + React-App im iframe. Spec `docs/specs/2026-09-02-code-welt-minecraft-kurs-design.md`, Pläne `docs/plans/2026-09-02-code-welt-0*.md`. Bauskript `npm run moodle:build` im App-Repo, Register `moodle/registry.json`. |
```

- [ ] **Step 2: README im App-Repo um „Stand" ergänzen**

Unter der Überschrift „Moodle" anhängen:
```markdown
## Stand

Fundament (Plan 1) fertig: eine Station (DS 2) in sechs Sprachen, Box-Kurs gebaut, Smokes grün.
Nächster Schritt: Plan 2 (Etappen Holz und Stein, Charaktere, Welt „ankunft").
```

- [ ] **Step 3: Memory aktualisieren**

In `projects/code-welt-minecraft-kurs.md` einen Absatz „**Stand Fundament (Datum):**" mit courseId der Box, Ergebnis des Render-Spikes (Task 7) und dem Ergebnis der Encoding-Probe (Task 10) ergänzen. `MEMORY.md`-Zeile anpassen: „Fundament fertig, offen: Plan 2". Memory-Repo committen und pushen.

- [ ] **Step 4: Commits**

```bash
cd /c/Users/mail/entwicklung/docker && git branch --show-current && git add CLAUDE.md && git commit -q -m "docs(code-welt): Service-Eintrag, Fundament abgeschlossen

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01CrVe4qxK9KdjDspm6Gr84p"
cd /c/Users/mail/entwicklung/code-welt && git add -A && git commit -q -m "docs: foundation status

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01CrVe4qxK9KdjDspm6Gr84p" && git push -q origin main
```

---

## Definition of Done für Plan 1

- `bash ki-kurs-box/prepare-code-welt.sh` läuft zweimal durch, Verifikation zeigt beide Plugins, `stringfilters=multilang2`, sechs Sprachpakete.
- `npm test` grün (Vitest), `npm run smoke` grün (6 Sprachen × 1 Station), `node moodle/probe.mjs` grün, `npm run moodle:smoke` grün.
- `node moodle/build-course.mjs` zweimal hintereinander: zweiter Lauf legt nichts Neues an (4 CMIDs).
- Station 2 zeigt in der Box unter ukrainischem Profil: deutscher Haupttext, ukrainische Stütze, ukrainisches Quiz; unter arabischem Profil RTL.
- `src/assets/blocks/s02-weg.png` existiert; der Ausgang des Render-Spikes steht im Kopf von `scripts/render-blocks.mjs`.
- Beide Repos committed, App-Repo gepusht, Memory aktualisiert.

## Was Plan 2 daraus übernimmt

Das Schema von `STATIONS`, `i18n.de.stations[id]` und `content.de.stations[id]`; das Bauskript legt jede weitere Station automatisch an, sobald sie in `ETAPPEN[...].stations` steht; die Charakter-SVGs werden unter denselben Dateinamen durch Comic-Bilder ersetzt; Boss-Check-Aufgaben (`moodle_create_assignment`) und Badges kommen als neue Item-Typen in `course-def.mjs`.
