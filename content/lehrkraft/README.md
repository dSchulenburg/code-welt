# Lehrkraft-Seiten

Dieser Ordner enthält die Markdown-Quellen für den versteckten Lehrkraft-Abschnitt (Abschnitt 1)
des Moodle-Kurses. `moodle/build-course.mjs` liest beim Bau des Kurses jede `*.md`-Datei außer
dieser README, wandelt sie über `moodle/lib/markdown.mjs` (`marked` + Umlaute als Entities) in
eine Moodle-Seite um und legt sie im Abschnitt an.

## Reihenfolge

Die Seiten erscheinen in der Reihenfolge der Dateinamen (alphabetisch sortiert). Wer eine
bestimmte Lesereihenfolge braucht, wählt Dateinamen entsprechend (z. B. Ziffern-Präfixe).

## Titel

Der Seitentitel in Moodle ist die erste `# `-Überschrift der Datei. Jede Datei braucht also genau
eine solche Überschrift ganz oben.

## Sprache

Diese Seiten sind nur für die Lehrkraft (der Abschnitt ist unsichtbar für Kursteilnehmer:innen)
und bleiben deshalb rein Deutsch — kein `{mlang}`.

## Diese README

Diese Datei selbst wird **nicht** als Seite angelegt (sie heißt absichtlich `README.md` und ist
von der Regel ausgenommen).
