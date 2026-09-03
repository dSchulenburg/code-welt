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

## Stand

Fundament (Plan 1) fertig: eine Station (DS 2) in fünf von sechs Sprachen (Italienisch folgt, sobald das API-Guthaben aufgeladen ist: `npm run translate -- --lang it`), Box-Kurs 10 gebaut, App-Smoke und Box-Smoke grün. Das Block-Bild von DS 2 fehlt noch (manueller Screenshot, siehe `scripts/render-blocks.mjs`).
Nächster Schritt: Plan 2 (Etappen Holz und Stein, Charaktere, Welt „ankunft").
