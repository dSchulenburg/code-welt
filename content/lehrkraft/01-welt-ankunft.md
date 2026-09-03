# Weltbauplan: codewelt-ankunft

Flachwelt „Grasebene" für die Etappen Holz und Stein. Dirk baut sie nach diesem Plan, exportiert
sie als `.mcworld` und legt sie im Ordner „Weltdateien" ab. Das Bauskript
`scripts/minecraft/welt-ankunft-bau.py` ist ein Entwurf dafür (Zauberwort `bau`) — Startplattform
und Wegmarken automatisch, den Rest im Editor gegenprüfen.

## Startzone

- 20×20 Blöcke, verankert bei **0/4/0** (Spawn liegt hier). Ecken der Zone: `-10/4/-10` bis
  `9/4/9`.
- Oberfläche aus `STONE` (Startplattform). Darauf stehen die Schilder und die Beispielbauten.
- Wegmarken: ein `GOLD_BLOCK` alle 5 Blöcke entlang x=0, von `0/4/0` bis `0/4/10` — zeigt Richtung
  Erkunden-Bereich.

## Schilder DS 1–6

Ein Schild je Doppelstunde, kurzer deutscher Text. Genaue Platzierung und Blickrichtung **im
Spiel prüfen**.

| Schild | Text |
|---|---|
| DS 1 | „Sag hi zum Agent." |
| DS 2 | „Schreib weg. Der Agent legt einen Weg." |
| DS 3 | „weg oder turm — zwei Zauberwörter, zwei Programme." |
| DS 4 | „mauer — zehn Blöcke aus einer Schleife." |
| DS 5 | „wand — eine Schleife in der Schleife." |
| DS 6 | „haus — ein Ring aus vier Seiten." |

## Beispielbauten

Dieselben Programme wie in den Stationen DS 2–6, als Vorbild in der Welt aufgebaut. Abstand
zwischen den Bauten mindestens 4 Blöcke, alle innerhalb der Startzone.

| Bau | Aus Station | Blöcke | Ursprung (x/y/z) | Blickrichtung | Ausmaß |
|---|---|---|---|---|---|
| Weg | DS 2 (s02) | 3 (Gras) | -8/4/-8 | Norden | ca. 2×1 |
| Turm | DS 3 (s03) | 3 (Stein), 3 hoch | -8/4/-2 | Norden | 1×1, Höhe 3 |
| Mauer | DS 4 (s04) | 10 (Bruchstein) | -2/4/-8 | Osten | 10×1 |
| Wand | DS 5 (s05) | 18 = 6×3 (Bruchstein) | 3/4/-8 | Norden | 6×1, Höhe 3 |
| Ring | DS 6 (s06, „haus") | 20 = 4 Seiten × 5 (Eiche) | 3/4/0 | Norden | Umriss 6×6, Höhe 1 |

Rechenprobe: Mauer 10 Blöcke (eine Schleife, `range(10)`); Wand 6 breit × 3 hoch = 18 Blöcke;
Ring 4 Seiten × 5 Blöcke = 20 Blöcke, Umriss aber 6×6 Felder — die vier Ecken gehören je zwei
Seiten gleichzeitig.

Wand-Hinweis (Korrektur aus dem Review): Nach den zwei Drehungen am Zeilenende braucht der Agent
einen zusätzlichen Schritt vor, sonst baut die Schleife eine versetzte Treppe statt einer geraden
Wand. Das Bauskript hat den Schritt schon drin.

## Bereich „Erkunden" (für Eisen freihalten)

Nördlich der Startzone, ab z=10, bleibt unbebaut — dort entsteht in der Etappe Eisen das
Erkundungsgebiet mit Fluss und Schlucht (Hauptspec, Abschnitt 6.2). Beim Bauen der Etappen Holz
und Stein hier nichts platzieren.

## Export und Upload

1. Welt im Spiel speichern (nur Windows 64-bit kann `.mkcd`/`.mcworld` speichern, siehe
   Setup-Seite).
2. Export als `.mcworld`-Datei (genauer Menüpfad **im Spiel prüfen**).
3. Datei umbenennen in `codewelt-ankunft.mcworld`.
4. Hochladen in den Moodle-Ordner „Weltdateien" in diesem (versteckten) Abschnitt.
5. Kontrolle: Datei herunterladen und per Doppelklick öffnen — testet denselben Import-Weg, den
   später auch die Schüler:innen gehen.
