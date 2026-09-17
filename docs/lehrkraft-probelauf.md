# Probelauf für Dirk — Etappen Holz, Stein, Eisen und Gold in der Box

Schritt-für-Schritt-Anleitung für den ersten eigenen Durchlauf durch Plan 2 (sechs Stationen,
zwei Boss-Checks, zwei Badges, Forum, Lehrkraft-Abschnitt) in der lokalen Kurs-in-a-Box. Dauer
für den vollständigen Durchlauf: ca. 30–45 Minuten. Plan 3 (Eisen, DS 7–9) und Plan 4 (Gold, DS
10–12) haben je einen eigenen, kürzeren Abschnitt weiter unten, „Etappe Eisen" und „Etappe Gold".
Beide bauen auf den Grundlagen hier auf (Login, Reset, Badge-Ansicht) und wiederholen sie nicht.

## 1. Box starten

Immer beide Compose-Dateien zusammen — sonst fehlen die Plugin-Mounts (`filter_multilang2`,
`mod_customcert`) und der Kurs zeigt rohes `{mlang}`:

    docker compose -f ~/entwicklung/docker/ki-kurs-box/docker-compose.yml -f ~/entwicklung/docker/ki-kurs-box/docker-compose.code-welt.yml up -d

Vorgewärmte Volumes: Start dauert ca. 20 Sekunden statt zwei Minuten.

## 2. App-Dev-Server starten

Im `code-welt`-Repo:

    npm run dev

Läuft auf `http://localhost:3030/code-welt/`. Die Stationen im Kurs laden ihren Inhalt aus
diesem Server (iframe) — ohne ihn bleiben die Stationsseiten im Kurs leer.

## 3. In Moodle einloggen

`http://localhost:8080` · Login `admin` / `KiKurs-Demo-2026`.

## 4. Vor dem Start: Reset

Falls vorher schon jemand als `schueler1` Quizze gelöst oder den Boss-Check abgegeben hat (dein
eigener früherer Durchlauf, oder ein Lauf von `npm run moodle:smoke:learner`), im
`code-welt`-Repo:

    bash moodle/apply-php.sh php/reset-test-student.php 10 schueler1
    npm run moodle:postbuild

Löscht Aktivitätsabschluss, Quizversuche, Boss-Check-Abgaben und Noten von `schueler1` im Kurs und
setzt beide Badges wieder auf ACTIVE (unverliehen); `moodle:postbuild` verknüpft die Badges danach
wieder mit den aktuellen Quiz-/Aufgaben-CMIDs. Nur die Box — nie gegen Produktion ausführen. Ohne
diesen Schritt zeigt Punkt 9 (Badge sehen) unter Umständen ein Badge, das aus einem alten Lauf
stammt, nicht aus deinem eigenen Durchlauf.

## 5. Kurs auf Ukrainisch öffnen

    http://localhost:8080/course/view.php?id=10&lang=uk

Der Kurs heißt „Code-Welt: Programmieren mit Minecraft". Mit `&lang=uk` siehst du sofort, ob die Sprachumschaltung wirklich
greift — Überschriften, Aufgabenarten und Fortschrittstext sind zweisprachig „Deutsch · Stütze",
Buttons bleiben deutsch (Absicht, siehe Nachtrag zu Plan 2, Entscheidung 2).

## 6. Stationen 1–6 durchgehen

Abschnitt „Holz" (DS 1–3) und „Stein" (DS 4–6), je Station: Label → Quiz. Jede Station ist direkt
in der Kursseite eingebettet (iframe unter dem Label) — es gibt nichts anzuklicken, einfach nach
unten scrollen. Achte auf:

- **Dialog:** Nour/Dani führen kurz in die Aufgabe ein (Story).
- **Block-Ansicht:** MakeCode-Blöcke in Editorfarben mit englischen Labels — kein Foto, sondern
  live gezeichnet.
- **Python:** die passende Codezeile/den passenden Codeblock daneben.
- **Aufgaben:** „Auftrag" und „Noch einer" (zweite, etwas schwerere Variante).
- **Tipp-Leiter:** mehrstufige Hilfe, die erst bei Bedarf mehr verrät.
- **Übungen:** kleine Zwischenaufgaben vor dem Quiz.
- **Quiz:** vier Fragen, Bestehensnote 60 %.

Danach das Quiz der Station abschließen (Bestehensnote 60 % reicht für den Aktivitätsabschluss).

## 7. Boss-Check als Testschüler abgeben

Testkonto: `schueler1` / `Test-2026!` (Rolle Student, bereits in Kurs 10 eingeschrieben).

1. In einem zweiten Browser (oder Inkognito-Fenster), damit die Admin-Session erhalten bleibt,
   auf `http://localhost:8080` als `schueler1` einloggen.
2. Zur Aufgabe „Boss-Check Holz" (Abschnitt „Holz", letztes Element) gehen und einen Text
   abgeben (Freitext reicht — bewertet wird der Inhalt nicht automatisch).
3. Genauso für „Boss-Check Stein", wenn du auch das Stein-Badge sehen willst.

## 8. Lehrkraft bewertet die Abgabe

Als `admin` zurück zur Aufgabe „Boss-Check Holz" → „Alle Abgaben ansehen" → Feedback und Punkte
eintragen. Der Aktivitätsabschluss ist hier **bei Abgabe** gesetzt (nicht bei einer Mindestnote)
— das Badge hängt am Abschluss, nicht an der Bewertung (Nachtrag Entscheidung 3).

## 9. Badge sehen

- Badge-Übersicht des Kurses: `http://localhost:8080/badges/index.php?type=2&id=10` (`view.php`
  ist seit Moodle 4.5 deprecated und leitet nur noch auf `index.php` um)
- Oder im Profil von `schueler1`: eingeloggt als `schueler1` → Profil → „Abzeichen".

Voraussetzung für das Holz-Badge: alle drei Quizze der Etappe Holz bestanden **und** der
Boss-Check Holz abgegeben (nicht: bewertet). Willst du stattdessen den automatischen Nachweis
sehen (kein Klicken, echter Lernpfad als `schueler1`, inkl. Badge-Kontrolle per MCP): im
`code-welt`-Repo `npm run moodle:smoke:learner` (Holz) bzw. `npm run moodle:smoke:learner -- --etappe stein` (Stein).

## 10. Lehrkraft-Abschnitt sichten

Für Schüler:innen unsichtbarer Abschnitt (Auge durchgestrichen) — als `admin` trotzdem sichtbar.
Enthält: Ordner „Weltdateien" (noch leer — Bauplan und Bauskript stehen unten unter „Offene Punkte,
die nur im Spiel zu klären sind"), Setup-Anleitung, Weltbauplan
„codewelt-ankunft" und sechs Stundenverläufe DS 1–6 mit Musterlösungen und typischen Fehlern —
ein Punkteraster gibt es nur bei DS 3 und DS 6 (den beiden Boss-Checks; die übrigen vier
Stundenverläufe bewerten nicht, nur die Quizze tun das automatisch).

## 11. Forum-Testbeitrag

Forum „Fragen an Nour" (Abschnitt 0, oben im Kurs) — einen Testbeitrag schreiben, um zu sehen,
dass Schüler:innen dort tatsächlich posten können (anders als im automatischen
Ankündigungsforum).

---

## Etappe Eisen (DS 7–9)

Plan 3: drei neue Stationen mit den drei neuen Übungstypen „Zuordnung" (Block ↔ Python-Zeile),
„Lückencode" (Chips statt Tippen) und „Fehlersuche" (eine Zeile ist falsch) statt der bekannten
Parsons-Puzzle aus Holz und Stein; dazu ein Erkundungsgebiet in der Welt „ankunft" (Fluss, Schlucht,
zwei Klippen, Goldmarken), Boss-Check und Badge Eisen.

### Reset vor dem Durchlauf

Derselbe Befehl wie bei Holz und Stein (Punkt 4 oben): er setzt `schueler1` in **allen drei**
Etappen zurück, nicht nur in Eisen.

    bash moodle/apply-php.sh php/reset-test-student.php 10 schueler1
    npm run moodle:postbuild

### Reihenfolge

Abschnitt „Eisen" im Kurs, je Station Label → Quiz, wie bei Holz und Stein:

1. **s07 „Zahlen mit Namen":** Variable (`laenge = 5`), Brücke über den Fluss.
2. **s08 „Wo bin ich?":** Koordinaten und `fill`, Plattform über die Schlucht.
3. **s09 „Zählen":** Zähler-Variable in der Schleife, Treppe die Klippe hoch.
4. **Boss-Check Eisen** (letztes Element im Abschnitt): als `schueler1` einen Text abgeben, wie
   bei Boss-Check Holz/Stein (Schritt 7 oben).

### Worauf achten

- **Koordinatenanzeige:** ab s08 zeigt Minecraft Education die x/y/z-Koordinaten im HUD (Einstellung
  einschalten; `content/lehrkraft/00-setup.md` nennt nur die Einstellung „Koordinaten anzeigen" in
  den Welteinstellungen, der Menüpfad selbst ist dort als „im Spiel prüfen" markiert. Der genaue
  Name in der deutschen und englischen Spiel-UI ist einer der offenen Editor-Prüfpunkte unten).
  Ohne eingeschaltete Anzeige lässt sich „Wo bin ich?" nicht lösen.
- **Goldmarken:** im Erkundungsgebiet liegen fünf Goldblöcke (Fluss Stelle A, Fluss Stelle B,
  Schlucht, Klippe 1, Klippe 2). Sie sind die Startpunkte der Programme: Dort stellen sich die
  Schüler:innen hin, bevor sie `bruecke`, `plattform` oder `treppe` schreiben, und lesen dort auch
  die Koordinaten ab. Ob sie im gebauten Bauplan wirklich an diesen Stellen liegen, ist noch nicht
  im Spiel geprüft (siehe „Offene Punkte" unten).
- **Python-Umschalter (im MakeCode-Editor, nicht in der App):** bei s07 von Block auf Python
  umschalten und prüfen, ob `laenge = 5` wirklich als erste Zeile unter `def on_bruecke():` steht
  (hängt mit Editor-Prüfpunkt 4 unten zusammen: Variable als erste Zeile im Chat-Handler, oder
  zieht der Editor sie nach `on start`?).

### Badge sehen

Wie bei Holz/Stein: Badge-Übersicht `http://localhost:8080/badges/index.php?type=2&id=10`, oder
automatisch per `npm run moodle:smoke:learner -- --etappe eisen` (echter Lernpfad, Badge-Nachweis
per MCP, kein Klicken nötig).

---

## Etappe Gold (DS 10–12)

Plan 4: drei neue Stationen mit Bedingungen (`if`, `if/else`, `while not`) statt reiner
Abfolge. Neuer Übungstyp „Tipp-Lücke" (Zahl oder Wort selbst eintippen statt auswählen), dazu ein
Parcours in der Welt „ankunft" (vier Bahnen: Ecke, Löcher, Ziel, Boss), Boss-Check und Badge
Gold.

### Reset vor dem Durchlauf

Derselbe Befehl wie bei Holz, Stein und Eisen (Punkt 4 oben): er setzt `schueler1` in **allen
vier** Etappen zurück, nicht nur in Gold.

    bash moodle/apply-php.sh php/reset-test-student.php 10 schueler1
    npm run moodle:postbuild

### Reihenfolge

Abschnitt „Gold" im Kurs, je Station Label → Quiz, wie bei den drei Etappen davor:

1. **s10 „Wenn, dann":** `if` und `agent.detect`, um die Ecke im Gang.
2. **s11 „Sonst":** `if/else`, Löcher füllen statt hineinzufallen.
3. **s12 „Solange":** `while not`, bis zur Wand laufen.
4. **Boss-Check Gold** (letztes Element im Abschnitt): als `schueler1` einen Text abgeben, wie
   bei den drei Boss-Checks davor (Schritt 7 oben).

### Worauf achten

- **Blick nach Süden:** alle drei Bahnen (und der Boss) starten auf einer Goldmarke mit Blick
  nach Süden (`+z`). `LEFT_TURN` dreht von dort nach Osten. Steht die Person beim Start falsch
  herum, laufen `ecke`, `loecher` und `ziel` in die falsche Richtung.
- **`range(10)` scheitert absichtlich (s11):** die Bahn „Löcher" hat zehn Felder, aber vier davon
  sind Löcher. `range(10)` reicht darum nicht bis zur Wand, das ist die Pointe der Übung „Die
  richtige Zahl" (Antwort: 14). Das ist kein Fehler in der Station.
- **Zweiter Versuch auf der Bahn „Löcher" (s11):** gefüllte Löcher bleiben gefüllt. Nach dem ersten
  `range(10)` ist nur noch das Loch bei z=64 offen, dann reichen 11 Durchläufe (mit 10 bis z=65).
  Für einen fairen zweiten Versuch die Bahn neu bauen (`parcours`) oder erst rechnen, dann neu
  starten.
- **Tipp-Lücke meldet „Fast" bei Kleinschreibung:** tippt man `redstone` statt `REDSTONE` oder
  `down` statt `DOWN` in eine Lücke, zeigt die Übung „Fast. Python unterscheidet groß und klein.",
  nicht „Richtig". Das ist Absicht (MakeCode meldet Kleinschreibung im Python-Editor ebenfalls als
  Fehler).
- **Endlosschleife stoppen (s12):** `while not agent.detect(...)` läuft weiter, solange die
  Bedingung nicht eintritt. Kommt das Programm nie an eine Wand, läuft es endlos. Wie man ein
  laufendes Programm im Code Builder stoppt, ist einer der offenen Editor-Prüfpunkte unten.
- **Redstone-Erkennung (Boss-Bahn):** der Redstone-Block liegt mitten in der Boss-Bahn bei z=68
  (bündig im Boden), die Bahn selbst endet an der Sicherheitswand bei z=79. Ob `AgentDetection.REDSTONE` wirklich einen Redstone-**Block** erkennt oder nur
  Redstone-**Staub**, ist ebenfalls einer der offenen Editor-Prüfpunkte (siehe unten); erkennt der
  Editor nur Staub, muss das Ziel der Boss-Bahn neu entschieden werden.

### Badge sehen

Wie bei den drei Etappen davor: Badge-Übersicht `http://localhost:8080/badges/index.php?type=2&id=10`,
oder automatisch per `npm run moodle:smoke:learner -- --etappe gold` (echter Lernpfad,
Badge-Nachweis per MCP, kein Klicken nötig).

---

## Rückmeldeliste

Bitte beim Durchlauf auf diese Punkte achten und zurückmelden:

- [ ] **Sprache A2/B1:** Sind die deutschen Texte für die Zielgruppe verständlich? Zu schwer,
      zu kindlich, Fachbegriffe ungeklärt?
- [ ] **Python im Editor:** Stimmen die Codezeilen aus den Stationen (s01–s12) tatsächlich mit
      dem, was MakeCode im Editor anbietet, überein? (Noch nicht im Spiel geprüft, siehe unten.)
- [ ] **Reihenfolge:** Ergibt der Aufbau innerhalb einer Station Sinn (Dialog → Konzept →
      Aufgabe → Tipp-Leiter → Übungen → Quiz)? Wirkt eine Station zu lang oder zu kurz?
- [ ] **Bilder:** Sehen die Block-Ansichten so aus, wie du sie in MakeCode erwarten würdest?
      Passen die Gesichter von Nour und Dani zur jeweiligen Dialogzeile (Stimmung)?
- [ ] **Höhe des iframes je Station:** Muss irgendwo gescrollt werden, obwohl der Inhalt
      eigentlich hineinpassen sollte, oder bleibt unten unnötig viel Leerraum?

## Offene Punkte, die nur im Spiel zu klären sind

Diese Punkte kann kein Test in der Box beantworten — sie brauchen Minecraft Education selbst:

- **Python-Gegenprüfung im Editor:** Für alle neun Stationen (s01–s09) und für
  `scripts/minecraft/welt-ankunft-bau.py` prüfen, ob die verwendeten Befehle und ihre Syntax so
  im MakeCode-Python-Editor existieren — insbesondere die Signatur
  `agent.teleport(world(x, y, z), SOUTH)` (zweiter Parameter = Blickrichtung, aus der Doku
  übernommen, nicht getestet; Rückfallweg mit separaten `agent.turn`-Zeilen ist im Skript als
  Kommentar hinterlegt). Für Eisen zusätzlich die fünf Punkte aus dem Plan-3-Nachtrag, Abschnitt 5
  (`docs/specs/2026-09-04-code-welt-plan3-nachtrag.md`): `agent.place(DOWN)` über Wasser als
  begehbare Brücke (s07), `FillOperation.REPLACE`-Schreibweise und welche Achse `pos()` ausdehnt
  (s08), ob der Editor `for index in range(stufen)` wirklich als „for index from 0 to stufen − 1"
  rendert (s09, betrifft die Minus-Ausdruck-Pille in der Block-Ansicht), ob eine Variable als erste
  Zeile im Chat-Handler landet oder in `on start` (s07), und der Name der Koordinatenanzeige in der
  deutschen und englischen Spiel-UI (für `00-setup.md`).
- **Editor- und Spiel-Prüfpunkte Gold (Nachtrag Plan 4, Abschnitt 5, sieben Punkte,
  `docs/specs/2026-09-17-code-welt-plan4-nachtrag.md`):** zählen Wasser, Lava und Luft bei
  `agent.detect(AgentDetection.BLOCK, ...)` als Block; fällt der Agent, wenn er über ein Loch
  läuft, oder schwebt er; füllt `agent.place(DOWN)` wirklich ein Luftloch; erkennt
  `AgentDetection.REDSTONE` einen Redstone-**Block** oder nur Redstone-**Staub** (falls nur Staub,
  muss das Ziel der Boss-Bahn neu entschieden werden, samt Bahndaten, Simulator und Boss-Text);
  schaut der Agent nach `agent.teleport_to_player()` in die Blickrichtung der Person, und dreht
  `LEFT_TURN` bei Blick nach Süden nach Osten; wie wandelt der Editor `if … else` und `while not
  …` zwischen Blöcken und Python, zeigt er `for index in range(20)` mit ungenutztem `index` als
  `repeat 20`; wie stoppt man ein endlos laufendes `while` im Code Builder (für `ds12.md`).
- **Ring-Tür-Hypothese (Boss-Check Stein, „Der Zaun"):** Der Agent endet vermutlich auf seinem
  Startfeld, das schon einen Block trägt — dann fehlt der letzte Block und der Ring hat von
  selbst eine Lücke. Einmal `haus` bauen lassen und nachzählen: **19 oder 20 Blöcke?** (Details
  und beide Fälle: `content/lehrkraft/ds06.md`.)
- **Weltdatei „ankunft":** Bauplan (`content/lehrkraft/01-welt-ankunft.md`), Bauskript
  (`scripts/minecraft/welt-ankunft-bau.py`) und die Chat-Befehle `erkunden` (Plan 3) und
  `parcours` (Plan 4, vier Bahnen: Ecke, Löcher, Ziel, Boss) liegen bereit. Welt im Editor um
  beide Befehle erweitern, Schilder setzen, dann komplett als `.mcworld` neu exportieren, in den
  Lehrkraft-Ordner „Weltdateien" (Abschnitt 1) hochladen.
- **Blickrichtung der Schilder** DS 1–6 (vom Spawn aus lesbar, Schriftseite nach Süden) — im
  Spiel prüfen.
- **Achsen und Blickrichtung (vor `bau` und `erkunden`):** Laut Doku ist +x Osten und +z Süden.
  Im Spiel bestätigen: Auf der Plattform stehen, `blocks.place(GOLD_BLOCK, pos(0, 0, 1))` per
  Chat-Befehl setzen und schauen, auf welcher Seite der Block liegt; in der Koordinatenanzeige muss
  dabei z um 1 größer sein. Außerdem prüfen, ob `agent.teleport(..., SOUTH)` den Agent wirklich zu
  größeren z-Werten schauen lässt (ein `agent.move(FORWARD, 1)` danach erhöht z um 1).
- **Bodenhöhe (vor `erkunden`):** Neben der Startzone auf freies Gras stellen und y ablesen. Der
  Bauplan nimmt die Grasoberfläche auf y=4 an (Füße y=5). Stimmt das nicht, `erkunden` nicht
  laufen lassen (Vorgehen: Bauplan, Abschnitt „Bodenhöhe").
- **Koordinatenanzeige = Fußhöhe?** Auf die Steinplatte stellen (Oberkante y=4) und prüfen, ob die
  Anzeige y=5 zeigt. Die erwarteten Werte im Boss-Check (`ds09.md`: unten 5, oben 9) setzen
  voraus, dass die Anzeige die Füße zeigt und nicht die Augenhöhe oder den Block darunter. Die
  Differenz 4 bliebe bei einem festen Versatz gleich, die Bewertungshilfe müsste aber andere
  Einzelwerte nennen.

## Sprachqualität — Muttersprachler:innen-Check

Ukrainisch und Arabisch sind maschinell übersetzt und automatisiert gegen Zauberwörter, Zahlen,
Etappennamen und Glossarbegriffe geprüft (`npm test`), aber noch nicht von Muttersprachler:innen
gegengelesen. Bitte für uk und ar je eine Stichprobe (z. B. eine ganze Station, Holz bis Gold) von
einer kundigen Person lesen lassen. Die arabische Register-Frage aus Task 9 ist dabei eine
bewusste, aber ungeklärte Entscheidung: alle Imperative im Kurs sind maskulin, eine neutrale
Form gäbe es nur über einen kompletten Registerwechsel (Verbalnomen statt Imperativ). Wenn das
störend wirkt, ist das ein eigener kleiner Task.

## Charaktere: Posen nachbessern

Nour und Dani liegen als Referenzbild plus fünf Posen in `src/assets/characters/` (freigegeben
04.09.2026, 0,48 USD gesamt). Wirkt eine Pose im Panel unpassend, lässt sie sich einzeln neu
ziehen (~0,04 USD), zum Beispiel:

```
node scripts/characters.mjs --who dani --pose ueberrascht --ref src/assets/characters/dani-ref.png
```

Danach die Datei mit `sharp` palettenreduzieren (siehe Ledger, Task 6 Phase B) und den
App-Smoke laufen lassen.
