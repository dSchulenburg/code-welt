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
    bash moodle/apply-php.sh php/test-student.php <courseid>   # legt schueler1 an/schreibt ihn ein (idempotent)
    npm run moodle:smoke:learner  # echter Lernpfad als schueler1 (Holz; --etappe stein für Stein)
    npm run moodle:smoke          # 13 Checks, admin-seitig

`npm run moodle:build` legt den Kurs in der Kurs-in-a-Box an oder aktualisiert ihn
(`moodle/registry.json` merkt sich die IDs). `npm run smoke` prüft die App (sechs Stationen ×
sechs Sprachen), `npm run moodle:smoke` den Kurs in der Box End-to-End (Login, Reihenfolge,
Forum, Boss-Check, Quiz, Badges, RTL) — alles admin-seitig, ohne echten Abschluss. `npm run
moodle:smoke:learner` ist der einzige Lauf, der als Lernender zählt: Login als `schueler1`, die
drei Quizze der Etappe mit den echten richtigen Antworten aus `src/i18n/de.js`, eine echte
Online-Text-Abgabe am Boss-Check, danach per MCP der Nachweis, dass Moodle das Etappen-Badge ohne
Admin-Override verliehen hat. Setzt `schueler1` vorher selbst zurück (ruft `reset-test-student.php`
auf), der Lauf beginnt also immer bei null. Nachlauf-Items wie das Forum „Fragen an Nour" tragen im
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

### Vor dem Probelauf (nur Box)

    bash moodle/apply-php.sh php/reset-test-student.php <courseid> schueler1

Setzt `schueler1` in einem Kurs auf den Ausgangszustand zurück: löscht Aktivitätsabschluss,
Quizversuche (inkl. `question_usages`), die Boss-Check-Abgabe (inkl. Online-Text) und die Noten,
und setzt beide Badges wieder auf ACTIVE (unverliehen). Nur die Box — nie gegen Produktion
ausführen, dort wären das echte Schüler-Daten. `npm run moodle:smoke:learner` ruft dieses Skript
selbst vor dem Lernpfad auf; für einen manuellen Probelauf (z. B. bevor Dirk sich selbst als
`schueler1` einloggt) einmal von Hand laufen lassen, danach `npm run moodle:postbuild` (Badges
wieder mit den aktuellen CMIDs verknüpfen, falls seitdem ein Quiz neu angelegt wurde).

`scripts/blocks-js/s02.js` ist veraltet (Vorlage für ein optionales, manuell gerendertes Bild aus
Plan 1) — die App zeichnet die Block-Ansicht aller sechs Stationen live aus `src/data/stations.js`,
diese Datei wird nicht mehr gebraucht und nicht mehr gepflegt.

## Screenshots (Stand 17.09.2026)

Deutsch, 900px Breite, volle Seite (`scripts/measure-heights.mjs` erzeugt die Werte, die
Screenshots selbst entstehen mit einem Wegwerf-Playwright-Skript nach demselben Verfahren, siehe
Final-Review-Fix A):

- `docs/station-s01.png` … `docs/station-s06.png`: je eine Station komplett (Holz, Stein).
- `docs/station-s07.png`: Station komplett (Eisen, Block und Python nebeneinander).
- `docs/station-s08.png`, `docs/station-s09.png`: Station komplett (Eisen). Neu aufgenommen
  17.09.2026 (Plan 4, Task 11): beide stapeln seit Task 3 Block-Ansicht und Python
  untereinander (`blockViewWidth` über `WIDE_MAIN = 500`).
- `docs/station-s10.png` … `docs/station-s12.png`: je eine Station komplett (Gold, Block und
  Python nebeneinander, beide bleiben unter `WIDE_MAIN`).
- `docs/blockview-s02.png` — Block-Ansicht und Python nebeneinander (Station s02, `.side-by-side`).

## Stand

**Plan 2 (Holz und Stein) fertig:** sechs Stationen (DS 1–6) in sechs Sprachen, Block-Ansicht
(SVG, live aus den Stationsdaten gezeichnet — kein manueller Screenshot mehr), zwei Boss-Checks
(Aufgaben mit Online-Text), zwei Badges (Holz, Stein), Forum „Fragen an Nour", Lehrkraft-Abschnitt
(Setup, Weltbauplan, Stundenverläufe DS 1–6), Comic-Portraits für Nour und Dani in fünf Stimmungen. Box-Kurs 10 gebaut, Gesamtlauf
(`moodle:build` ×2, `apply-completion.sh`, `reset-badges.php`, `moodle:postbuild` ×2) durch, Badges
Holz und Stein je über den echten Lernpfad nachgewiesen (`npm run moodle:smoke:learner`, als
`schueler1`: drei Quizze mit 100 %, echte Boss-Check-Abgabe, Badge sofort verliehen — ohne
Admin-Override, ohne Cron). Dabei ein Fund: `moodle/course-def.mjs` reichte die Multichoice-Fraction
als Prozentzahl (100/0) statt als Anteil (1.0/0.0) durch, Moodle wertete dadurch bis zu 2500 %
statt 100 % — behoben (Final-Review-Fix B), alle sechs Quizze mit korrigierten Fraktionen neu
angelegt. App-Smoke (36 Checks) und Box-Smoke (13 Checks) je dreimal hintereinander grün.

Charaktere: je Figur ein Referenzbild und fünf Posen (erklärend, fragend, begeistert,
nachdenklich, überrascht) per `scripts/characters.mjs` (Nano Banana, 0,48 USD gesamt); das
Story-Panel wählt das Portrait nach `mood` und fällt auf die SVG-Silhouette zurück, wenn eine Datei
fehlt. Die PNGs sind palettenreduziert (512×512, ~50–80 KB statt ~220 KB). Übersetzung der sechs
Stationen in fünf Sprachen: 2,81 USD.

Nicht in Plan 2: Audio, Cheat-Sheets, Glossar-Vollausbau (Phase 5), Deploy (Phase 6), Etappen ab
Eisen.

**Plan 3 (Eisen) fertig:** drei Stationen (DS 7–9) in sechs Sprachen. Block-Ansicht erweitert um
Variablen-Pille, Minus-Ausdruck, pos-Pille und Operator-Slot; drei neue Übungstypen fürs
Python-Lesen (`MatchBlocksPython`, `FillCode`, `FindBug`) mit eigenen Komponententests; Boss-Check
Eisen als Aufgabe, Badge Eisen mit Icon, Verleihung über den echten Lernpfad nachgewiesen (`npm run
moodle:smoke:learner -- --etappe eisen`); Erkundungsgebiet (Fluss, Schlucht, zwei Klippen,
Goldmarken) als Bauplan und Chat-Befehl `erkunden` im Weltbauskript; Lehrkraft-Seiten ds07–ds09.
Übersetzung der drei Stationen plus vier neue Glossarbegriffe in fünf Sprachen: 1,558 USD (unter
dem 3-USD-Deckel), der Chunk-Cache übernimmt s01–s06 unverändert aus dem letzten Lauf und
übersetzt nur Eisen neu. `iframeHeight` für s07–s09 gemessen (Task 11, 16.09.2026): 4700, 4750,
4500; nach dem Final-Review-Fix (Zuordnung in natürlicher Blockgröße) nachgemessen: 4650, 4850,
4500.

**Final-Review-Fix (16.09.2026):** +z ist in Minecraft Süden, nicht Norden. Koordinaten bleiben,
Richtungswörter, Schilder („Blick nach Süden") und die Blickrichtung im Weltbauskript (`SOUTH`,
Weg und Ring starten am Westrand) sind korrigiert. Dazu: s08-Zuordnung lesbar (breite
`fill`-Blöcke in natürlicher Größe, Spalten gestapelt), s08-Fehlersuche beschreibt das richtige
Ergebnis (dicke Mauer statt Platte über dem Kopf), „Prüfen" in der Fehlersuche erst nach einer
Zeilenwahl. Neuübersetzung nur `stations.s08`: 0,253 USD (Plan 3 gesamt 1,811 USD). App-Smoke (54 Checks) und Box-Smoke (16 Checks) je dreimal hintereinander grün, Lernenden-Pfad
Eisen und Holz beide grün (Plan 2 bleibt unverändert).

Zwei Funde beim Gesamtlauf für Task 11: `moodle/build-course.mjs` erwartete nach einem
Label-Update noch die alte Delete+Recreate-Antwort mit „Neuer CMID" in der Meldung. Seit
MCP-Server v3.5.0 läuft das Update in-place, die CMID bleibt gleich, und der alte Parser warf einen
Fehler, sobald sich eine Label-Höhe wirklich änderte. Behoben, kein CMID-Extrakt mehr nötig. Und:
das `.side-by-side`-Grid (Block-Ansicht neben Python) hatte kein `min-width: 0`, dazu setzte
`.findbug-line code` starres `white-space: pre`. Die lange Zeile mit `pos(index, index, 3)` im
Haupt-Python von s09 (`.side-by-side .code pre`, nicht die Fehlersuchzeile mit
`pos(index, stufen, 3)`) sprengte dadurch bei 750px Iframe-Breite die ganze Seite nach rechts. Beide
Stellen in `src/styles.css` korrigiert (Grid schrumpft jetzt, Fehlersuchzeilen brechen bei Bedarf
um), `scripts/smoke.mjs` prüft seitdem zusätzlich `scrollWidth <= 750`.

Nicht in Plan 3: Gold (Plan 4), Audio, Cheat-Sheets, Glossar-Vollausbau über die vier Einträge
hinaus, Deploy (Phase 6), Hour-of-Code-Verweise, neue Charakter-Posen.

**Plan 4 (Gold) fertig:** drei Stationen (DS 10–12) in sechs Sprachen mit `if`, `if/else` und
`while not`. Block-Ansicht um Sechseck-Bedingungen erweitert (`agent.detect` in Agent-Farbe, `not`
in Logik-Farbe, verschachtelbar), dazu eine `else`-Zeile; Konsistenztest deckt jetzt `if `,
`else:` und `while ` gegen das Python ab. Neuer Übungstyp „Tipp-Lücke" (`TypeGap`, eigene
Prüflogik `judgeGap`/`judgeAll`, meldet „Fast" bei falscher Groß-/Kleinschreibung statt einfach
„falsch"). Die Hauptansicht stapelt jetzt breite Blöcke über den Python-Code statt sie
nebeneinander zu quetschen (`WIDE_MAIN = 500`, `ConceptCard.jsx`). Das trifft s08 und s09 (Eisen,
`fill`-Blöcke); Gold bleibt nebeneinander. Ein Parcours (`scripts/minecraft/parcours.json`, vier
Bahnen: Ecke, Löcher, Ziel, Boss) mit eigenem Simulator (`parcours-sim.mjs`, Achsen-Mutationsprobe,
Bindung an `STATIONS` und die Tipp-Lücken-Antworten) und Skript-Abgleich gegen
`welt-ankunft-bau.py`. Boss-Check Gold als Aufgabe, Badge Gold mit Icon, Verleihung über den
echten Lernpfad nachgewiesen (`npm run moodle:smoke:learner -- --etappe gold`). Übersetzung der
drei Stationen, der `ui`-Schlüssel der Tipp-Lücke und vier neuer Glossarbegriffe in fünf Sprachen:
1,331 USD (unter dem 3-USD-Deckel).

`iframeHeight` für s10–s12 gemessen (Task 11, 17.09.2026): 4950, 4750, 4750 (ersetzen den
vorläufigen Wert 5200). Dabei fiel auf, dass s08 und s09 durch das Stapeln aus Task 3 spürbar
höher geworden sind: 4850→4950 bzw. 4500→4700, neu vermessen und neu geschossen. s01–s07 bleiben
unverändert. Box neu gebaut (`moodle:build` ×2: Labels s08–s12 beim ersten Lauf in-place
aktualisiert, cmid unverändert; zweiter Lauf ohne Änderungen), `apply-completion.sh`,
`moodle:postbuild` ×2 (keine Quiz-Neuanlage, `reset-badges.php` darum nicht nötig). App-Smoke
(72 Checks) und Box-Smoke (19 Checks) je dreimal hintereinander grün; Lernenden-Pfade Gold, Eisen
und Holz alle grün (Eisen/Holz unverändert gegenüber Plan 2/3).

Abweichungen gegenüber dem Plan (Details je Task-Report, Ledger
`.superpowers/sdd/2026-09-17-code-welt-04-gold/progress.md`): das Bauskript setzt Goldmarken und
Redstone-Block selbst statt sie Dirk von Hand setzen zu lassen; die s11-Fehlersuche prüft
`FORWARD` statt `DOWN`; die Stapel-Schwelle der Hauptansicht liegt bei 500 px statt einer halben
Spalte; der Boss-Text steht im Präsens; ds12 bekam ein 60/80/100-Punkteraster wie ds09. Zwei
Handkorrekturen nach der maschinellen Übersetzung: uk s11 „Agent" in lateinischer statt
kyrillischer Schrift (jetzt mit eigenem Test gegen „Агент" abgesichert), ar s12 Imperative statt
Verbalnomen; dazu der Boss-Titel-Trenner „: " in uk/ar s09 und s12. Ob der Agent über Löchern
fällt, ist weiterhin offen (Prüfliste unten). Alle vier Boss-Aufgaben wurden beim letzten Box-Bau
neu angelegt, weil der `ui`-Chunk (Tipp-Lücken-Hinweis) neu übersetzt wurde (erwartet, kein Fund).

Nicht in Plan 4: Diamant, Audio, Cheat-Sheets, Deploy (Phase 6), Hour-of-Code-Verweise, neue
Charakter-Posen, die it/es-Korrekturen aus Plan 3.

**Offen für Dirk** (Details: `docs/lehrkraft-probelauf.md`):
- **Offener DoD-Punkt Plan 4:** Prüfliste „Im Editor und im Spiel zu prüfen" (Nachtrag Plan 4,
  Abschnitt 5, sieben Punkte: zählt `agent.detect(BLOCK)` Wasser/Lava/Luft als Block, fällt der
  Agent über einem Loch, füllt `agent.place(DOWN)` ein Luftloch, erkennt `REDSTONE` einen Block
  oder nur Staub, schaut der Agent nach `teleport_to_player()` in Blickrichtung und dreht
  `LEFT_TURN` bei Süden nach Osten, wie zeigt der Editor `if/else`/`while not`/`repeat` an, wie
  stoppt man ein endloses `while` im Code Builder) steht noch aus.
- **Weiterhin offen: Offener DoD-Punkt Plan 3** (Editor-Prüfung s07–s09, s. Plan-3-Abschnitt
  unten).
- Ändert die Prüfung Python oder Stütztexte von s10–s12, diese Chunks neu übersetzen
  (`npm run translate -- --lang all --chunk stations.s10,stations.s11,stations.s12`).
- Welt „ankunft" um den Parcours erweitern (Bauplan + Bauskript-Befehl `parcours` liegen bereit),
  Schilder setzen, danach komplett neu als `.mcworld` exportieren (weiterhin auch das
  Erkundungsgebiet aus Plan 3 offen, siehe unten).
- **Bahn „Löcher" zurücksetzen:** gefüllte Löcher bleiben nach einem Lauf gefüllt, ein zweiter
  Versuch braucht dann weniger Durchläufe. Entscheiden, wie SuS die Bahn neu bauen: Ist der Befehl
  `parcours` in der exportierten Welt für sie verfügbar, oder setzt die Lehrkraft zurück?
- **Probelauf Gold** in der Box (Abschnitt „Etappe Gold" in `docs/lehrkraft-probelauf.md`),
  ausdrücklich noch nicht durchgeführt.
- Python im Editor gegenprüfen — Stationen s01–s09 sowie `scripts/minecraft/welt-ankunft-bau.py`
  (`agent.teleport(world(...), SOUTH)`-Signatur, Nachtrag Plan 3 Abschnitt 5: Brücke über Wasser,
  `FillOperation.REPLACE`-Syntax, `for … to`-Rendering im Editor, Variable als erste Zeile im
  Chat-Handler, Name der Koordinatenanzeige in der Spiel-UI).
- Vor `erkunden` im Spiel prüfen: Bodenhöhe (Gras auf y=4?), Achsen (baut `pos(0, 0, 1)` nach
  Süden?), zeigt die Koordinatenanzeige die Fußhöhe? (Bauplan Abschnitt „Bodenhöhe",
  `docs/lehrkraft-probelauf.md` „Offene Punkte").
- Ring-Tür-Hypothese (Boss-Check Stein): im Spiel nachzählen, ob der Ring 19 oder 20 Blöcke hat.
- Weltdatei „ankunft" im Editor bauen (Bauplan + Bauskript liegen bereit, inkl. Erkundungsgebiet),
  als `.mcworld` exportieren, in den Lehrkraft-Ordner „Weltdateien" hochladen.
- uk- und ar-Übersetzung von Muttersprachler:in gegenlesen lassen (Eisen und Gold kommen dazu; die
  arabische Register-Frage aus Task 9, Imperative bleiben maskulin, ist eine eigene, noch offene
  Entscheidung).
- Probelauf Eisen in der Box (Abschnitt „Etappe Eisen" in `docs/lehrkraft-probelauf.md`).

Nächster Schritt: Dirks Prüflisten (Plan 3 und Plan 4, je Abschnitt 5) und die Probeläufe Eisen
und Gold in der Box, danach Plan 5 (Diamant) bzw. Phase 5/6.
