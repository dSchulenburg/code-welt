# Probelauf für Dirk — Etappen Holz, Stein und Eisen in der Box

Schritt-für-Schritt-Anleitung für den ersten eigenen Durchlauf durch Plan 2 (sechs Stationen,
zwei Boss-Checks, zwei Badges, Forum, Lehrkraft-Abschnitt) in der lokalen Kurs-in-a-Box. Dauer
für den vollständigen Durchlauf: ca. 30–45 Minuten. Plan 3 (Eisen, DS 7–9) hat einen eigenen,
kürzeren Abschnitt weiter unten, „Etappe Eisen". Er baut auf den Grundlagen hier auf (Login,
Reset, Badge-Ansicht) und wiederholt sie nicht.

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
  einschalten, `content/lehrkraft/00-setup.md` nennt den Menüpfad. Der genaue Name in der
  deutschen und englischen Spiel-UI ist einer der offenen Editor-Prüfpunkte unten). Ohne
  eingeschaltete Anzeige lässt sich „Wo bin ich?" nicht lösen.
- **Goldmarken:** im Erkundungsgebiet markieren Goldblöcke die Stellen, an denen Schüler:innen die
  Koordinaten ablesen sollen (Fluss, Schlucht, beide Klippen). Ob sie im gebauten Bauplan wirklich
  an diesen Stellen liegen, ist noch nicht im Spiel geprüft (siehe „Offene Punkte" unten).
- **Python-Umschalter (im MakeCode-Editor, nicht in der App):** bei s07 von Block auf Python
  umschalten und prüfen, ob `laenge = 5` wirklich als erste Zeile unter `def on_bruecke():` steht
  (hängt mit Editor-Prüfpunkt 4 unten zusammen: Variable als erste Zeile im Chat-Handler, oder
  zieht der Editor sie nach `on start`?).

### Badge sehen

Wie bei Holz/Stein: Badge-Übersicht `http://localhost:8080/badges/index.php?type=2&id=10`, oder
automatisch per `npm run moodle:smoke:learner -- --etappe eisen` (echter Lernpfad, Badge-Nachweis
per MCP, kein Klicken nötig).

---

## Rückmeldeliste

Bitte beim Durchlauf auf diese Punkte achten und zurückmelden:

- [ ] **Sprache A2/B1:** Sind die deutschen Texte für die Zielgruppe verständlich? Zu schwer,
      zu kindlich, Fachbegriffe ungeklärt?
- [ ] **Python im Editor:** Stimmen die Codezeilen aus den Stationen (s01–s09) tatsächlich mit
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
  `agent.teleport(world(x, y, z), NORTH)` (zweiter Parameter = Blickrichtung, aus der Doku
  übernommen, nicht getestet; Rückfallweg mit separaten `agent.turn`-Zeilen ist im Skript als
  Kommentar hinterlegt). Für Eisen zusätzlich die fünf Punkte aus dem Plan-3-Nachtrag, Abschnitt 5
  (`docs/specs/2026-09-04-code-welt-plan3-nachtrag.md`): `agent.place(DOWN)` über Wasser als
  begehbare Brücke (s07), `FillOperation.REPLACE`-Schreibweise und welche Achse `pos()` ausdehnt
  (s08), ob der Editor `for index in range(stufen)` wirklich als „for index from 0 to stufen − 1"
  rendert (s09, betrifft die Minus-Ausdruck-Pille in der Block-Ansicht), ob eine Variable als erste
  Zeile im Chat-Handler landet oder in `on start` (s07), und der Name der Koordinatenanzeige in der
  deutschen und englischen Spiel-UI (für `00-setup.md`).
- **Ring-Tür-Hypothese (Boss-Check Stein, „Der Zaun"):** Der Agent endet vermutlich auf seinem
  Startfeld, das schon einen Block trägt — dann fehlt der letzte Block und der Ring hat von
  selbst eine Lücke. Einmal `haus` bauen lassen und nachzählen: **19 oder 20 Blöcke?** (Details
  und beide Fälle: `content/lehrkraft/ds06.md`.)
- **Weltdatei „ankunft":** Bauplan (`content/lehrkraft/01-welt-ankunft.md`), Bauskript
  (`scripts/minecraft/welt-ankunft-bau.py`) und seit Plan 3 der Chat-Befehl `erkunden` für das
  Erkundungsgebiet liegen bereit. Welt im Editor um `erkunden` erweitern, dann komplett als
  `.mcworld` neu exportieren, in den Lehrkraft-Ordner „Weltdateien" (Abschnitt 1) hochladen.
- **Blickrichtung der Schilder** DS 1–6 (nach Süden lesbar oder nach Norden) — im Spiel prüfen.

## Sprachqualität — Muttersprachler:innen-Check

Ukrainisch und Arabisch sind maschinell übersetzt und automatisiert gegen Zauberwörter, Zahlen,
Etappennamen und Glossarbegriffe geprüft (`npm test`), aber noch nicht von Muttersprachler:innen
gegengelesen. Bitte für uk und ar je eine Stichprobe (z. B. eine ganze Station) von einer
kundigen Person lesen lassen — insbesondere die arabische Register-Frage aus Task 9 ist eine
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
