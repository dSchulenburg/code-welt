# Design: „Code-Welt" — mehrsprachiger Programmierkurs mit Minecraft Education

> Verschoben aus dem privaten docker-Repo am 03.09.2026. Pfade wie `docker/ki-kurs-box/…` meinen dort die lokale Kurs-in-a-Box; `docs/…` meint dieses Repo.

**Stand:** 02.09.2026 · **Status:** Entwurf, mit Dirk abgestimmt · **Ziel-Instanz:** Kurs-in-a-Box (Bau), dann `moodle.dirk-schulenburg.net` (Produktion)
**Kursstart:** Anfang November 2026, nach den Hamburger Herbstferien (19.–30.10.)

> Dieses Dokument ist die Begründung. Was gebaut wird, in welcher Reihenfolge und wann es
> fertig ist, steht im daraus abgeleiteten Implementierungsplan.

---

## 1. Zweck

Ein Programmierkurs für AVM-Klassen (Ausbildungsvorbereitung für Migrantinnen und Migranten,
16 bis 18 Jahre, Deutsch A2 bis B1) auf Basis der Minecraft-Education-Schullizenz der BS:WI.
20 Doppelstunden, Deutsch als Leitsprache, fünf Stützsprachen (Englisch, Arabisch, Ukrainisch,
Spanisch, Italienisch). Der Kurs vermittelt die Grundlagen der Programmierung — Befehl, Sequenz,
Ereignis, Schleife, Variable, Bedingung, Funktion, Liste — zuerst in MakeCode-Blöcken, dann in
Python. Er ist kurzweilig, weil jede Doppelstunde mit etwas Sichtbarem im Spiel endet, und er ist
tief genug, weil am Ende alle kurze Python-Programme lesen und schreiben.

Ausgeliefert wird ein Moodle-Kurs mit eingebetteter Lern-App, Badges pro Etappe und einem
Zertifikat. Der Kurs ist so gebaut, dass Kolleg:innen ihn ohne Dirk unterrichten können.

## 2. Getroffene Entscheidungen

| # | Entscheidung | Begründung |
|---|---|---|
| 1 | **Hybrid:** mehrsprachige Moodle-Hülle (Multilang-Filter) + eigene Lern-App im iframe | Der Filter erreicht Navigation, Quizze und Badges serverseitig und überlebt jedes Theme. Die App trägt die reichen Inhalte aus Git, mit bewährter i18n-Architektur. Reines Moodle hätte sechsfachen Text in der Datenbank und keinen Übersetzungs-Workflow; reine App ließe Moodle einsprachig |
| 2 | **Deutsch als Leitsprache, Stützsprachen nur für Aufgaben, Brücke, Glossar, Story-Kurzfassung, Oberfläche, Quizfragen** | Dirks Wahl: Immersion bleibt, aber niemand scheitert an der Aufgabenstellung. Erklärtexte bleiben deutsch mit Vorlese-Audio |
| 3 | **Blöcke → Python**, Umschlag ab Etappe Diamant (DS 13) | Windows-PCs mit Tastatur sind gesetzt; MakeCode wandelt Programme per Umschalter zwischen Blöcken und Python, das ist das Sicherheitsnetz |
| 4 | **MakeCode-Editor auf Englisch** | Blocknamen und Python-Schlüsselwörter sind dann dieselben Wörter; Screenshots gelten für alle sechs Sprachen; Englisch ist für die Zielgruppe selten fremder als Deutsch |
| 5 | **Erst Box, dann Produktion** per Backup/Restore | Viele Schreibzugriffe beim Bauen; Produktion hat echte Schüler:innen |
| 6 | **Topics-Format**, nicht Tiles | Das Tiles-Modal führt Content-JavaScript nie aus (Memory: `format-tiles-modal-scripts`); die App läuft im iframe, aber Labels mit Skript wären tot |
| 7 | **Storytelling: „Der Agent versteht nur Code"** mit Nour und Dani als Peer-Figuren | Code als gemeinsame Sprache einer mehrsprachigen Klasse; der Agent macht exakt, was man sagt — Fehler sind Missverständnisse, kein Versagen |
| 8 | **Etappen als Werkzeugstufen** Holz → Enderdrache, Badge und Boss-Check pro Etappe | Level-Baum aus dem Mentor-Byte-Prompt; Minecraft-Spieler:innen kennen die Ordnung |
| 9 | **Abschlussprojekt + customcert-Zertifikat**, Boss-Checks nur „bestanden / noch nicht" | Kein Notendruck, aber ein echtes Artefakt für die Bewerbungsmappe |
| 10 | **React/Vite** trotz Vanilla-Default | i18n-Registry, RTL, Deploy-Kette aus dem Strudel-Kurs sind fertig; Sortier-Puzzle und Raster-Vorhersage sind komponentenlastig. Von Dirk ausdrücklich freigegeben |
| 11 | **Kein H5P** | Kein Tracking-Bedarf über Moodle-Quizze hinaus; der H5P-Generator hardcodet `"language": "de"` |
| 12 | **Einzelwelten bis Diamant, gemeinsame Welt nur für die Stadt** | Multiplayer ist P2P, der Host muss im Spiel bleiben, realistisch 8 bis 10 Spieler:innen auf Schulhardware. Das Risiko gehört an das Ende, nicht an den Anfang |

## 3. Didaktische Architektur

### 3.1 Narrativer Rahmen

Die Klasse kommt in eine neue Welt. Dort wartet **der Agent**, der Roboter, den MakeCode in
Minecraft Education steuert. Er kann alles bauen, aber er versteht kein Deutsch, kein Arabisch,
kein Ukrainisch, kein Spanisch, kein Italienisch. Er versteht nur eine Sprache: Code. Wer Code
lernt, kann mit ihm reden. Code wird die gemeinsame Sprache der Klasse, in der niemand einen
Vorsprung hat.

Drei Figuren:

| Figur | Rolle | Was sie nie tut |
|---|---|---|
| **Der Agent** | stumm, handelt nur; Hauptfigur des Tuns | sprechen, interpretieren, „mitdenken" |
| **Nour** | war letztes Jahr im Kurs; erklärt, ermutigt, gibt die Tipp-Leiter | belehren wie eine Lehrkraft |
| **Dani** | neu wie die SuS; stellt die Fragen, die alle haben, macht die typischen Fehler, feiert | sich für Fehler schämen |

Nour und Dani entstehen als Comic-Charaktere aus der Media Factory mit fünf festen Posen
(erklärend, fragend, begeistert, nachdenklich, überrascht), nach dem Muster der
Geschichtsportal-Charaktere. Der Agent wird nicht neu gezeichnet; im Spiel ist er da, in der App
ist er ein einfaches Sprite auf einem Raster. Die Namen sind Vorschlag und in einer einzigen
Datei änderbar.

Story-Muster nach dem Section-Analyzer: **D „Die Reise"** (Stationen, Stempel) kombiniert mit
**E „Der Experten-Aufstieg"** (Werkzeugstufen).

### 3.2 Etappen und Doppelstunden

Jede Etappe endet mit einem **Boss-Check** (Aufgabe ohne Tipp-Leiter lösen und in drei Sätzen
erklären) und einem **Badge**. Jede Doppelstunde endet mit etwas Sichtbarem im Spiel.

| Etappe | DS | Titel | Konzept | Sichtbares Ergebnis | Modus |
|---|---|---|---|---|---|
| **Holz** | 1 | Die neue Welt | Spiel, Sprache, Welt importieren, Code Builder öffnen (Taste `C`), erster Chat-Befehl | Der Agent kommt zu dir | Blöcke |
| | 2 | Reihenfolge zählt | Sequenz: gehen, drehen, Block setzen | Ein Pfad aus Blöcken | Blöcke |
| | 3 | Zauberwörter | Ereignis: mehrere Chat-Befehle; **Boss-Check Holz:** Agent legt ein „L" | Ein kleiner Turm | Blöcke |
| **Stein** | 4 | Wiederholen | `repeat`: zehn Blöcke mit einem Befehl | Eine Mauer | Blöcke |
| | 5 | Schleife in der Schleife | Zwei `repeat`: Breite × Höhe | Eine Wand | Blöcke |
| | 6 | Das Haus | `repeat 4` um Wand + Drehung; **Boss-Check Stein:** Zaun um dich herum | Ein Haus | Blöcke |
| **Eisen** | 7 | Zahlen mit Namen | Variable: `laenge` an einer Stelle ändern; erster Blick auf Python per Umschalter | Brücke variabler Länge | Blöcke, Python lesen |
| | 8 | Wo bin ich? | Koordinaten x/y/z, Position, `fill` zwischen zwei Punkten | Eine Plattform | Blöcke, Python lesen |
| | 9 | Zählen | Schleife mit Zähler; **Boss-Check Eisen:** Treppe mit variabler Stufenzahl | Eine Treppe | Blöcke, Python lesen |
| **Gold** | 10 | Wenn, dann | `if` + Agent erkennt Block vor sich | Agent stoppt vor der Wand | Blöcke bauen, Python lesen |
| | 11 | Sonst | `if/else`: Brücke nur über Wasser | Agent überquert den Fluss | Blöcke bauen, eine Zahl in Python ändern |
| | 12 | Solange | `while` bis Hindernis; **Boss-Check Gold:** Parcours durchqueren | Parcours geschafft | Bedingung in Python ändern |
| **Diamant** | 13 | Eigene Befehle | Funktion `def haus():` | Haus per Aufruf | Python schreiben, Blöcke als Fallback |
| | 14 | Befehle mit Zutaten | Parameter `def turm(hoehe):` | Drei Türme, drei Höhen | Python schreiben |
| | 15 | Listen | Liste von Blockarten, `for block in materialien:` | Bunte Straße | Python schreiben |
| | 16 | Alles zusammen | Funktionen kombinieren; **Boss-Check Diamant:** eigene Funktion mit Parameter | Ein Dorf | Python schreiben |
| **Netherite** | 17 | Planen | Gruppen à 3–4, Viertel wählen, Bauplan, Funktionen aufteilen | Bauplan auf der Pinnwand | — |
| | 18 | Bauen | Gemeinsame Welt, jedes Team baut sein Viertel per Code | Die Stadt wächst | Python (Blöcke erlaubt) |
| | 19 | Fertigstellen | Debuggen, Share-Link + Screenshot abgeben, Präsentation vorbereiten | Abgabe in Moodle | |
| **Enderdrache** | 20 | Stadtführung | Jedes Team führt durch sein Viertel; Feedback; Zertifikat | Zertifikat | |

Die Python-Beispiele in der App nutzen die MakeCode-API für Minecraft (`agent.move`,
`agent.turn`, `agent.place`, `player.on_chat`, `blocks.fill`, `agent.detect`). Exakte Signaturen
werden im Plan gegen den Browser-Editor `minecraft.makecode.com` verifiziert, nicht aus dem
Gedächtnis geschrieben.

### 3.3 Stundenrhythmus

Jede Doppelstunde folgt demselben Rhythmus, damit das Muster nach zwei Wochen trägt und die
Sprache nicht jedes Mal neu erschlossen werden muss:

| Phase | Min | Was passiert | Wo |
|---|---|---|---|
| Story | 5 | Comic-Panel mit Nour und Dani, Audio, Problem der Stunde | App |
| Konzept | 10 | Eine Idee, als Brücke „Im Spiel ↔ Im Code" (Strudel-Muster), Block und Python nebeneinander | App |
| Im Spiel | 45 | Aufgaben-Leiter in der Welt, Pair Programming mit Rollentausch nach 15 Min | Minecraft |
| Check | 20 | Interaktive Übung in der App, dann Mini-Quiz mit 3 bis 5 Fragen ins Gradebook | App + Moodle |
| Spielstand | 5 | „Was kann ich jetzt?" in drei Sätzen, Fortschritt sichtbar | App |

### 3.4 Aufgaben-Leiter ohne sichtbare Rangfolge

Die Stellwerk-Analyse (Vault `Projects/Stellwerk.md`) hält für AVM fest: Niveau zuordnen ja,
Rangfolge im Material vermeiden. Deshalb drei Aufgaben pro Stunde als **„Auftrag"**,
**„Noch einer"** und **„Remix"**, nicht als Sterne. Der Auftrag ist Pflicht und schaffbar, der
Remix verlangt eigene Ideen. Zu jeder Aufgabe gibt es die **Tipp-Leiter** aus dem
Mentor-Byte-Prompt in vier Stufen zum Aufklappen: Frage → Richtung → Lückengerüst → Lösung mit
Pflicht-Remix.

### 3.5 Übungstypen in der App

Alle ohne H5P, alle so gebaut, dass die Aufgabenstellung übersetzt wird, der Code aber Code
bleibt:

| Typ | Was die SuS tun | Warum |
|---|---|---|
| **Vorhersage** | Code lesen, ins Raster klicken: „Wo steht der Agent danach?" | Mentales Modell der Ausführung; sprachfrei |
| **Sortier-Puzzle** | Zeilen oder Blöcke in die richtige Reihenfolge ziehen | Parsons-Problem, sprachlich die entlastendste Form |
| **Lückencode** | Zahl oder Wort einsetzen | Syntax ohne Tippen |
| **Fehlersuche** | Eine Zeile ist falsch, welche? | Debugging als Alltag |
| **Zuordnung** | Block-Bild zum Python-Text | Der Übergang Blöcke → Python als eigene Übung |

### 3.6 Sprachdidaktik A2 bis B1

- Kurze Sätze, Präsens, ein Gedanke pro Satz, keine Nebensatzketten. Regeln aus dem Kopf der
  Strudel-Sprachdatei übernehmen.
- Deutsch ist immer sichtbar, die Stützsprache klappt darunter auf, nie stattdessen.
- Vorlese-Audio für die deutschen Texte und für die übersetzten Aufgaben.
- **Glossar** mit rund 40 Begriffen in sechs Sprachen (Befehl, Programm, Ereignis, Schleife,
  Variable, Bedingung, Funktion, Parameter, Liste, Fehler, Koordinate, …) mit Tooltips überall
  in der App, nach dem Muster der msa-mathe-Spec.
- Code-Wörter bleiben Englisch. Die App erklärt jedes Code-Wort einmal mehrsprachig, wenn es
  zum ersten Mal auftaucht.
- Arabisch von rechts nach links in App und Moodle.

### 3.7 4K und Bloom

- **Kollaboration:** Pair Programming (Driver/Navigator) in jeder Stunde, Multiplayer-Stadt.
- **Kommunikation:** Boss-Check erklären, Stadtführung, Forum „Fragen an Nour".
- **Kreativität:** Remix-Pflicht in jeder Stunde, freies Projekt.
- **Kritisches Denken:** Vorhersage, Fehlersuche, Debugging im Parcours.
- **Bloom:** mindestens die Hälfte der Aufgaben auf Anwenden oder höher (Regel aus dem
  Lesson-Creator). Bauen ist Anwenden, Remix ist Gestalten, Fehlersuche ist Analysieren,
  Boss-Check-Erklärung ist Verstehen mit Transfer.

## 4. Kursarchitektur (Moodle)

### 4.0 Kursmetadaten

| Feld | Wert |
|---|---|
| Vollname | `{mlang de}Code-Welt: Programmieren mit Minecraft{mlang}` + fünf weitere Blöcke + `{mlang other}` = Deutsch |
| Kurzname | `code-welt` |
| Format | Topics |
| Abschlussverfolgung | an |
| Kurssprache | nicht erzwungen (Profilwahl gilt) |
| Kursbild | Media Factory, Comic-Stil, Agent vor neuer Welt |
| Hinweis im Kursintro | „Kein offizielles Minecraft-Produkt. Nicht von Mojang/Microsoft genehmigt oder mit ihnen verbunden." (Mojang-Markenrichtlinien) |

### 4.1 Abschnitte

| # | Abschnitt | Inhalt |
|---|---|---|
| 0 | Willkommen | Label **„Sprache wählen"** in allen sechs Sprachen untereinander mit Screenshots — das Einzige, was ohne Filter auskommt, weil es vor der Wahl kommt. Story-Intro als eingebettete App-Seite. Forum **„Fragen an Nour"**. Hinweis-Label (Marke). |
| 1 | Lehrkraft (versteckt) | Setup: Lizenzen zuweisen, MakeCode auf Englisch, Welten importieren und hosten, Join-Code. Stundenverläufe pro DS, Lösungen, Ordner mit Weltdateien und Bauskripten, Cheat-Sheets, Troubleshooting. |
| 2 | Holz | Pro DS zwei Aktivitäten: **Station** (Label mit App-iframe) und **Check** (Quiz). Am Ende **Boss-Check** (Aufgabe). |
| 3 | Stein | wie oben |
| 4 | Eisen | wie oben |
| 5 | Gold | wie oben |
| 6 | Diamant | wie oben, vier DS, neun Aktivitäten — Obergrenze ohne Unterabschnitte |
| 7 | Netherite | Station Planen, Station Bauen, Station Fertigstellen; **Gruppenaufgabe** (Share-Link + Screenshot); Forum **„Baustelle"**. |
| 8 | Enderdrache | Präsentationsleitfaden; **Abschluss-Feedback** (mod_feedback, mehrsprachig); **Zertifikat** (customcert). |

Namenskonvention: `DS 7 · Station: Zahlen mit Namen`, `DS 7 · Check`, `Boss-Check Eisen`. Jeder
Name trägt seine `{mlang}`-Blöcke.

### 4.2 Abschluss, Badges, Zertifikat

- **Quizze:** unbegrenzte Versuche, Bestehensgrenze 60 %, Abschluss bei Bestehen.
- **Boss-Check:** Aufgabe mit Online-Text (Share-Link + drei Sätze), Skala „Bestanden / Noch
  nicht", Abschluss bei „Bestanden".
- **Stations-Labels** haben keine Abschlussbedingung; sie zählen nirgends mit. Der Fortschritt
  einer Station lebt in der App (Spielstand), der Nachweis im Quiz.
- **Badge pro Etappe:** Kriterium „alle Checks und der Boss-Check des Abschnitts
  abgeschlossen". Netherite: die Gruppenaufgabe. Enderdrache: das Feedback. Sieben Badges
  (Holz bis Enderdrache) mit eigenen Icons aus der Media Factory, nicht mit Mojang-Texturen.
- **Kursabschluss:** alle Quizze, alle fünf Boss-Checks, die Gruppenaufgabe und das Feedback
  abgeschlossen.
- **Zertifikat:** customcert, ausgelöst durch Kursabschluss. Text fest Deutsch mit englischer
  Unterzeile, weil ein Zertifikat als Dokument eine feste Sprache braucht.

Badges und die Zertifikatvorlage entstehen einmal von Hand in der Box, weil der MCP dafür keine
Werkzeuge hat, und wandern im Backup mit.

### 4.3 Mehrsprachigkeit in Moodle

- **Sprachpakete** de, en, ar, uk, es, it auf Box und Produktion. Die Box hat nur `en`,
  Produktion `de` und `en`.
- **Filter:** `filter_multilang2` (auf Produktion aktiv, in der Box nachinstallieren) und
  `filter_codehighlighter` (Core, auf beiden nur aktivieren) für Code in Quizfragen.
- **Auf Überschriften anwenden:** `$CFG->stringfilters` ist auf beiden Systemen leer, der
  Filter wirkt heute nur auf Inhalte. Nötig ist `filter_set_applies_to_strings('multilang2',
  true)`, damit Abschnitts-, Aktivitäts- und Kursname mitziehen. Das ist eine Site-Einstellung;
  auf Produktion nur zusammen mit Dirk. Erster Test im Fundament.
- **Syntax:** jedes Feld trägt sechs Blöcke und `{mlang other}` mit dem deutschen Text, damit
  eine siebte Sprache nicht ins Leere läuft.
- **Quizfragen** über die Einzelfragen-Werkzeuge (`moodle_add_quiz_question_multichoice` u. a.)
  oder über `moodle_import_questions_xml`, nie über GIFT: der MCP-Server entfernt `{mlang}` beim
  GIFT-Parsen (`mcp-servers/moodle-mcp/src/server.mjs`, `stripMlang`), weil die geschweifte
  Klammer dort Antwortblöcke markiert.
- **iframe-Sprache:** das Stations-Label trägt sechs iframe-Varianten in `{mlang}`-Blöcken,
  jede mit `?lang=xx` in der URL. So kommt die Profilwahl in der App an.
- **Umlaute:** HTML-Entities nur in HTML-Feldern (Label-Inhalt, Seiteninhalt, Fragetext), echte
  Zeichen in Klartextfeldern (Namen). Regel aus `CLAUDE.md`.

### 4.4 Eine Quelle für alles

Die deutschen Inhalte leben als Sprachdatei in der App. Die fünf Übersetzungen werden daraus
generiert. Ein **Bauskript** (`moodle/build-course.mjs` im App-Repo, Muster
`setup_geschichte_course.py`) setzt aus derselben Quelle die Moodle-Texte mit ihren
`{mlang}`-Blöcken zusammen und legt den Kurs über den Box-MCP an: Kurs, Abschnitte, Labels,
Quizze (XML), Aufgaben, Feedback, Foren-Platzhalter. Es führt ein **CMID-Register** wie die
OERcamp-Pläne, damit ein zweiter Lauf aktualisiert statt dupliziert. So bleibt der Kurs aus Git
neu baubar, und Moodle-Quiz und App-Übung sagen in jeder Sprache dasselbe.

### 4.5 Umzug nach Produktion

Moodle-Backup ohne Nutzerdaten aus der Box, Restore auf Produktion in eine passende Kategorie.
Badges und Zertifikatvorlage wandern mit. Vorher auf Produktion: vier Sprachpakete,
Code-Highlighter aktivieren, `stringfilters` setzen. Die iframes zeigen auf
`lernmodule.dirk-schulenburg.net/code-welt/`, das ist von beiden Seiten erreichbar. Nach dem
Restore: Badges prüfen (Kriterien referenzieren Aktivitäts-IDs), Zertifikat testweise ausstellen.

## 5. Lern-App „Code-Welt"

### 5.1 Stack und Ablage

| | |
|---|---|
| Repo | eigenes öffentliches Repo `dSchulenburg/code-welt` (wie `strudel-kurs`) |
| Stack | React/Vite, Hash-Routing (`#/station/7`), keine Server-Konfiguration nötig |
| Lizenz | Inhalte CC BY 4.0, Code MIT |
| Image | Docker Hub `dadalama/code-welt`, Basis-Pfad per `BASE`-Build-Argument |
| Im docker-Repo | `docker-compose-code-welt.yml`, `deploy-code-welt.sh`, Traefik-Regel `PathPrefix(/code-welt)` |
| Live | `lernmodule.dirk-schulenburg.net/code-welt/`, Plausible per nginx `sub_filter` wie die anderen Module |
| Portal | Kachel in `lernmodule/html/index.html` **und** Zähler in den Filter-Tabs (handgepflegt), Eintrag in `website/src/data/lernmodule.json` mit `audience: "AVM / Sprachförderung"` |

### 5.2 Eine Quelle, sechs Sprachen

Fork der Strudel-i18n: `src/i18n/{de,en,uk,ar,es,it}.js` mit identischer Form, `LANGS` mit
Flagge und Label, `RTL = new Set(['ar'])`, `applyDir()` setzt `<html lang dir>`. Deutsch ist
kanonisch. Sprache kommt aus `?lang=` (Moodle-Label) → `localStorage` → Browser → `de`.

Sprachfreie **Strukturdaten** (Stations-IDs, Etappe, Code-Beispiele in Python, Block-Bildpfade,
Lösungen der Übungen, Raster-Definitionen) liegen in `src/data/stations.js`. Übersetzbare Texte
liegen in der Sprachdatei, verschachtelt nach Station: `{ ui, glossary, stations: { s07: {
title, story, storyShort, bridge: { game, code }, tasks: [...], tips: [...] } } }`.

**Übersetzung** per Skript nach dem esa-mathe-Muster (`esa-mathe/scripts/translate-lessons.mjs`):
Anthropic SDK, JSON-Schema-beschränkt, Platzhalter und Code-Wörter bleiben wörtlich, `sourceHash`
der deutschen Quelle in jeder erzeugten Datei, `--force` zum Neubauen, `--lang` zum Einschränken.
Ein Vollständigkeitstest vergleicht jede Sprache gegen die deutsche Schlüsselmenge.

### 5.3 Was übersetzt wird, was nicht

| Übersetzt (Stütze) | Bleibt Deutsch |
|---|---|
| Oberfläche (Buttons, Navigation, Meldungen) | Erklärtexte im Konzept-Teil |
| Aufgabenstellungen (Auftrag, Noch einer, Remix) | Tipp-Leiter Stufen 1 bis 3 |
| Konzept-Brücke (zwei Zeilen) | Dialoge von Nour und Dani in voller Länge |
| Story-Kurzfassung (zwei Sätze pro Panel) | Spielstand-Fragen bleiben deutsch, Antwort in jeder Sprache erlaubt |
| Glossar | |
| Quizfragen (in Moodle) | |
| Tipp-Leiter Stufe 4 (Lösung mit Remix) | |

Wer Ukrainisch gewählt hat, sieht deutschen Text mit ukrainischer Aufgabe und Brücke darunter,
nicht eine ukrainische Kopie der Seite.

### 5.4 Bausteine

| Komponente | Zweck |
|---|---|
| `StoryPanel` | Charakterbild, Sprechblase, Audio-Button, Stütz-Kurzfassung aufklappbar |
| `ConceptCard` | Brücke „Im Spiel ↔ Im Code", Block-Bild und Python nebeneinander |
| `CodeView` | Python mit leichtem Highlighting (Prism, nur Python-Grammatik) |
| `AgentGrid` | animierter Agent auf einem Raster; zugleich die Vorhersage-Übung |
| `ParsonsPuzzle` | Sortier-Puzzle, Drag & Drop mit Tastatur-Alternative |
| `FillCode` | Lückencode |
| `FindBug` | Fehlersuche |
| `MatchBlocksPython` | Zuordnung |
| `TipLadder` | vier Stufen, jede Stufe einzeln aufklappbar, Stufe 4 mit Remix-Pflicht |
| `Glossary` | Tooltip und eigene Seite, sechs Sprachen |
| `TaskCard` | Auftrag / Noch einer / Remix mit Häkchen |
| `Spielstand` | drei Sätze, Fortschritt pro Etappe, `localStorage` |
| `LangSwitcher` | Stützsprache wechseln, RTL |

Block-Bilder: Screenshots aus dem Browser-Editor `minecraft.makecode.com`, Editor auf Englisch,
einmal für alle Sprachen, geschätzt 50 Stück. Eine Automatisierung per Playwright ist P2.

### 5.5 Medien über die Media Factory

| Asset | Generator | Umfang |
|---|---|---|
| Nour, Dani | KI-Bild, Comic-Stil, fünf Posen, konsistente Charakter-Sheets | 10 Bilder |
| Badge-Icons | KI-Bild oder SVG, sieben Werkzeugstufen | 7 |
| Kursbild, Etappen-Banner | KI-Bild | 8 |
| Audio Deutsch | ElevenLabs (Production-Default) | ≈ 40.000 Zeichen |
| Audio Arabisch, Ukrainisch | ElevenLabs Multilingual | ≈ 36.000 Zeichen |
| Audio Englisch, Spanisch, Italienisch | Kokoro (eigener Server, kostenlos) | ≈ 54.000 Zeichen |

ElevenLabs gesamt rund 80.000 Zeichen, das passt in einen Creator-Monat. Kosten für Bilder
werden vor dem Lauf angezeigt und bestätigt, wie die Media Factory es vorschreibt.

### 5.6 Tests

- **Vitest:** Sprachdateien vollständig gegen Deutsch; Übungslogik (Parsons-Prüfung,
  Raster-Vorhersage, Lückencode-Vergleich mit Normalisierung); `applyDir` für `ar`.
- **Playwright-Smoke:** jede Station rendert in sechs Sprachen ohne Konsolenfehler, Arabisch setzt
  `dir="rtl"`, Sprache aus `?lang=` gewinnt über `localStorage`.
- **Build-Check:** `BASE`-Argument erzeugt korrekte Asset-Pfade unter `/code-welt/`.

## 6. Minecraft Education

### 6.1 Verifizierter Stand September 2026

Quelle: Firecrawl-Recherche vom 02.09.2026 (Support-Artikel, MakeCode-Blog, Microsoft Learn).

- Code Builder bietet **nur noch MakeCode** mit Blöcken, JavaScript und Python. Tynker und
  Python Notebooks sind entfernt (Change Log v1.21.90 bis v1.21.133).
- Programme lassen sich per **Umschalter** zwischen Blöcken und Python wandeln; nicht
  Konvertierbares erscheint als grauer Block.
- Kein Auto-Run mehr: Code läuft erst nach Play. Code Builder öffnet mit Taste `C`.
- **Windows nur 64-bit.** `.mkcd`-Dateien speichern und laden geht nur auf Windows, sonst nur
  Share-Link.
- **Spiel-Oberfläche:** Deutsch, Englisch, Ukrainisch, Spanisch, Italienisch vorhanden.
  **Arabisch fehlt.** Der MakeCode-Editor kennt Arabisch, Vollständigkeit der Blocknamen nicht
  verifiziert — irrelevant, weil der Editor auf Englisch läuft (Entscheidung 4).
- **Login** mit dem M365-Schulkonto (`@bs05.hibb.hamburg`). Lizenz in A3/A5 enthalten,
  Minecraft-Toggle im Lizenzpaket, alternativ Auto-Claim-Policy. Zuweisung durch Dirk als Admin.
- **Multiplayer:** Beitritt per Bild-Join-Code, gleicher Tenant Pflicht, gleiches Netz nicht.
  P2P, Host muss im Spiel bleiben, hartes Limit 40, realistisch 8 bis 10 auf Schulhardware.
  **Neu 2026: Dedicated Server**, Global Admin schaltet das Feature im Tenant frei.
- **Abgabe:** Share → Publish → Link. Anonymer Snapshot, jeder Link ist kopier- und editierbar.
- **Fertige Welten:** Hour-of-Code-Welten in DE, ES, IT, UK mit Blöcken oder Python; Coding
  Fundamentals (18 Lektionen, Blöcke, Alter 8 bis 10); Python 101 (10 Lektionen, 11 bis 18+).

### 6.2 Welten

| Etappe | Welt | Wer baut |
|---|---|---|
| Holz, Stein | `codewelt-ankunft`: Flachwelt, Startzone mit Agent-Platz, Schilder mit Stationsnummern, Beispielbauten als Vorbild | Dirk nach Bauplan |
| Eisen | dieselbe Welt, Erkundungsgebiet mit Fluss und Schlucht für Brücke und Plattform | Dirk nach Bauplan |
| Gold | `codewelt-parcours`: Hindernisparcours mit Wasser, Lava, Löchern, Wänden | **MakeCode-Bauskript** setzt den Parcours in eine Flachwelt, Schilder von Hand |
| Diamant | `codewelt-dorf`: Flachwelt mit markiertem Bauplatz | Bauskript |
| Netherite, Enderdrache | `codewelt-stadt`: Stadtraster mit nummerierten Vierteln, Straßenraster, Startplattform | Bauskript, dann Multiplayer |

Die Bauskripte sind selbst Kursmaterial: Python-Programme, die die Lehrkraft einmal ausführt.
Die Weltdateien liegen im Lehrkraft-Ordner; SuS importieren per Doppelklick. Die
Hour-of-Code-Welten werden als freiwillige Zusatzstationen verlinkt, nicht eingebaut.

Claude baut keine Welten. Was der Plan liefert: Baupläne mit Koordinaten und Schildertexten, die
Bauskripte, die Import-Anleitung.

### 6.3 Multiplayer für die Stadt

Zwei Optionen, Entscheidung vor Etappe Netherite:

1. **Zwei Hosts:** Lehrkraft und Kolleg:in hosten je eine Hälfte der Klasse. Zwei Städte,
   zwei Stadtführungen. Kein Admin-Aufwand.
2. **Dedicated Server:** Dirk aktiviert das Feature im Tenant, ein Server auf einem Schul-PC
   oder VPS. Eine Stadt, persistente Welt, Host muss nicht im Spiel bleiben.

Option 2 ist schöner, Option 1 ist der Fallback und wird im Lehrkraft-Abschnitt beschrieben.

### 6.4 Setup-Checkliste (Lehrkraft-Abschnitt)

Lizenzen zugewiesen · Minecraft Education installiert (64-bit) · Login mit Schulkonto getestet ·
MakeCode-Editor auf Englisch · Weltdateien importiert · Join-Code-Ablauf einmal geprobt · Firewall
`*.minecrafteduservices.com` · `Smart Punctuation` ist nur ein iPad-Problem, entfällt.

## 7. Box-Vorbereitung und Produktion

Skript `ki-kurs-box/prepare-code-welt.sh`, damit die Vorbereitung nach jedem Neuaufsetzen der Box
wiederholbar ist:

1. `filter_multilang2` und `mod_customcert` per `git clone` in die Volumes
   (`/var/www/html/filter/multilang2`, `/var/www/html/mod/customcert`), Branch passend zu 5.0.
2. `admin/cli/upgrade.php --non-interactive`.
3. Filter aktivieren: `multilang2` und `codehighlighter` (Box hat nur Core-`multilang`, das bleibt
   aus).
4. `filter_set_applies_to_strings('multilang2', true)`.
5. Sprachpakete per `php -r` über `\tool_langimport\controller::install_languagepacks()` für
   de, en, ar, uk, es, it; Standardsprache `de`. (Es gibt kein Langimport-CLI in 5.0, der
   Controller ist der Weg.)
6. `purge_caches.php`.
7. Test: Abschnittsname mit `{mlang}` anlegen, Profil auf `uk` stellen, Kursseite lesen.

Produktion braucht davon Schritt 3 (nur Code-Highlighter), 4, 5 (vier Pakete) und 6. Das läuft
mit Dirk, weil `stringfilters` eine Site-Einstellung ist. Erwartete Nebenwirkung: keine, kein
bestehender Kurs nutzt `{mlang}`; multilang2 prüft per `strpos` vor dem Regex.

## 8. Qualitäts-Gate

| Prüfung | Werkzeug | Bestehen |
|---|---|---|
| 4K, Story, Gamification pro Etappe | `moodle-section-analyzer` | grün in allen sechs Dimensionen |
| Sprachzugänglichkeit | händisch, weil der Analyzer keine Sprachdimension hat | Deutsch immer sichtbar, Stütze vorhanden, Audio spielt, RTL korrekt |
| Übungsqualität | `exercise-quality-analyzer` (Story-Anker, Visuell, Tiefgrad, Aktivitätsform, Fehler-Pädagogik) | keine Übung unter 3/5 in einem Kriterium |
| A2/B1-Regeln der deutschen Texte | Skript: Satzlänge ≤ 12 Wörter im Median, keine Nebensatzketten, Wortliste | Bericht pro Station; Stichprobe durch DaZ-Kolleg:in |
| Bloom | händisch pro Etappe | ≥ 50 % Anwenden oder höher |
| App-Smoke | Playwright, sechs Sprachen × 20 Stationen | grün |
| Kurs-Smoke | Box: jede Aktivität öffnet, jedes Quiz hat `quiz_sections`, jedes Label lädt sein iframe | grün |
| Probelauf | Dirk spielt Holz komplett in der Box, bevor die Übersetzung anläuft | Befunde eingearbeitet |

Follow-up außerhalb dieses Vorhabens: dem Section-Analyzer eine siebte Dimension
„Sprachzugänglichkeit" geben.

## 9. Wiederverwendetes Material

| Quelle | Was übernommen wird |
|---|---|
| `strudel-kurs` | i18n-Registry, `LANGS`/`RTL`/`applyDir`, Kapitelschema mit `bridge`, Sprachregeln im Dateikopf, Deploy-Kette (Docker Hub, `BASE`-Arg, Compose, Deploy-Skript) |
| `esa-mathe/scripts/translate-lessons.mjs` | Übersetzungsskript mit `sourceHash`, JSON-Schema, DaZ-Locale-Preset |
| `docs/superpowers/specs/2026-03-31-msa-mathe-design.md` | Glossar-Muster, RTL-Abschnitt, Persona-Ton |
| `docs/superpowers/specs/2026-03-25-geschichte-payback-design.md` | Charakter-Sheets mit festen Posen, Erzähler-Panel |
| `claude-memory/projects/semi-coding-mentor-byte.md` | Tipp-Leiter, Boss-Check, Spielstand-Block, Werkzeugstufen |
| `setup_geschichte_course.py` | MCP-RPC-Bauskript mit Retry |
| `docs/plans/2026-08-15-oercamp-kurs-*.md` | CMID-Register, Reihenfolge Kategorie → Kurs → Abschnitte → Abschluss |
| Skill `media-factory` | Charaktere, Badges, Kursbild, Audio |
| Skill `moodle-section-analyzer` / `-optimizer` | Story-Muster D+E, Fortschritts- und Badge-Bausteine für Etappen-Labels, Qualitäts-Gate |
| Skill `exercise-quality-analyzer` | Übungs-QA |
| Skill `lesson-creator` | Bloom-Regel, Schritt „Narrativer Rahmen", Stundenverlaufs-Format für den Lehrkraft-Abschnitt |
| Skill `lernfeld-zu-moodle-kurs` / `moodle-course-workflow` | Abschnittslayout, Entity-Regel, `quiz_sections`-Pflicht, max. Aktivitäten pro Abschnitt |
| Skill `bswi-docs` | Cheat-Sheets pro Etappe, DaZ-geeignet, Blöcke und Python nebeneinander |
| Pinnwand | Planungsboard in DS 17 (optional, Pinnwand-MCP) |
| `ki-kurs-box` | Bau- und Testumgebung, Box-MCP `moodle-box` |

Nicht genutzt: `h5p-generator`, `h5p-quiz-to-moodle` (Entscheidung 11).

## 10. Reihenfolge des Bauens

Der Plan leitet daraus Tasks ab. Zum Kursstart müssen **Holz und Stein in allen sechs Sprachen
fertig** sein; spätere Etappen dürfen im Kursverlauf mit zwei Etappen Vorsprung nachziehen.

| Phase | Ergebnis | Warum in dieser Reihenfolge |
|---|---|---|
| 1 Fundament | Spec committed; Box-Skript läuft; App-Gerüst mit i18n, Routing, `LangSwitcher`; **eine Station (DS 2) komplett** von Story bis Moodle-Quiz in sechs Sprachen; Bauskript legt sie an. DS 2 statt DS 1, weil sie als erste Konzept, Raster-Übung und Quiz vollständig hat, DS 1 ist Setup | Beweist Multilang auf Überschriften, iframe-Sprache und XML-Import, bevor Inhalt entsteht |
| 2 Holz + Stein | Sechs Stationen deutsch, Charaktere, Welt `ankunft`, Quizze, Boss-Checks, zwei Badges; Dirks Probelauf | Erste Etappen sind zum Start Pflicht |
| 3 Eisen + Gold | Sechs Stationen, Python-Blick und -Lesen, Parcours-Bauskript | Python-Übergang früh testen |
| 4 Diamant + Netherite + Enderdrache | Acht Stationen, Projekt-Aufgabe, Foren, Feedback, Badges 5 bis 7, Zertifikat | Abschluss-Mechanik vollständig |
| 5 Übersetzung + Audio | Fünf Sprachen für alle Stationen, Audio, Glossar, RTL-Test, Cheat-Sheets | Erst übersetzen, wenn Deutsch steht |
| 6 Gate + Umzug | Qualitäts-Gate, Lehrkraft-Abschnitt, Backup/Restore, Produktion vorbereiten, Portal-Kachel, Registry | Live |

## 11. Risiken und offene Punkte

| Risiko | Gegenmaßnahme |
|---|---|
| Multilang wirkt auf Produktion nicht auf Namen | `stringfilters` setzen (Abschnitt 7); Fallback: Namen kurz zweisprachig DE/EN, Rest mehrsprachig |
| Arabisch nicht im Spiel | Arabischsprachige spielen auf Deutsch oder Englisch; App und Moodle fangen es auf; im Kursintro ehrlich benennen |
| Schulhardware zu schwach für Multiplayer | Einzelwelten bis Diamant; Stadt in zwei Hälften oder Dedicated Server |
| Lizenz-Toggle nicht gesetzt, Login scheitert in DS 1 | Setup-Checkliste, Dirk prüft eine Woche vor Start mit einem Schülerkonto |
| MakeCode-Python-API-Namen aus dem Gedächtnis falsch | Jedes Beispiel im Browser-Editor ausführen, bevor es in die App kommt |
| Übersetzungsqualität Arabisch/Ukrainisch auf A2-Niveau | Stichprobe durch Muttersprachler:innen im Kollegium oder in der Klasse selbst (Kommunikation als 4K-Element) |
| Markenrecht Minecraft | Hinweis im Kursintro, keine Mojang-Texturen, Kursname beginnt nicht mit „Minecraft" |
| Zeit bis November | Puffer-Regel: Holz und Stein zum Start, Rest zieht nach |
| customcert-Text mit `{mlang}` ungetestet | Zertifikat fest DE/EN (Entscheidung in 4.2) |
| Kolleg:innen ohne Minecraft-Erfahrung | Lehrkraft-Abschnitt mit Setup-Video (Remotion, P2) und Stundenverläufen |

Offen, im Plan zu klären: Kategorie auf Produktion; ob DS 17 die Pinnwand oder Papier nutzt;
Name der Klasse(n) für den Probelauf.

## 12. Nicht-Ziele

- Kein H5P, keine JavaScript-Spur, kein eigener Minecraft-Server-Mod.
- Kein Arabisch in der Spiel-Oberfläche (technisch nicht möglich).
- Kein Anschluss ans Schüler-Dashboard in dieser Runde.
- Keine Noten über den Boss-Check hinaus.
- Kein Import nach `lms.lernen.hamburg` in dieser Runde (Task `72w` hängt; multilang2 dort
  unbekannt).
- Keine automatische Block-Screenshot-Erzeugung (P2).
- Keine eigenen Welten für Hour-of-Code-Inhalte; die werden nur verlinkt.

## 13. Definition of Done

- Kurs auf Produktion, 20 Stationen in der App, 20 Quizze, 5 Boss-Checks, 7 Badges,
  Projekt-Aufgabe, Feedback, Zertifikat, versteckter Lehrkraft-Abschnitt.
- Alle Moodle-Texte und alle Stütz-Texte in sechs Sprachen; Profilwechsel auf `uk` und `ar`
  zeigt Namen, Labels, Quizfragen und App in der Sprache, Arabisch rechts-nach-links.
- Weltdateien und Bauskripte für alle Etappen im Lehrkraft-Ordner, Import-Anleitung getestet.
- Qualitäts-Gate aus Abschnitt 8 vollständig grün, Probelauf Holz durch Dirk eingearbeitet.
- App live unter `/code-welt/`, Portal-Kachel und Registry-Eintrag, Plausible zählt.
- Bauskript legt den Kurs in einer frischen Box in einem Lauf an; zweiter Lauf dupliziert nichts.
- Box-Vorbereitungsskript im Repo, einmal von Null durchgelaufen.
