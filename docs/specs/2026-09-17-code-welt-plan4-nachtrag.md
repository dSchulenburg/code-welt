# Code-Welt — Spec-Nachtrag für Plan 4 (Gold)

**Stand:** 17.09.2026 · **Status:** mit Dirk abgestimmt (Brainstorming 17.09.2026) · **Ergänzt:** `2026-09-02-code-welt-minecraft-kurs-design.md` (Hauptspec), `2026-09-03-code-welt-plan2-nachtrag.md` und `2026-09-04-code-welt-plan3-nachtrag.md` (Entscheidungen 1–22 gelten weiter)

> Plan 3 (Eisen) ist abgeschlossen und gepusht (`9ce29e7..ada8b88`). Dieser Nachtrag entscheidet,
> was die Hauptspec für die Etappe Gold offen lässt, und legt den Bogen der drei Doppelstunden
> fest. Die Hauptspec bleibt die Autorität für alles andere; bei Widerspruch gilt dieser Nachtrag,
> danach der Plan-3-Nachtrag, danach der Plan-2-Nachtrag.
>
> Achsen (seit der Korrektur vom 16.09.2026 verbindlich): **+z ist Süden, −z Norden, +x Osten,
> −x Westen.** Wer nach Süden schaut, hat Osten links und Westen rechts. `pos(...)` hängt an den
> Weltachsen, nicht an der Blickrichtung.

## 1. Entscheidungen

| # | Frage | Entscheidung | Begründung |
|---|---|---|---|
| 23 | Umfang | **Gold, DS 10–12.** Diamant bleibt ein eigener Plan. | Regel „zwei Etappen Vorsprung": Gold muss Ende November stehen. Gold bringt einen neuen Übungstyp, eine neue Welt-Bahn und die Bedingungs-Blöcke — genug für einen Plan |
| 24 | Welt | **Parcours in der Welt `ankunft`**, südlich der Klippen (ab z=56), gebaut durch einen **dritten Chat-Befehl `parcours`** im Bauskript `welt-ankunft-bau.py`, additiv wie `erkunden`. Die Hauptspec (§6.2) sah eine eigene Welt `codewelt-parcours` vor. | Ein Import für Holz bis Gold; das Muster `erkunden` ist erprobt. Dirks Wahl im Brainstorming |
| 25 | Bogen | **DS 10 „Wenn, dann": der Agent biegt an der Wand ab** (Hauptspec: „stoppt vor der Wand"). **DS 11 „Sonst": der Agent pflastert Löcher zu** (Hauptspec: „Brücke nur über Wasser"). DS 12 „Solange" wie Hauptspec. | Stoppen ist nicht sichtbar: `agent.move` in einen Block scheitert ohnehin lautlos. Abbiegen macht die Bedingung sichtbar. Löcher sind Luft; ob `agent.detect` Wasser als Block zählt, sagt die Referenz nicht — mit Luft funktioniert das Programm unabhängig von dieser Antwort |
| 26 | Modus „Python ändern" in der App | **Neuer Übungstyp Tipp-Lücke (`TypeGap`)**: Code mit Lücke `___`, Eingabefeld statt Chips. Leerzeichen werden vor dem Vergleich entfernt. Falsche Groß-/Kleinschreibung ist **nicht richtig**, bekommt aber eine eigene Rückmeldung („Fast. Python unterscheidet groß und klein."). | Erster echter Tipp-Schritt vor Diamant („Python schreiben"). MakeCode meldet `redstone` statt `REDSTONE` als Fehler; die App soll das nicht durchwinken, aber den Grund nennen. Dirks Wahl im Brainstorming |
| 27 | Block-Ansicht | **Bedingungen als Sechseck-Blöcke** im Slot von `if`/`while` (statt Text), **`not`** als Logik-Pille, **`else`** als zweiter Mund von `if`. Programme, die `index` nicht benutzen, erscheinen als **`repeat n`** (wie `bruecke` in s07). **Breite Blöcke stapeln** in der Hauptansicht Block über Python. | So rendert MakeCode. Das Stapeln löst den in Plan 3 geparkten Befund (Hauptansicht quetscht lange `fill`-Blöcke in s08/s09); `while not agent detect block forward` ist noch breiter |
| 28 | Welt und Programme gegenseitig absichern | **Simulator-Test:** Die Bahnen stehen als Daten mit ausdrücklicher Achsenregel; ein Interpreter führt die **Block-Beschreibungen aus `STATIONS`** darauf aus und prüft Endposition und gefüllte Felder. Ein zweiter Test gleicht die `world(...)`-Aufrufe des Befehls `parcours` im Python-Skript mit den Bahndaten ab. **Alle Zahlen, die von der Bahn abhängen** (Durchläufe in s10, richtige Zahl der Tipp-Lücke in s11), **berechnet der Simulator**. | Der Achsenfehler aus Plan 3 stand nur in Worten, kein Test konnte ihn sehen. Durchläufe über Goldmarke, Löcher und Wandstoß im Kopf zu zählen ist fehleranfällig |
| 29 | Boss-Check Gold | **„Der unbekannte Parcours":** Bahn mit Löchern, das Ziel ist ein Redstone-Block im Boden, dahinter geht die Bahn weiter bis zu einer Sicherheitswand. Das Programm `ziel` läuft am Redstone vorbei; die Lernenden ändern die Bedingung in Python. **Aufgabe mit Online-Text** wie Holz bis Eisen; Titel „Boss-Check Gold", Untertitel fett im Intro. Badge-Kriterium: drei Quizze + Boss-Check. | Modus „Bedingung in Python ändern" (Hauptspec DS 12). Die Sicherheitswand macht das Scheitern sichtbar und verhindert, dass der Agent in die Flachwelt davonläuft |
| 30 | Übersetzung | **Pro Etappe im Plan, Deckel 3 USD**, Chunk-Cache, Kostenanzeige vor jedem Lauf. Zauberwörter + `ecke`, `loecher`, `ziel`. Bezeichner-Kanon + `if`, `else`, `while`, `not`, `detect`. Vier Glossar-Einträge: Bedingung, Verzweigung, Solange-Schleife, detect. | Plan 3 kostete 1,81 USD für drei Stationen samt Nachlauf. `ziel` hat dieselbe Falle wie `weg`: Das Zauberwort bleibt klein und unübersetzt, das Nomen „Ziel" wird übersetzt (Prompt-Regel 1 deckt das) |
| 31 | Prüfung im Editor und im Spiel | **Offener DoD-Punkt für Dirk, keine Vorbedingung der Übersetzung.** Ergibt die Prüfung Änderungen, wird die betroffene Station mit Chunk-Cache nachübersetzt. | Lehre aus Plan 3: „vor dem Übersetzen" stand in der Spec, war aber im Ablauf nicht einzuhalten und wurde erst im Gesamtreview als offener Punkt benannt |
| 32 | Charaktere | **Keine neuen Posen.** | wie Entscheidung 22 |

## 2. Der Bogen der Etappe Gold

Hinter den Klippen liegt der Parcours. Dani will durch, aber niemand weiß, wo die Wand kommt und
wo ein Loch ist. Nours Satz für die Etappe: „Du weißt nicht, was kommt. Der Agent kann
nachsehen." Roter Faden: **Der Agent schaut, bevor er handelt.**

| DS | Titel | Problem im Spiel | Neue Idee | Programm | Sichtbar | Übungen |
|---|---|---|---|---|---|---|
| 10 | Wenn, dann | Ein Gang knickt ab, aber wo, sieht man erst dort. `forward 10` läuft gegen die Wand. | `if agent.detect(AgentDetection.BLOCK, FORWARD)`: dann drehen. Die Bedingung ist wahr oder falsch. | `ecke` | Der Agent findet um die Ecke zur Goldmarke | Zuordnung, Lückencode (Chips) |
| 11 | Sonst | Ein Weg mit Löchern. Über Boden soll der Agent gehen, über einem Loch einen Block legen. | `if … else`: genau einer der beiden Wege läuft. Jedes Loch kostet einen Durchlauf mehr. | `loecher` | Der Agent pflastert die Löcher zu, man läuft hinterher | **Tipp-Lücke** (Zahl), Fehlersuche |
| 12 | Solange | Wie viele Durchläufe braucht eine lange Bahn? Zählen ist mühsam. | `while not …`: laufen, solange keine Wand vorn ist. `not` dreht die Bedingung um. | `ziel` | Der Parcours ist geschafft | **Tipp-Lücke** (Bedingung), Fehlersuche |

**Modus:** DS 10 „Blöcke bauen, Python lesen"; DS 11 „eine Zahl in Python ändern": die Station
zeigt `loecher` mit der Durchlaufzahl **10** (= Felder der Bahn, der naheliegende Fehlschluss),
der Auftrag lautet, die Zahl in Python so zu ändern, dass der Agent bis zur Wand kommt; DS 12
„Bedingung in Python ändern" im Boss-Check.

**Python-Entwürfe** (Signaturen nach `minecraft.makecode.com/reference/agent/detect`; Gegenprüfung
im Editor durch Dirk, Abschnitt 5):

```python
# DS 10 — ecke
def on_ecke():
    agent.teleport_to_player()
    for index in range(20):
        if agent.detect(AgentDetection.BLOCK, FORWARD):
            agent.turn(LEFT_TURN)
        agent.move(FORWARD, 1)
player.on_chat("ecke", on_ecke)

# DS 11 — loecher
def on_loecher():
    agent.teleport_to_player()
    agent.set_item(PLANKS_OAK, 64, 1)
    for index in range(10):
        if agent.detect(AgentDetection.BLOCK, DOWN):
            agent.move(FORWARD, 1)
        else:
            agent.place(DOWN)
player.on_chat("loecher", on_loecher)

# DS 12 — ziel
def on_ziel():
    agent.teleport_to_player()
    agent.set_item(PLANKS_OAK, 64, 1)
    while not agent.detect(AgentDetection.BLOCK, FORWARD):
        if agent.detect(AgentDetection.BLOCK, DOWN):
            agent.move(FORWARD, 1)
        else:
            agent.place(DOWN)
player.on_chat("ziel", on_ziel)
```

`range(20)` in `ecke` ist gesetzt; die Schenkel der Bahn „Ecke" werden so bemessen, dass der
Agent nach 20 Durchläufen über der Goldmarke am Ende steht (Simulator, Entscheidung 28). Die
richtige Zahl für `loecher` auf der Bahn „Löcher" liefert ebenfalls der Simulator.

**Boss-Check Gold — „Der unbekannte Parcours":** Stell dich auf die Goldmarke der Boss-Bahn und
lass `ziel` laufen. Der Agent läuft am Redstone vorbei. Ändere die Bedingung in Python, bis er
auf dem Redstone stehen bleibt. Erwartete Änderung:
`while not agent.detect(AgentDetection.REDSTONE, DOWN):`. Schreib drei Sätze: Was prüft deine
Bedingung? Warum lief das alte Programm vorbei? Was passiert, wenn kein Redstone kommt?

## 3. Datenmodell-Ergänzungen

- `ETAPPEN[gold].stations = ['s10', 's11', 's12']`. Bauskript und Postbuild legen daraus
  Abschnitt 5 „Gold" mit Labels, Quizzen und Badge an (bereits aus `ETAPPEN` abgeleitet).
- `STATIONS.s10–s12`: `etappe`, `ds`, `iframeHeight` (gemessen), `python`, `blocks`, `exercises`;
  `s12.bossCheck = { key: 'boss-gold', gradeMax }`.
- Block-Beschreibung:
  - Bedingung: `{ kind: 'agent.detect', what: 'block' | 'redstone', dir: 'forward' | 'down' }`
    oder `{ not: <Bedingung> }`.
  - `{ kind: 'if', cond: <Bedingung>, body: [...], elseBody: [...] }` (`elseBody` optional).
  - `{ kind: 'while', cond: <Bedingung>, body: [...] }`.
  - Die Slot-Art `cond` von `if`/`while` wird von `text` auf eine Bedingungs-Art umgestellt;
    `BlockView` rendert die Bedingung als Sechseck, `not` in der Logik-Farbe.
  - Hauptansicht: Ist der Block breiter als die halbe Spalte, stehen Block und Python
    untereinander. Der 750-px-Check im App-Smoke bleibt die Wache gegen seitlichen Überlauf.
- Übungen (sprachfrei, in `STATIONS[id].exercises`):
  - Neu `{ type: 'type', code: '    for index in range(___):', gaps: [{ accept: ['<Simulator>'], hint: 'number' }] }`.
    `accept` ist eine Liste (mehrere richtige Schreibweisen möglich), `hint: 'number'` setzt
    `inputmode="numeric"`. Das Eingabefeld ist immer `dir="ltr"`, `spellcheck=false`,
    `autocapitalize="off"`, `autocomplete="off"`.
  - Prüflogik als reine Funktion in `src/lib/` (ohne React testbar): je Lücke `'right'`,
    `'case'` (stimmt bis auf Groß-/Kleinschreibung) oder `'wrong'`; gesamt richtig nur, wenn alle
    Lücken `'right'` sind; sonst „Fast", wenn keine `'wrong'` ist; sonst „Noch nicht".
  - Stationen: s10 `match` + `fill`; s11 `type` (Zahl) + `findbug` (`place` im falschen Zweig);
    s12 `type` (`AgentDetection.___, ___` → `REDSTONE`, `DOWN`) + `findbug` (`not` fehlt: der
    Agent läuft nicht los).
- UI-Strings (deutsch, Plan-2-Entscheidung 2): `typePrompt`, `typeRight`, `typeWrong`, `typeCase`.
- Konsistenztest (`tests/blocks-consistency.test.js`): `KIND_TO_PY` lernt `if` (→ `if `),
  `while` (→ `while `) und die Zeile `else:` auf der Tiefe ihres `if`.
- Simulator (Entscheidung 28):
  - Bahndaten `scripts/minecraft/parcours.json`: je Bahn Startmarke, Blickrichtung und Felder
    (Boden, Loch, Wand, Redstone, Goldmarke) in Weltkoordinaten.
  - Interpreter `scripts/minecraft/parcours-sim.mjs`: führt eine Block-Beschreibung aus
    (`setVar`, `repeat`, `for`, `if`/`else`, `while` mit Obergrenze gegen Endlosschleifen,
    `agent.teleportToPlayer`, `agent.move`, `agent.turn`, `agent.place`, `agent.detect`).
    Achsenregel ausdrücklich im Code: +z Süden, `LEFT_TURN` von Süden nach Osten.
  - `tests/parcours-sim.test.js`: `ecke`, `loecher` (mit Stationszahl 10: kommt nicht an; mit
    Simulatorzahl: kommt an), `ziel`, Boss vor der Änderung (endet an der Sicherheitswand) und
    nach der Änderung (endet auf dem Redstone). Der Test benutzt die `blocks` aus `STATIONS`,
    nicht eine Kopie.
  - `tests/parcours-script.test.js`: die `world(...)`-Aufrufe in `on_parcours` des Python-Skripts
    stimmen mit `parcours.json` überein.
- `content/de.js`: `stations.s10–s12` mit `story` (jede Zeile mit `mood`), `concept`, `tips`.
- `i18n/de.js`: `stations.s10–s12` (Titel, `storyShort`, `bridge`, `tasks`, `tipSolution`,
  `exercises`, `quiz`, bei s12 `bossCheck`), `etappen.gold.badge`, `glossary` + `bedingung`,
  `verzweigung`, `solange`, `detect`.
- `scripts/translate.mjs` und `tests/i18n-complete.test.js`: `MAGIC_WORDS` + `ecke`, `loecher`,
  `ziel`; `IDENT_CANON` + `if`, `else`, `while`, `not`, `detect`.
- `content/lehrkraft/`: `ds10.md`, `ds11.md`, `ds12.md`; `01-welt-ankunft.md` Abschnitt
  „Parcours" (Tabelle wie „Erkundungsgebiet": Quader, Material, Goldmarke, Schildtext,
  Schildposition); `docs/lehrkraft-probelauf.md` Abschnitt Gold.
- `scripts/minecraft/welt-ankunft-bau.py`: Chat-Befehl `parcours`, Bodenhöhe über
  `GROUND_TOP`.
- `src/assets/badges/gold.svg` (200×200, flach, Goldbarren, kein Text).
- Smokes: `scripts/smoke.mjs` über alle Stationen inklusive der neuen Übung (`.exercise-type`);
  `moodle/smoke-box.mjs` prüft Abschnitt 5 und Badge Gold; `moodle/smoke-learner.mjs`
  mit `--etappe gold`.

## 4. Welt: Parcours

Vier Bahnen nebeneinander in x-Richtung, ab z=56 südlich der Klippen, Boden auf `GROUND_TOP = 4`.
Jede Bahn beginnt an einer Goldmarke (bündig y=4), Blick nach Süden. Die genauen Quader legt der
Plan fest; der Simulator-Test bindet sie an die Programme.

| Bahn | Maße | Material | Ende | Für |
|---|---|---|---|---|
| Ecke | Gang 1 breit, zwei Schenkel (Süden, dann Osten), Länge nach Simulator für `range(20)` | Wände Stein, 2 hoch (y 5–6) | Goldmarke unter dem letzten Feld, Wand dahinter | DS 10 |
| Löcher | 10 Felder, 4 Löcher je 2 tief (y 3–4 Luft), Seitenwände 2 hoch | Wände Stein | Wand | DS 11 |
| Ziel | 20 Felder, 6 Löcher je 2 tief, Seitenwände 2 hoch | Wände Stein | Wand | DS 12 |
| Boss | Felder mit Löchern, **kein Schild mit Zahlen**; ein Redstone-Block bündig im Boden, danach 10 Felder bis zur Sicherheitswand | Wände Stein, Redstone-Block | Redstone (Ziel), Sicherheitswand | Boss-Check |

Abstand zwischen den Bahnen mindestens 4 Blöcke. Der Befehl `parcours` setzt Wände, Löcher und
Redstone mit `blocks.fill(...)` und `world(...)`; Schilder und Goldmarken setzt Dirk von Hand
(Texte im Bauplan). Schildtexte nennen die Blickrichtung „nach Süden".

## 5. Im Editor und im Spiel zu prüfen (Dirk, offener DoD-Punkt)

1. `agent.detect(AgentDetection.BLOCK, …)`: Zählen Wasser, Lava und Luft als Block?
2. Fällt der Agent, wenn er über ein Loch läuft, oder schwebt er?
3. Füllt `agent.place(DOWN)` ein Luftloch (Plan 3 prüft den Fall über Wasser)?
4. `AgentDetection.REDSTONE`: erkennt es einen Redstone-Block oder nur Redstone-Staub? Falls nur
   Staub, wird das Ziel der Boss-Bahn neu entschieden (Bahndaten, Simulator, Boss-Text).
5. Schaut der Agent nach `agent.teleport_to_player()` in die Blickrichtung der Person? Dreht
   `LEFT_TURN` bei Blick nach Süden nach Osten?
6. Wie wandelt der Editor `if … else` und `while not …` zwischen Blöcken und Python? Zeigt er
   `for index in range(20)` mit ungenutztem `index` als `repeat 20`?
7. Wie stoppt man ein endlos laufendes `while` im Code Builder? (Für `ds12.md`.)

Die Prüfung von Plan 3 (Nachtrag Plan 3, Abschnitt 5) steht ebenfalls noch aus; beide Listen
lassen sich in einer Sitzung abarbeiten.

## 6. Umfang von Plan 4

Stationen DS 10–12 mit Story, Konzept, Block-Ansicht, Python, Aufgaben-Leiter, Tipp-Leiter, je zwei
Übungen, Quiz; Übungstyp Tipp-Lücke; Block-Ansicht mit Bedingungen, `not`, `else` und gestapelter
Hauptansicht; Parcours-Simulator mit Skript-Abgleich; Boss-Check Gold; Badge Gold; Parcours als
Bauplan und Bauskript-Befehl; Lehrkraft-Seiten DS 10–12 und Probelauf-Abschnitt; Übersetzung in
fünf Sprachen; Smokes erweitert.

Nicht in Plan 4: Diamant, Audio, Cheat-Sheets, Deploy (Phase 6), Hour-of-Code-Verweise, neue
Charakter-Posen, die it/es-Korrekturen aus Plan 3 (kommen mit der Nachübersetzung nach Dirks
Plan-3-Prüfung).

## 7. Definition of Done für Plan 4

- Drei Stationen s10–s12 in sechs Sprachen, drei Quizze, Boss-Check Gold als Aufgabe, Badge Gold
  mit Icon; Verleihung über den echten Lernpfad nachgewiesen (`--etappe gold`).
- `TypeGap` mit eigenen Tests, auch für „Fast" bei falscher Groß-/Kleinschreibung; Block-Ansicht
  mit Sechseck-Bedingung, `not` und `else`; Konsistenztest deckt `if`, `else`, `while`; breite
  Blöcke gestapelt, 750-px-Check grün.
- Simulator-Test und Skript-Abgleich grün; Bauplan-Abschnitt Parcours und Befehl `parcours`;
  `ds10–ds12.md`; Probelauf-Abschnitt Gold.
- `iframeHeight` für s10–s12 gemessen (und für Stationen, deren Hauptansicht sich durch das
  Stapeln ändert); Bauskript zweimal idempotent; Box-Smoke und App-Smoke je dreimal grün; Holz bis
  Eisen unverändert (bestehende Tests und Smokes grün).
- Übersetzung protokolliert, unter 3 USD; Kanon-Tests (Zauberwörter, Bezeichner) grün.
- **Offen für Dirk, ausdrücklich benannt** in README „Offen für Dirk" und im Plan-Statuskasten:
  Prüfung nach Abschnitt 5 und Probelauf Gold.
