# Code-Welt — Spec-Nachtrag für Plan 2 (Holz und Stein)

**Stand:** 03.09.2026 · **Status:** mit Dirk abgestimmt · **Ergänzt:** `2026-09-02-code-welt-minecraft-kurs-design.md`

> Plan 1 (Fundament) ist abgeschlossen. Das Gesamt-Review und die Ausführung haben Fragen
> aufgeworfen, die die Spec offen ließ. Dieser Nachtrag entscheidet sie für Plan 2; die
> Hauptspec bleibt die Autorität für alles andere.

## 1. Entscheidungen

| # | Frage | Entscheidung | Begründung |
|---|---|---|---|
| 1 | Block-Bilder (Renderer tot, ~50 Bilder) | **Eigene Block-Ansicht** in der App: SVG-Komponente zeichnet aus einer Blockbeschreibung je Station MakeCode-Blöcke in den Editorfarben mit englischen Labels. Ein vorhandenes Screenshot-PNG hat Vorrang. | Reproduzierbar, konsistent, kein manueller Schritt; Wiedererkennung über Farben und Wortlaut, nicht über Pixelgleichheit |
| 2 | Oberfläche (Spec 5.3 zählt sie zur Stütze) | **Überschriften, Aufgabenarten, Fortschrittstext zweisprachig** „Deutsch · Stütze"; **Buttons deutsch** | Kurze Buttons vertragen keinen zweiten Text; Überschriften tragen die Orientierung |
| 3 | Boss-Check-Bewertung | **Aufgabe mit Online-Text**, Abschluss **bei Abgabe**, Lehrkraft gibt Feedback und Punkte | Der MCP kann keine „Bestanden"-Skala setzen; das Badge hängt am Abschluss, nicht an der Note |
| 4 | Badges | **PHP-Skript im Container** (`moodle/php/create-badges.php`): Name/Beschreibung mit `{mlang}`, Icon-PNG aus dem Repo, Kriterium „Aktivitäten abgeschlossen" mit CMIDs aus dem Register, danach aktivieren; idempotent über den Badge-Namen | Der MCP hat kein Badge-Werkzeug; Klicken in der Oberfläche ist nicht reproduzierbar |
| 5 | Forum „Fragen an Nour" | **PHP-Skript** legt ein normales Forum (Typ `general`) in Abschnitt 0 an, Register führt den CMID; das automatische Ankündigungsforum bleibt für Lehrkraft-Infos | Der MCP kann keine Foren anlegen; Ankündigungsforen lassen SuS nicht schreiben |
| 6 | iframe-Höhe | **Datenfeld `iframeHeight` je Station** (Default 1400), Arabisch +10 % | JavaScript in Labels ist theme-abhängig (Memory `format-tiles-modal-scripts`); ein Datenfeld ist deterministisch. **Nachtrag 04.09.2026 (Final-Review-Fix A):** Werte werden gemessen (`scripts/measure-heights.mjs`), nicht geschätzt; Arabisch-Zuschlag entfällt (gemessen: ar ist die kürzeste Sprache, nicht die längste). |
| 7 | Charaktere Nour/Dani | **Nano Banana** (Media Factory `ai-image`): je Figur ein Referenzbild, dann fünf Posen mit Referenzbild für Konsistenz; **Deckel 5 USD**, Kostenanzeige vor jedem Lauf; SVG-Silhouetten bleiben Fallback | Dirks Freigabe 03.09.; Konsistenz über Posen ist das Risiko, deshalb Referenzbild-Verfahren |
| 8 | Welt „ankunft" | **Bauplan als Markdown** (Flachwelt, Startzone, Schildertexte DS 1–6, Beispielbauten) plus **MakeCode-Python-Bauskript** für Startplattform und Wegmarken; Dirk baut, exportiert `.mcworld`, lädt in den Lehrkraft-Ordner | Claude kann keine Welten bauen; das Skript nimmt die stumpfe Arbeit ab |
| 9 | Stundenverläufe | **Markdown im Repo** (`content/lehrkraft/dsNN.md`), das Bauskript rendert sie als Seiten in den versteckten Lehrkraft-Abschnitt; nur Deutsch | Eine Quelle, versionierbar, kein Editor-Klicken |
| 10 | Übersetzung | **Pro Etappe im jeweiligen Plan** (Holz und Stein in Plan 2), nicht erst in Phase 5 | Skript steht, ~0,11 USD je Sprache und Lauf; der Probelauf soll mehrsprachig sein |
| 11 | Quiz-Umbenennung | Ein geänderter Quiz-Name oder -Intro löst wie geänderte Fragen ein **Neu-Anlegen** aus (Versuchshistorie geht verloren) | Dokumentierter Tradeoff des Bauskripts; in der Box ohne Folgen, auf Produktion vor Änderungen bedenken |
| 12 | Box-Smoke | **Härtung**: auf `#logintoken` warten, Aufwärm-Aufruf vor dem Login, Soll-Reihenfolge je Abschnitt prüfen | Drei transiente Erstlauf-Fehler in Plan 1 |

## 2. Umfang von Plan 2

Stationen DS 1–6 (Holz 1–3, Stein 4–6) mit Story, Konzept, Aufgaben, Tipp-Leiter, Übungen und
Quiz; Boss-Check Holz und Stein als Aufgaben; zwei Badges; Forum; Lehrkraft-Abschnitt mit
Setup-Anleitung, Stundenverläufen DS 1–6 und Weltbauplan; Charaktere; Welt „ankunft" als Bauplan
und Bauskript; Übersetzung der sechs Stationen in fünf Sprachen; gehärteter Box-Smoke; Dirks
Probelauf in der Box.

Nicht in Plan 2: Audio, Cheat-Sheets, Glossar-Vollausbau (Phase 5), Deploy (Phase 6), Etappen
ab Eisen.

## 3. Datenmodell-Ergänzungen

- `STATIONS[id].blocks`: Blockbeschreibung für die Block-Ansicht, z. B.
  `{ kind: 'onChat', word: 'weg', body: [{ kind: 'agent.teleportToPlayer' }, { kind: 'agent.move', dir: 'forward', n: 1 }, { kind: 'agent.place', dir: 'back' }, { kind: 'repeat', n: 4, body: [ … ] }] }`.
  Die Python-Zeile bleibt daneben die verbindliche Textform.
- `STATIONS[id].iframeHeight` (Zahl, Default 1400).
- `STATIONS[id].bossCheck` (nur bei der letzten Station einer Etappe): `{ key, gradeMax }`;
  Texte (Titel, Auftrag) in `i18n.de.stations[id].bossCheck` (Stütze, übersetzt).
- `ETAPPEN[i].badge`: `{ key, icon }`; Texte in `i18n.de.etappen[id].badge` (`name`, `description`).
- `content/lehrkraft/dsNN.md`: Stundenverlauf je Doppelstunde; `content/lehrkraft/setup.md`,
  `content/lehrkraft/welt-ankunft.md`.

## 4. Definition of Done für Plan 2

- Sechs Stationen in sechs Sprachen, sechs Quizze, zwei Boss-Checks, zwei Badges, Forum, Lehrkraft-Abschnitt mit fünf Seiten und einem Ordner-Platzhalter für die Weltdatei.
- Charakterbilder für Nour und Dani in fünf Posen in der App; Kosten ≤ 5 USD protokolliert.
- Block-Ansicht für alle sechs Stationen; Vitest-Tests für Simulation der Blockbeschreibung gegen das Python.
- Bauskript zweimal idempotent, Reihenfolge je Abschnitt bewiesen; Badges werden beim Abschluss der Checks und des Boss-Checks vergeben (in der Box mit einem Testkonto nachgewiesen).
- Box-Smoke gehärtet, drei Läufe hintereinander grün.
- Dirks Probelauf Holz eingearbeitet.
