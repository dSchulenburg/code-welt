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

## Erkundungsgebiet (Etappe Eisen, ab z=10)

Der Bereich „Erkunden" aus dem Abschnitt „Freie Flächen" oben wird hier konkret: Fluss, Schlucht
und zwei Klippen für die Stationen DS 7–9. Baut der Chat-Befehl `erkunden` im Bauskript
(`scripts/minecraft/welt-ankunft-bau.py`) — additiv, unabhängig vom Befehl `bau` und auch auf
einer bereits gebauten Welt aufrufbar. Er verändert nichts an Startzone, Schildern DS 1–6 oder den
Beispielbauten.

| Element | Quader (`world`) | Material | Goldmarke (bündig y=4) | Schild (von Hand) |
|---|---|---|---|---|
| Fluss Stelle A (5 breit) | (-12, 3, 12) → (-1, 4, 16) | WATER | (-6, 4, 11) | „DS 7 · Stelle A · bruecke · Blick nach Norden" |
| Fluss Stelle B (8 breit) | (0, 3, 12) → (11, 4, 19) | WATER | (6, 4, 11) | „DS 7 · Stelle B · 8 breit" |
| Schlucht (7 breit, 6 tief) | (-12, -1, 26) → (11, 4, 32) | AIR | (0, 4, 25) | „DS 8 · plattform · Stell dich auf das Gold" |
| Klippe 1 (6 hoch) | (-12, 5, 40) → (-3, 10, 49) | STONE | (-18, 4, 43) | „DS 9 · treppe · 6 hoch" |
| Klippe 2 (4 hoch, Boss) | (3, 5, 40) → (12, 8, 49) | STONE | (-1, 4, 43) | kein Schild; Leiter an der Westseite bei (2, 5–8, 47) |

**Zwei Abweichungen vom ursprünglichen Entwurf (Nachtrag), beide hier vermerkt:** Der Fluss ist
**24 statt 20 Blöcke lang** gebaut — symmetrisch um x=0, Stelle A und B je 12 Blöcke breit in x.
Und die Plattform (Station s08) läuft von `pos(0, -1, 1)` bis `pos(4, -1, 7)` statt der
ursprünglich geplanten `(0, -1, 0)` bis `(4, -1, 8)` — so bleibt die Goldmarke unter den Füßen
stehen, und die Plattform füllt genau die Schluchtbreite (z 26…32). Der Python-Entwurf in Task 5
(Station s08) trägt diese Werte bereits.

**Rechenprobe:** Brücke Stelle A — der Agent startet auf der Goldmarke (z=11), fünfmal
`agent.move(FORWARD, 1)` + `agent.place(DOWN)` legt z=12…16 auf y=4, genau die fünf Wasserblöcke.
Stelle B: acht Paare, z=12…19. Plattform — `pos(0, -1, 1)` bis `pos(4, -1, 7)` von der Goldmarke
(0, 4, 25) aus: y=4, z=26…32 (genau die Schlucht), x=0…4. Treppe Klippe 1 — von der Goldmarke
(-18, 4, 43): Stufe `index` liegt bei x=-18+index, y=5…5+index, z=44…46; Stufe 5 endet auf y=10 =
Plateau-Oberkante, bei x=-13 direkt neben der Klippe (x=-12). Klippe 2 — `stufen = 4` von der
Goldmarke (-1, 4, 43): Stufen bei x=-1…2, Oberkante y=8 = Plateau, neben x=3. Abstände: Fluss
endet z=19, Schlucht beginnt z=26 (6 frei); Schlucht endet z=32, Klippen beginnen z=40 (7 frei).

**Blickrichtung:** `pos()` zählt von den Füßen aus, aber an den Weltachsen ausgerichtet, nicht an
der Blickrichtung. `bruecke` (DS 7) dagegen bewegt den Agent mit `agent.move(FORWARD, ...)`
relativ zur Blickrichtung der SuS — nur mit Blick nach Norden landet die Brücke auf dem Fluss.
Deshalb trägt nur das Schild an Stelle A den Zusatz „Blick nach Norden"; an Stelle B ist dieselbe
Blickrichtung schon aus Stelle A bekannt. Bei `plattform` (DS 8) und `treppe` (DS 9) spielt die
Blickrichtung dagegen keine Rolle, weil beide nur mit `pos()` arbeiten — trotzdem bleibt Blick
nach Norden die Konvention der ganzen Welt, damit die abgelesenen Koordinaten für alle gleich
aussehen.

**Leiter Klippe 2:** An der Westseite von Klippe 2, bei (2, 5–8, 47), von Hand gesetzt (nicht im
Bauskript) — sie führt vom Fuß der Klippe bis zum Plateau und ist im Boss-Check der Weg nach oben,
solange die eigene Treppe noch nicht steht.

- Befehl `erkunden` im Bauskript baut Fluss, Schlucht und beide Klippen in einem Aufruf; additiv,
  auch auf einer schon gebauten Welt.
- Koordinatenanzeige der Welt einschalten (siehe Setup, Abschnitt „Koordinaten anzeigen") — ohne
  sie können die SuS in DS 8 die abgelesenen x/y/z nicht mit der Tabelle oben vergleichen.

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
