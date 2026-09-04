# Code-Welt — Programmieren lernen mit Minecraft Education

Lern-App zum Moodle-Kurs „Code-Welt" für AVM-Klassen (16–18, Deutsch A2–B1).
Deutsch ist die Leitsprache, Stütze in Englisch, Arabisch, Ukrainisch, Spanisch, Italienisch.

- Design: `docs/specs/2026-09-02-code-welt-minecraft-kurs-design.md` · Pläne: `docs/plans/`
- Live: https://lernmodule.dirk-schulenburg.net/code-welt/ (ab Phase 6)

## Entwickeln

    npm install
    npm run dev        # http://localhost:3030/code-welt/
    npm test

## Sprachen

`src/i18n/de.js` ist die Quelle. `npm run translate -- --lang all` erzeugt die fünf anderen
Dateien (braucht `ANTHROPIC_API_KEY`). `src/content/de.js` wird nie übersetzt.

## Moodle

Gesamtlauf in dieser Reihenfolge:

    npm run moodle:build          # zweimal — zweiter Lauf legt nichts mehr neu an (Idempotenz-Beweis)
    bash moodle/apply-completion.sh   # Quizze: Abschluss bei Bestehensnote 60 %
    bash moodle/apply-php.sh php/reset-badges.php <courseid>   # nur nach einem Quiz-Recreate nötig, s. u.
    npm run moodle:postbuild      # zweimal — Forum "Fragen an Nour" + Badges Holz/Stein

`npm run moodle:build` legt den Kurs in der Kurs-in-a-Box an oder aktualisiert ihn
(`moodle/registry.json` merkt sich die IDs). `npm run smoke` prüft die App (sechs Stationen ×
sechs Sprachen), `npm run moodle:smoke` den Kurs in der Box End-to-End (Login, Reihenfolge,
Forum, Boss-Check, Quiz, Badges, RTL). Nachlauf-Items wie das Forum „Fragen an Nour" tragen im
Register ein `managedBy`-Feld (z. B. `managedBy: 'postbuild'`) und werden von der
Verwaisungs-Bereinigung in `moodle:build` deshalb nicht angefasst — vorher hat jeder Build das
Forum als „verwaist" gelöscht und `moodle:postbuild` es neu angelegt, dabei wären auf Produktion
alle Forenbeiträge verloren gegangen (Fix 3c, behoben).

**Tradeoff für Produktion:** Ein geänderter Quiz-Name, -Intro oder geänderte Fragen lösen in
`moodle:build` ein Neu-Anlegen aus (Moodle kann Quizfragen nicht in-place ersetzen) — die CMID
wandert, damit verlieren die Badge-Kriterien und die Kurs-Abschlusskriterien ihr Ziel, und die
Versuchshistorie der Lernenden geht verloren. War das Badge bereits verliehen, sperrt Moodle
außerdem die Kriterien-Änderung (`ACTIVE_LOCKED`) — dafür gibt es `moodle/php/reset-badges.php`
(**nur Box**, löscht Verleihungen). Auf Produktion vor einem Rebuild: Badges prüfen, Versuchshistorie
sichern, nicht blind `moodle:build` laufen lassen. Das Forum „Fragen an Nour" ist von diesem
Tradeoff nicht betroffen (s. o., `managedBy`).

`scripts/blocks-js/s02.js` ist veraltet (Vorlage für ein optionales, manuell gerendertes Bild aus
Plan 1) — die App zeichnet die Block-Ansicht aller sechs Stationen live aus `src/data/stations.js`,
diese Datei wird nicht mehr gebraucht und nicht mehr gepflegt.

## Stand

**Plan 2 (Holz und Stein) fertig:** sechs Stationen (DS 1–6) in sechs Sprachen, Block-Ansicht
(SVG, live aus den Stationsdaten gezeichnet — kein manueller Screenshot mehr), zwei Boss-Checks
(Aufgaben mit Online-Text), zwei Badges (Holz, Stein), Forum „Fragen an Nour", Lehrkraft-Abschnitt
(Setup, Weltbauplan, Stundenverläufe DS 1–6), Referenzbilder für Nour und Dani. Box-Kurs 10 gebaut, Gesamtlauf
(`moodle:build` ×2, `apply-completion.sh`, `reset-badges.php`, `moodle:postbuild` ×2) durch, Badge
Holz für den Testschüler `schueler1` erneut nachgewiesen. App-Smoke (36 Checks) und Box-Smoke
(13 Checks) je dreimal hintereinander grün.

Charaktere: Referenzbilder für Nour und Dani liegen vor (0,08 USD), die zehn Posen (fünf je
Figur) folgen nach Dirks Freigabe. Übersetzung der sechs Stationen in fünf Sprachen: 2,81 USD.

Nicht in Plan 2: Audio, Cheat-Sheets, Glossar-Vollausbau (Phase 5), Deploy (Phase 6), Etappen ab
Eisen.

**Offen für Dirk** (Details: `docs/lehrkraft-probelauf.md`):
- Python im Editor gegenprüfen — Stationen s01–s06 sowie `scripts/minecraft/welt-ankunft-bau.py`
  (`agent.teleport(world(...), NORTH)`-Signatur).
- Ring-Tür-Hypothese (Boss-Check Stein): im Spiel nachzählen, ob der Ring 19 oder 20 Blöcke hat.
- Weltdatei „ankunft" im Editor bauen (Bauplan + Bauskript liegen bereit), als `.mcworld`
  exportieren, in den Lehrkraft-Ordner „Weltdateien" hochladen.
- uk- und ar-Übersetzung von Muttersprachler:in gegenlesen lassen.
- Referenzbilder Nour/Dani freigeben, damit Phase B (Posen) starten kann.

Nächster Schritt: Charaktere Phase B nach Freigabe, danach Plan 3 (Eisen) oder Phase 5/6.
