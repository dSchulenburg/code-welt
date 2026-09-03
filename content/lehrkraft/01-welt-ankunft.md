# Weltbauplan: codewelt-ankunft

Flachwelt „Grasebene" für die Etappen Holz und Stein. Dirk baut sie nach diesem Plan, exportiert
sie als `.mcworld` und legt sie im Ordner „Weltdateien" ab. Das Bauskript
`scripts/minecraft/welt-ankunft-bau.py` ist ein Entwurf dafür (Zauberwort `bau`) — Startplattform
und Wegmarken automatisch, den Rest im Editor gegenprüfen.

## Startzone

- 20×20 Blöcke, verankert bei **0/4/0** (Spawn liegt hier). Ecken der Zone: `-10/4/-10` bis
  `9/4/9`.
- Die Plattform **füllt y=4** und besteht aus `STONE`. Wer darauf steht, steht auf **y=5**.
  Deshalb liegen alle Schilder und alle Beispielbauten auf **y=5** — der Agent steht auf der
  Plattform und legt seine Blöcke auf derselben Höhe.
- Wegmarken: ein `GOLD_BLOCK` alle 5 Blöcke entlang x=0, bei `0/4/0` und `0/4/5`. Sie liegen
  **bündig in der Plattform** (y=4, sie ersetzen dort den Stein), nicht darauf — man läuft über
  sie hinweg, statt über sie zu stolpern. Sie zeigen die Richtung zum Erkunden-Bereich.
- **Keine Wegmarke ab z=6.** Der Erkunden-Bereich (ab z=10) bleibt frei, auch von Markierungen —
  dort baut die Etappe Eisen.

## Schilder DS 1–6

Ein Schild je Doppelstunde, kurzer deutscher Text. Alle sechs stehen in einer Reihe südlich vom
Spawn, auf **y=5**, und werden von links nach rechts gelesen. Ein Minecraft-Schild hat vier
Zeilen mit etwa 15 Zeichen — die Zeilenumbrüche unten sind so gemeint, wie sie dastehen.
Blickrichtung des Schildes (nach Süden lesbar oder nach Norden): **im Spiel prüfen**.

| Schild | Koordinaten (x/y/z) | Text, Zeile für Zeile |
|---|---|---|
| DS 1 | -6/5/-1 | DS 1<br>Sag hi zum<br>Agent. |
| DS 2 | -5/5/-1 | DS 2<br>Schreib weg.<br>Der Agent legt<br>einen Weg. |
| DS 3 | -4/5/-1 | DS 3<br>weg oder turm.<br>Zwei Wörter,<br>zwei Programme. |
| DS 4 | -3/5/-1 | DS 4<br>mauer: zehn<br>Blöcke aus<br>einer Schleife. |
| DS 5 | -2/5/-1 | DS 5<br>wand: eine<br>Schleife in der<br>Schleife. |
| DS 6 | -1/5/-1 | DS 6<br>haus: ein Ring<br>aus vier<br>Seiten. |

## Beispielbauten

Dieselben Programme wie in den Stationen DS 2–6, als Vorbild in der Welt aufgebaut. Alle Bauten
liegen auf **y=5**, der Agent startet jeweils mit Blick nach **Norden** (+z) und baut von seinem
Startfeld aus nach vorn. Der kleinste Abstand zwischen zwei Bauten beträgt **5 Felder** (gefordert
sind mindestens 4), Spawn und Wegmarken bleiben frei.

| Bau | Aus Station | Blöcke | Startfeld (x/y/z) | Blick | Belegte Felder (x / z) | Ausmaß |
|---|---|---|---|---|---|---|
| Weg | DS 2 (s02) | 4 (Gras) | -8/5/-9 | Norden | x -9…-8 / z -9…-7 | 3 lang × 2 breit |
| Turm | DS 3 (s03) | 3 (Stein) | 2/5/-9 | Norden | x 2 / z -8 | 1×1, Höhe 3 |
| Mauer | DS 4 (s04) | 10 (Bruchstein) | -8/5/-2 | Norden | x -8 / z -2…7 | 10 lang × 1 breit |
| Wand | DS 5 (s05) | 18 = 6×3 (Bruchstein) | -3/5/-8 | Norden | x -3 / z -8…-3 | 6 lang × 1 breit, Höhe 3 |
| Ring | DS 6 (s06, „haus") | 20 = 4 Seiten × 5 (Eiche) | 8/5/-3 | Norden | x 3…8 / z -3…2 | Umriss 6×6, Höhe 1 |

Rechenprobe: Weg 4 Blöcke (drei in einer Linie, der vierte um die Ecke); Turm 3 Blöcke
übereinander, er steht ein Feld **vor** dem Startfeld; Mauer 10 Blöcke aus einer Schleife
(`range(10)`); Wand 6 breit × 3 hoch = 18 Blöcke; Ring 4 Seiten × 5 Blöcke = 20 Blöcke, Umriss
aber 6×6 Felder — die vier Ecken gehören je zwei Seiten gleichzeitig.

**Eck-Regel, gilt für Weg und Ring:** `agent.move(FORWARD, 1)` und danach `agent.place(BACK)`
legt den Block immer in das Feld, das der Agent gerade verlassen hat. Nach einer Drehung liegt
der erste Block deshalb noch in der alten Linie — er ist der Eck-Block. Beim Weg heißt das: drei
Blöcke in einer Linie, der dritte ist die Ecke, der vierte liegt um die Ecke.

**Wand-Hinweis (Korrektur aus dem Review):** Nach den zwei Drehungen am Zeilenende braucht der
Agent einen zusätzlichen Schritt vor, sonst baut die Schleife eine versetzte Treppe statt einer
geraden Wand. Das Bauskript hat den Schritt schon drin.

## Freie Flächen

- **Spawn `0/*/0`** und der Streifen entlang x=0 nach Norden bleiben frei. Der nächste Bau (der
  Ring) beginnt bei x=3.
- **Bereich „Erkunden": nördlich der Startzone, ab z=10.** Dort entsteht in der Etappe Eisen das
  Erkundungsgebiet mit Fluss und Schlucht (Hauptspec, Abschnitt 6.2). Beim Bauen der Etappen Holz
  und Stein hier nichts platzieren — auch keine Wegmarke.

## Export und Upload

1. Welt im Spiel speichern.
2. Export als `.mcworld`-Datei (genauer Menüpfad **im Spiel prüfen**).
3. Datei umbenennen in `codewelt-ankunft.mcworld`.
4. Hochladen in den Moodle-Ordner „Weltdateien" in diesem (versteckten) Abschnitt.
5. Kontrolle: Datei herunterladen und per Doppelklick öffnen — testet denselben Import-Weg, den
   später auch die Schüler:innen gehen.

Belegt ist bisher nur, dass **`.mkcd`-Dateien** (die MakeCode-Projekte) nur unter Windows 64-bit
gespeichert und geladen werden können. Ob dieselbe Einschränkung für Weltdateien gilt, steht in
keiner Quelle: **im Spiel prüfen** — am besten einmal mit einem Nicht-Windows-Gerät, falls eines
in der Klasse steht.
