# Code-Welt — Spec-Nachtrag für Plan 3 (Eisen)

**Stand:** 04.09.2026 · **Status:** mit Dirk abgestimmt (Brainstorming 04.09.2026) · **Ergänzt:** `2026-09-02-code-welt-minecraft-kurs-design.md` (Hauptspec) und `2026-09-03-code-welt-plan2-nachtrag.md` (Entscheidungen 1–12 gelten weiter)

> Plan 2 (Holz und Stein) ist abgeschlossen, einschließlich der Charaktere (Commit `6e7ad5d`).
> Dieser Nachtrag entscheidet, was die Hauptspec für die Etappe Eisen offen lässt, und legt den
> Bogen der drei Doppelstunden fest. Die Hauptspec bleibt die Autorität für alles andere; bei
> Widerspruch gilt dieser Nachtrag, danach der Plan-2-Nachtrag.

## 1. Entscheidungen

| # | Frage | Entscheidung | Begründung |
|---|---|---|---|
| 13 | Umfang (Hauptspec §10 plant Phase 3 als Eisen + Gold) | **Nur Eisen, DS 7–9.** Gold wird Plan 4 mit eigener Welt `parcours`. | Regel „zwei Etappen Vorsprung": Eisen muss zum Kursstart 02.11.2026 stehen, Gold erst Ende November. Eisen bringt drei neue Übungstypen; Gold dazu noch eine zweite Welt und den Modus „Python ändern" — in einem Plan zu groß, Review-Lücken zwischen Etappen wahrscheinlich |
| 14 | Übungstypen für „Python lesen" | **Zuordnung Blöcke ↔ Python, Lückencode, Fehlersuche** als **drei eigene Komponenten** (`MatchBlocksPython`, `FillCode`, `FindBug`) nach dem Muster von `ParsonsPuzzle`: Daten sprachfrei in `STATIONS[id].exercises`, Prompt und Feedback in i18n, Prüfen-Button, Feedback mit `role="status"`. Lückencode wählt per **Chips**, nicht per Tippen. | Spec 3.5 nennt die Typen; bisher gebaut sind nur Vorhersage und Sortier-Puzzle. Eigene Komponenten sind einzeln testbar; ein generischer „Auswahl-Motor" wäre Abstraktion vor der zweiten Verwendung. Chips: Syntax ohne Tastatur (A2), keine Tippfehler |
| 15 | Koordinaten in DS 8 | **Lesen absolut, bauen relativ.** Koordinatenanzeige der Welt einschalten, x/y/z ablesen („Wo bin ich?"); bauen mit `blocks.fill(block, pos(...), pos(...), FillOperation.REPLACE)` relativ zum Spieler. | Programme laufen an jeder Stelle der Welt; der Boss-Check (Höhe ablesen, Treppe relativ bauen) und Gold bauen darauf auf. Zwei Schreibweisen in einer Stunde — die App erklärt den Unterschied in der Brücke „Im Spiel ↔ Im Code" |
| 16 | Variablen im Programm | Die Variable steht als **erste Zeile im Chat-Handler** (`laenge = 5`, `stufen = 6`), nicht in einem `on start`-Block. | Ein Hut, ein Programm; „einmal oben ändern" bleibt wahr; die Block-Ansicht braucht keinen zweiten Hut |
| 17 | Zähler-Konzept in DS 9 | Der Zähler `index` wird **als Höhe in `fill` benutzt**: `blocks.fill(COBBLESTONE, pos(index, 0, 1), pos(index, index, 3), ...)` baut Stufe `index` mit Höhe `index + 1`, drei Blöcke breit, neben dem Spieler (z 1..3). | Der Zähler ist sichtbar wirksam, ohne Rechenausdruck in einem Slot (kein `index + 1` nötig). Die Treppe beginnt neben dem Spieler, nicht in ihm |
| 18 | Boss-Check Eisen | **Die zweite Klippe:** ein Plateau ohne Höhenangabe. `y` unten und oben ablesen (DS 8), `stufen` setzen (DS 7), Treppe bauen (DS 9), in drei Sätzen erklären, warum diese Zahl. **Aufgabe mit Online-Text** wie Holz/Stein; Titel „Boss-Check Eisen", Untertitel „Die zweite Klippe" fett im Intro. Badge-Kriterium: drei Quizze + Boss-Check abgeschlossen. | Verbindet alle drei Konzepte; gleiche Mechanik wie die bestehenden Boss-Checks (Plan-2-Entscheidung 3) |
| 19 | Welt | **Erkundungsgebiet in der Welt `ankunft`** (ab z=10, im Bauplan reserviert), kein eigenes Weltfile. Das Bauskript `welt-ankunft-bau.py` bekommt einen **zweiten Chat-Befehl `erkunden`**, additiv (läuft auch auf einer schon gebauten Welt). Maße in Abschnitt 4. | Ein Import für Holz bis Eisen; Dirk baut einmal und exportiert eine `.mcworld` |
| 20 | Block-Ansicht | Erweiterungen: **Variablen-Pille** in Zahlen-Slots (Wert ist ein String → Kategorie `variables`), **Minus-Ausdruck** `{ minus: ['stufen', 1] }` für die Obergrenze der `for`-Schleife, **pos-Pille** `{ pos: [x, y, z] }` (Einträge Zahl oder Variable), `fill` mit Slot für die Operation, **Einzelblock ohne Hut** (für die Zuordnung). | MakeCode zeigt `for index in range(stufen)` mit benutztem Zähler voraussichtlich als „for index from 0 to stufen − 1" — Editor-Prüfung, Abschnitt 5 |
| 21 | Übersetzung | **Pro Etappe im Plan** (wie Entscheidung 10), **Deckel 3 USD**, Kostenanzeige vor jedem Lauf. Kanon wächst: Zauberwörter `plattform`, `treppe`; neue Bezeichner-Liste `laenge`, `stufen`, `index`, `pos`, `fill` bleibt in Prosa aller Sprachen unverändert. Vier Glossar-Einträge: Variable, Koordinaten, fill, Zähler. | Plan 2: 2,81 USD für sechs Stationen inklusive Neulauf; drei Stationen liegen bei 1,2–1,6 USD |
| 22 | Charaktere | **Keine neuen Posen.** Die fünf Stimmungen reichen. | Kosten und Konsistenzrisiko ohne Nutzen |

## 2. Der Bogen der Etappe Eisen

Nach dem Haus will Dani die Welt erkunden. Nördlich der Startzone liegt das Erkundungsgebiet:
erst ein Fluss, dahinter eine Schlucht, am Ende eine Klippe mit Hochplateau. Nours Satz für die
Etappe: „Der Agent kann bauen. Du musst ihm sagen: wie lang, wo, wie hoch." Roter Faden:
**Zahlen bekommen Namen, Orte bekommen Zahlen, der Zähler zählt mit.**

| DS | Titel | Problem im Spiel | Neue Idee | Programm | Sichtbar | Übungen |
|---|---|---|---|---|---|---|
| 7 | Zahlen mit Namen | Der Fluss ist an Stelle A 5, an Stelle B 8 Blöcke breit. Die Zahl müsste an mehreren Stellen geändert werden. | Variable: `laenge = 5` steht einmal oben, die Schleife nutzt sie. Erster Blick auf Python: im Editor oben umschalten, die Zeile `laenge = 5` finden. | `bruecke` | Brücke, die an beiden Stellen passt | Zuordnung, Lückencode |
| 8 | Wo bin ich? | Die Schlucht ist zu breit und zu tief für Einzelblöcke. | Koordinaten anzeigen und x/y/z ablesen (absolut). `fill` füllt den Quader zwischen zwei Ecken, relativ zum Spieler (`pos`). Ein Befehl statt Schleife. | `plattform` | Plattform über die Schlucht | Zuordnung, Fehlersuche |
| 9 | Zählen | Die Klippe ist sechs Blöcke hoch. Jede Stufe muss eins höher sein als die vorige. | Der Zähler `index` ist eine Zahl mit Namen, die sich bei jedem Durchlauf ändert. `fill` nutzt ihn als Höhe. | `treppe` | Treppe auf das Plateau | Lückencode, Fehlersuche |

**Modus „Python lesen":** Jeder „Auftrag" enthält den Schritt „Schalte im Editor auf Python um und
finde die Zeile mit …". In der App übernehmen das die drei neuen Übungen; die Vorhersage bleibt
für DS 7 zusätzlich möglich (Brücke = `forward n`), für DS 8/9 nicht (`fill` hat kein Raster-Modell).

**Python-Entwürfe** (Signaturen nach `minecraft.makecode.com/reference`, Gegenprüfung im Editor
durch Dirk, Abschnitt 5):

```python
# DS 7 — bruecke
def on_bruecke():
    laenge = 5
    agent.teleport_to_player()
    agent.set_item(PLANKS_OAK, 64, 1)
    for index in range(laenge):
        agent.move(FORWARD, 1)
        agent.place(DOWN)
player.on_chat("bruecke", on_bruecke)

# DS 8 — plattform
def on_plattform():
    blocks.fill(PLANKS_OAK, pos(0, -1, 0), pos(4, -1, 8), FillOperation.REPLACE)
player.on_chat("plattform", on_plattform)

# DS 9 — treppe
def on_treppe():
    stufen = 6
    for index in range(stufen):
        blocks.fill(COBBLESTONE, pos(index, 0, 1), pos(index, index, 3), FillOperation.REPLACE)
player.on_chat("treppe", on_treppe)
```

Die Brücke entsteht unter dem schwebenden Agenten: ein Schritt vor, ein Block nach unten. Die
Plattform liegt eine Ebene unter den Füßen und läuft vom Spieler weg über die Schlucht; die
Treppe steigt neben dem Spieler auf. Beide `pos`-Programme setzen voraus, dass die Person auf der
**Startmarkierung** steht (Bauplan, Abschnitt 4), weil `pos` an den Weltachsen hängt, nicht an der
Blickrichtung. Welche Achse Schlucht und Klippe bekommen, legt der Plan nach dem Bauplan fest.

**Boss-Check Eisen — „Die zweite Klippe":** Plateau ohne Schild. Auftrag: Stell dich auf die
Markierung. Lies `y` unten ab. Geh hoch (Leiter am Rand) und lies `y` oben ab. Setze `stufen`.
Bau die Treppe. Schreib drei Sätze: Woher kommt deine Zahl? Was macht `index`? Was ändert sich,
wenn die Klippe höher ist?

## 3. Datenmodell-Ergänzungen

- `ETAPPEN[eisen].stations = ['s07', 's08', 's09']`. Damit legt das Bauskript Abschnitt 4 „Eisen"
  mit Labels und Quizzen an, der Postbuild das Badge (beides bereits aus `ETAPPEN` abgeleitet).
- `STATIONS.s07–s09`: `etappe`, `ds`, `iframeHeight` (gemessen), `python`, `blocks`, `exercises`;
  `s09.bossCheck = { key: 'boss-eisen', gradeMax }`.
- Übungen (sprachfrei, in `STATIONS[id].exercises`):
  - `{ type: 'match', pairs: [{ block: <Blockbeschreibung ohne Hut>, python: 'laenge = 5' }, …] }`,
    drei bis vier Paare; die App mischt die Python-Zeilen mit festem Seed; Bedienung: Block
    anklicken, Zeile anklicken; Tastatur: Tab, Enter.
  - `{ type: 'fill', code: 'laenge = ___\n…', gaps: [{ options: ['5', '8', 'laenge'], correct: '8' }] }`,
    Lücke `___` je Eintrag in `gaps`, Auswahl per Chips, mehrere Lücken erlaubt.
  - `{ type: 'findbug', lines: ['laenge = 8', 'agent.move(FORWARD, lange)'], wrong: 1 }`,
    genau eine falsche Zeile; typische Fehler: Tippfehler im Namen, `from`/`to` vertauscht,
    falsche Einrückung, Zahl statt Variable.
- Texte in `i18n.<lang>.stations[id].exercises[i]`: `prompt` (alle), `explain` (Fehlersuche:
  warum die Zeile falsch ist). UI-Strings von Parsons (Prüfen, Richtig, Nochmal) werden
  wiederverwendet; neue nur, wenn eine Übung sie zwingend braucht.
- Blockbeschreibung: Zahlen-Slots akzeptieren einen String (Variablenname) → Variablen-Pille;
  Ausdruck `{ minus: [name, n] }`; Position `{ pos: [x, y, z] }` mit Zahl oder Variablenname je
  Eintrag; `fill` bekommt den Slot `op` (Dropdown, Default `replace`). `BlockView` rendert
  wahlweise einen Einzelblock (Prop `single`).
- Konsistenztest (`tests/blocks-consistency.test.js`): `KIND_TO_PY` lernt `setVar` (→ `<name> = `)
  und `fill` (→ `blocks.fill(`), damit Reihenfolge und Tiefe auch für Eisen geprüft werden.
- `content/de.js`: `stations.s07–s09` mit `story` (jede Zeile mit `mood`), `concept`, `tips`.
- `i18n/de.js`: `stations.s07–s09` (Titel, `storyShort`, `bridge`, `tasks`, `tipSolution`,
  `exercises`, `quiz`, bei s09 `bossCheck`), `etappen.eisen.badge`, `glossary` + `variable`,
  `koordinaten`, `fill`, `zaehler`.
- `scripts/translate.mjs`: `MAGIC_WORDS` + `plattform`, `treppe`; neu `IDENT_CANON`
  (`laenge`, `stufen`, `index`, `pos`, `fill`) mit Test in allen Bündeln (wie der Zauberwort-Test).
- `content/lehrkraft/`: `ds07.md`, `ds08.md`, `ds09.md`; `01-welt-ankunft.md` Abschnitt
  „Erkundungsgebiet"; `00-setup.md` Absatz „Koordinaten anzeigen" (Welteinstellung, vor DS 8).
- `scripts/minecraft/welt-ankunft-bau.py`: Chat-Befehl `erkunden`.
- `src/assets/badges/eisen.svg` (200×200, flach, Eisenbarren in Grau-Silber, kein Text).
- Smokes: `scripts/smoke.mjs` läuft über alle Stationen (54 Checks) und prüft je Station, dass
  die Übungen der Station gerendert sind (`.exercise-match`, `.exercise-fill`, `.exercise-findbug`);
  `moodle/smoke-box.mjs` prüft Reihenfolge Abschnitt 4 und Badge Eisen; `moodle/smoke-learner.mjs`
  mit `--etappe eisen` (Option ist bereits generisch).

## 4. Welt: Erkundungsgebiet

Alle Lagen relativ zur Startzone der Welt `ankunft`; die Achsen übernimmt der Plan aus dem
bestehenden Bauplan (`01-welt-ankunft.md`, Blick Norden, Erkunden-Bereich ab z=10).

| Element | Maße | Material | Markierung | Für |
|---|---|---|---|---|
| Fluss | 20 lang, 2 tief; Stelle A 5 breit, Stelle B 8 breit | Wasser | Schild „DS 7 · bruecke" an beiden Stellen; Startmarkierung am Ufer | DS 7 |
| Schlucht | 30 lang, 7 breit, 6 tief | Luft (ausgehoben) | Schild „DS 8 · plattform"; Startmarkierung (Goldblock) am Rand | DS 8 |
| Klippe 1 | Plateau 10×10, 6 hoch | Stein | Schild „6 hoch"; Startmarkierung am Fuß, seitlich versetzt | DS 9 |
| Klippe 2 | Plateau 10×10, 4 hoch | Stein | **kein Schild**; Startmarkierung; Leiter am Rand zum Ablesen | Boss-Check |

Der Befehl `erkunden` setzt Fluss, Schlucht und beide Plateaus mit `blocks.fill(...)` und
`world(...)`-Koordinaten; Schilder, Leiter und Goldblöcke setzt Dirk von Hand (Schildertexte
stehen im Bauplan). Abstand zwischen den Elementen mindestens 6 Blöcke, damit keine Brücke in
die Schlucht ragt.

## 5. Im Editor zu prüfen (Dirk, vor dem Übersetzen)

1. `agent.place(DOWN)` nach `agent.move(FORWARD, 1)` baut über Wasser eine begehbare Brücke
   (Agent schwebt, fällt nicht).
2. `blocks.fill(..., FillOperation.REPLACE)`: Python-Schreibweise des Operators; `pos(0, -1, 0)` bis
   `pos(4, -1, 8)` liegt eine Ebene unter den Füßen; Achse der Ausdehnung.
3. `for index in range(stufen)` mit benutztem Zähler: zeigt der Block-Editor „for index from 0 to
   stufen − 1"? Wenn ja, bleibt Entscheidung 20 (Minus-Ausdruck); wenn er anders rendert, wird
   die Block-Ansicht angepasst, nicht das Python.
4. Variable als erste Zeile im Chat-Handler: erzeugt der Editor beim Umschalten Blöcke → Python
   genau `laenge = 5` unter `def on_bruecke():`, oder zieht er die Zuweisung in `on start`?
5. Koordinatenanzeige: Name der Welteinstellung in der deutschen und englischen Spiel-UI, für
   `00-setup.md`.

## 6. Umfang von Plan 3

Stationen DS 7–9 mit Story, Konzept, Block-Ansicht, Python, Aufgaben-Leiter, Tipp-Leiter, je zwei
Übungen aus den drei neuen Typen, Quiz; drei neue Übungskomponenten; Block-Ansicht-Erweiterungen;
Boss-Check Eisen; Badge Eisen; Erkundungsgebiet als Bauplan und Bauskript-Befehl; Lehrkraft-Seiten
DS 7–9 und Setup-Absatz; Übersetzung in fünf Sprachen; Smokes erweitert.

Nicht in Plan 3: Gold (Plan 4), Audio, Cheat-Sheets, Glossar-Vollausbau über die vier Einträge
hinaus, Deploy (Phase 6), Hour-of-Code-Verweise, neue Charakter-Posen.

## 7. Definition of Done für Plan 3

- Drei Stationen s07–s09 in sechs Sprachen, drei Quizze, Boss-Check Eisen als Aufgabe, Badge
  Eisen mit Icon; Verleihung über den echten Lernpfad nachgewiesen (`--etappe eisen`).
- `MatchBlocksPython`, `FillCode`, `FindBug` mit eigenen Tests; Block-Ansicht mit Variablen-Pille,
  Minus-Ausdruck, pos-Pille, Operator-Slot und Einzelblock; Konsistenztest deckt `setVar` und
  `fill`.
- Bauplan-Abschnitt Erkundungsgebiet und Befehl `erkunden` im Bauskript; `ds07–ds09.md`;
  Setup-Absatz Koordinaten.
- `iframeHeight` für s07–s09 gemessen; Bauskript zweimal idempotent; Box-Smoke und App-Smoke
  (54) je dreimal grün; Holz und Stein unverändert (bestehende Tests und Smokes grün).
- Übersetzung protokolliert, unter 3 USD; Kanon-Tests (Zauberwörter, Bezeichner) grün.
- Dirks Editor-Prüfung (Abschnitt 5) eingearbeitet; sein Probelauf Eisen folgt nach Plan 3.
