# Entwurf, im Editor gegenpruefen (minecraft.makecode.com, Bloecke -> Python).
#
# MakeCode-Python fuer die Welt "codewelt-ankunft" (Flachwelt "Grasebene"). Baut auf das
# Zauberwort "bau": Startplattform, Wegmarken und die fuenf Beispielbauten aus den Stationen
# DS 2 bis DS 6 (Weg, Turm, Mauer, Wand, Ring). Die Koordinaten muessen zur Tabelle in
# content/lehrkraft/01-welt-ankunft.md passen — wer eine Zahl hier aendert, aendert sie auch dort.
#
# Bodenhoehe (ANNAHME, nicht im Spiel gemessen): Die Grasoberflaeche der Flachwelt liegt auf
# y=4, die Fuesse eines Spielers auf dem Gras also auf y=5, und unter y=4 liegen mindestens sechs
# Schichten Boden (die Schlucht in "erkunden" reicht bis y=-1). Alle y-Werte unten sind als feste
# Zahlen geschrieben, damit sie Zeichen fuer Zeichen mit der Tabelle im Bauplan vergleichbar
# bleiben. Liegt das Gras woanders (z.B. y=3), "erkunden" NICHT laufen lassen: Goldmarken stehen
# dann heraus, Wasser laeuft ueber, Klippen schweben, die Schlucht ist unten offen. Pruefen und
# Vorgehen: Bauplan, Abschnitt "Bodenhoehe", und docs/lehrkraft-probelauf.md.
#
# Hoehen: die Plattform fuellt y=4. Wer darauf steht, steht auf y=5 — deshalb teleportiert der
# Agent auf y=5 und legt seine Bloecke auf y=5. Die Wegmarken sind die Ausnahme: sie liegen
# buendig in der Plattform (y=4, sie ersetzen dort den Stein), damit man ueber sie laufen kann.
#
# Achsen (minecraft.makecode.com/reference/positions/pos, geprueft 16.09.2026): +x = Osten,
# -x = Westen, +z = Sueden, -z = Norden. Bis 16.09.2026 stand hier "Norden (+z)". Das war falsch.
#
# Blickrichtung: agent.teleport(world(x, y, z), SOUTH) — der zweite Parameter ist die
# Himmelsrichtung, in die der Agent danach schaut (Doku agent/teleport: "compass direction ...
# that the agent will face"). Alle Bauten starten nach Sueden (+z) und wachsen von ihrem Startfeld
# nach vorn, also zu groesseren z-Werten. Mit Blick nach Sueden fuehrt agent.turn(LEFT_TURN) nach
# Osten (+x), RIGHT_TURN nach Westen (-x). Weg und Ring behalten die Linksdrehung der Stationen
# s02/s06 und starten deshalb am westlichen Rand ihres Umrisses (Weg x=-9, Ring x=3). Die
# Signatur ist aus der Doku uebernommen und nicht selbst getestet: im Editor pruefen. Nimmt der
# Editor den zweiten Parameter nicht an, teleportiere ohne ihn und dreh den Agent mit
# agent.turn(LEFT_TURN)-Zeilen, bis er nach Sueden schaut (von der Wegmarke 0/4/0 aus zur
# Wegmarke 0/4/5 hin).
#
# Eck-Regel: agent.move(FORWARD, 1) und danach agent.place(BACK) legt den Block immer in das
# Feld, das der Agent gerade verlassen hat. Nach einer Drehung liegt der erste Block deshalb
# noch in der alten Linie — er ist der Eck-Block. Das erklaert, warum der Weg vier Paare
# move/place braucht (drei Bloecke in einer Linie, einer um die Ecke) und warum sich beim Ring
# die vier Ecken je zwei Seiten teilen.
#
# Wand-Korrektur aus dem Task-5-Review (03.09.2026): Ohne das agent.move(FORWARD, 1) nach den
# zwei Drehungen baut die Schleife eine versetzte Treppe statt einer geraden Wand — der Agent
# steht nach der 180-Grad-Drehung neben der zuletzt gebauten Reihe, nicht mehr auf ihrer Linie.
#
# Zweiter Befehl "erkunden" (Etappe Eisen, Task 8): baut additiv dazu, unabhaengig von "bau" und
# auch auf einer schon gebauten Welt aufrufbar — er veraendert nichts an Startzone, Schildern
# oder Beispielbauten aus DS 1-6. Die Koordinaten stammen aus der Tabelle in
# content/lehrkraft/01-welt-ankunft.md, Abschnitt "Erkundungsgebiet" — wer eine Zahl hier
# aendert, aendert sie auch dort. Ab hier nutzt world(x, y, z) statt agent.teleport/move: die
# Bauten (Fluss, Schlucht, Klippen) sind reine Quader, die Stationsprogramme (bruecke, plattform,
# treppe) laufen erst spaeter im Editor der Lernenden.
#
# Dritter Befehl "parcours" (Etappe Gold, Plan 4 Task 4): baut additiv vier Bahnen suedlich der
# Klippen, ab z=56. Die Zahlen stammen aus scripts/minecraft/parcours.json; tests/parcours-script.test.js
# vergleicht beide Zeile fuer Zeile — wer eine Zahl aendert, aendert sie in beiden. Schilder setzt
# die Lehrkraft von Hand, Goldmarken und der Redstone-Block kommen aus dem Skript.

def bau_plattform():
    # Startplattform 20x20 aus Stein, sie fuellt y=4 (Startzone bei 0/4/0 laut Bauplan).
    blocks.fill(STONE, world(-10, 4, -10), world(9, 4, 9), FillOperation.REPLACE)

def bau_wegmarken():
    # Ein Goldblock alle 5 Bloecke entlang x=0, buendig in der Plattform (y=4). Nur bis z=5:
    # der Erkunden-Bereich ab z=10 bleibt frei, auch von Markierungen (Etappe Eisen).
    blocks.place(GOLD_BLOCK, world(0, 4, 0))
    blocks.place(GOLD_BLOCK, world(0, 4, 5))

def bau_weg():
    # Wie Station s02 (DS 2): 4 Grasbloecke. Zwei vor, dann die Drehung, dann noch zwei Paare —
    # das erste davon legt den Eck-Block. Belegt: x -9 bis -8, z -9 bis -7.
    # Blick Sueden: Bloecke bei (-9,-9), (-9,-8), Ecke (-9,-7); LEFT_TURN zeigt nach Osten, der
    # vierte Block liegt bei (-8,-7). Deshalb Start x=-9 (bis 16.09.2026: x=-8 mit "NORTH").
    agent.teleport(world(-9, 5, -9), SOUTH)
    agent.set_item(GRASS, 64, 1)
    agent.move(FORWARD, 1)
    agent.place(BACK)
    agent.move(FORWARD, 1)
    agent.place(BACK)
    agent.turn(LEFT_TURN)
    agent.move(FORWARD, 1)
    agent.place(BACK)
    agent.move(FORWARD, 1)
    agent.place(BACK)

def bau_turm():
    # Wie Station s03 (DS 3): 3 Steinbloecke hoch. agent.place(FORWARD) legt vor den Agent —
    # der Turm steht deshalb auf 2/5/-8, ein Feld suedlich (+z) vom Startfeld.
    agent.teleport(world(2, 5, -9), SOUTH)
    agent.set_item(STONE, 64, 1)
    agent.place(FORWARD)
    agent.move(UP, 1)
    agent.place(FORWARD)
    agent.move(UP, 1)
    agent.place(FORWARD)

def bau_mauer():
    # Wie Station s04 (DS 4): 10 Bruchstein in einer Reihe nach Sueden (+z), eine Schleife.
    # Belegt: x -8, z -2 bis 7. Sie kreuzt nichts — die naechsten Bauten stehen 5 Felder weg.
    agent.teleport(world(-8, 5, -2), SOUTH)
    agent.set_item(COBBLESTONE, 64, 1)
    for index in range(10):
        agent.move(FORWARD, 1)
        agent.place(BACK)

def bau_wand():
    # Wie Station s05 (DS 5), korrigiert: Wand 6 breit, 3 hoch = 18 Bruchstein. Ohne das
    # agent.move(FORWARD, 1) nach den zwei Drehungen entsteht eine Treppe statt einer Wand.
    # Belegt: x -3, z -8 bis -3, y 5 bis 7.
    # Zwei Linksdrehungen = halbe Drehung, die Seite spielt keine Rolle: Reihe 1 und 3 nach Sueden,
    # Reihe 2 nach Norden, alle auf x=-3, z -8 bis -3.
    agent.teleport(world(-3, 5, -8), SOUTH)
    agent.set_item(COBBLESTONE, 64, 1)
    for index in range(3):
        for index2 in range(6):
            agent.move(FORWARD, 1)
            agent.place(BACK)
        agent.move(UP, 1)
        agent.turn(LEFT_TURN)
        agent.turn(LEFT_TURN)
        agent.move(FORWARD, 1)

def bau_ring():
    # Wie Station s06 (DS 6, "haus"): Ring aus 4 Seiten mit je 5 Eichenbrettern = 20 Bloecke,
    # eine Ebene hoch. Der Umriss ist 6x6 Felder, weil sich die Ecken zwei Seiten teilen.
    # Belegt: x 3 bis 8, z -3 bis 2 — weit weg von Spawn (0/5/0) und von beiden Wegmarken.
    # Blick Sueden, Linksdrehungen: Seite 1 x=3 nach Sueden (z -3 bis 1), Seite 2 z=2 nach Osten
    # (x 3 bis 7), Seite 3 x=8 nach Norden (z 2 bis -2), Seite 4 z=-3 nach Westen (x 8 bis 4).
    # Deshalb Start x=3 (bis 16.09.2026: x=8 mit "NORTH").
    agent.teleport(world(3, 5, -3), SOUTH)
    agent.set_item(PLANKS_OAK, 64, 1)
    for index in range(4):
        for index2 in range(5):
            agent.move(FORWARD, 1)
            agent.place(BACK)
        agent.turn(LEFT_TURN)

def on_bau():
    bau_plattform()
    bau_wegmarken()
    bau_weg()
    bau_turm()
    bau_mauer()
    bau_wand()
    bau_ring()
player.on_chat("bau", on_bau)

def bau_fluss():
    # Stelle A 5 breit (z 12..16), Stelle B 8 breit (z 12..19), je 2 tief (y 3..4), zusammen x -12..11.
    # Der Fluss liegt suedlich (+z) der Goldmarken: Blick nach Sueden = Wasser direkt vorn.
    blocks.fill(WATER, world(-12, 3, 12), world(-1, 4, 16), FillOperation.REPLACE)
    blocks.fill(WATER, world(0, 3, 12), world(11, 4, 19), FillOperation.REPLACE)
    blocks.place(GOLD_BLOCK, world(-6, 4, 11))
    blocks.place(GOLD_BLOCK, world(6, 4, 11))

def bau_schlucht():
    # 7 breit (z 26..32), 6 tief (y -1..4), x -12..11. Die Plattform (s08) fuellt y=4, z 26..32.
    blocks.fill(AIR, world(-12, -1, 26), world(11, 4, 32), FillOperation.REPLACE)
    blocks.place(GOLD_BLOCK, world(0, 4, 25))

def bau_klippen():
    # Klippe 1: 10x10, 6 hoch (y 5..10). Treppe (s09) von (-18, 4, 43) endet auf y=10 neben x=-12.
    blocks.fill(STONE, world(-12, 5, 40), world(-3, 10, 49), FillOperation.REPLACE)
    blocks.place(GOLD_BLOCK, world(-18, 4, 43))
    # Klippe 2 (Boss-Check): 10x10, 4 hoch (y 5..8), ohne Schild. Leiter an der Westseite von Hand.
    blocks.fill(STONE, world(3, 5, 40), world(12, 8, 49), FillOperation.REPLACE)
    blocks.place(GOLD_BLOCK, world(-1, 4, 43))

def on_erkunden():
    bau_fluss()
    bau_schlucht()
    bau_klippen()
player.on_chat("erkunden", on_erkunden)

# --- parcours start ---
def bau_parcours_ecke():
    # Gang 1 breit, knickt nach Osten ab (links bei Blick nach Sueden). 20 Durchlaeufe von ecke
    # enden ueber der zweiten Goldmarke (Simulator-Test).
    blocks.fill(STONE, world(-22, 5, 56), world(-10, 6, 67), FillOperation.REPLACE)
    blocks.fill(AIR, world(-21, 5, 56), world(-21, 6, 66), FillOperation.REPLACE)
    blocks.fill(AIR, world(-20, 5, 66), world(-11, 6, 66), FillOperation.REPLACE)
    blocks.place(GOLD_BLOCK, world(-21, 4, 56))
    blocks.place(GOLD_BLOCK, world(-11, 4, 66))

def bau_parcours_loecher():
    # 10 Felder, 4 Loecher je 2 tief, Wand bei z=67. loecher braucht 14 Durchlaeufe.
    blocks.fill(STONE, world(-5, 5, 56), world(-3, 6, 67), FillOperation.REPLACE)
    blocks.fill(AIR, world(-4, 5, 56), world(-4, 6, 66), FillOperation.REPLACE)
    blocks.fill(AIR, world(-4, 3, 58), world(-4, 4, 58), FillOperation.REPLACE)
    blocks.fill(AIR, world(-4, 3, 60), world(-4, 4, 61), FillOperation.REPLACE)
    blocks.fill(AIR, world(-4, 3, 64), world(-4, 4, 64), FillOperation.REPLACE)
    blocks.place(GOLD_BLOCK, world(-4, 4, 56))

def bau_parcours_ziel():
    # 20 Felder, 6 Loecher, Wand bei z=77. ziel laeuft bis z=76.
    blocks.fill(STONE, world(3, 5, 56), world(5, 6, 77), FillOperation.REPLACE)
    blocks.fill(AIR, world(4, 5, 56), world(4, 6, 76), FillOperation.REPLACE)
    blocks.fill(AIR, world(4, 3, 59), world(4, 4, 59), FillOperation.REPLACE)
    blocks.fill(AIR, world(4, 3, 62), world(4, 4, 63), FillOperation.REPLACE)
    blocks.fill(AIR, world(4, 3, 67), world(4, 4, 67), FillOperation.REPLACE)
    blocks.fill(AIR, world(4, 3, 71), world(4, 4, 72), FillOperation.REPLACE)
    blocks.place(GOLD_BLOCK, world(4, 4, 56))

def bau_parcours_boss():
    # Boss-Check Gold: Redstone-Block bei z=68, Sicherheitswand bei z=79. Kein Schild mit Zahlen.
    blocks.fill(STONE, world(11, 5, 56), world(13, 6, 79), FillOperation.REPLACE)
    blocks.fill(AIR, world(12, 5, 56), world(12, 6, 78), FillOperation.REPLACE)
    blocks.fill(AIR, world(12, 3, 58), world(12, 4, 58), FillOperation.REPLACE)
    blocks.fill(AIR, world(12, 3, 61), world(12, 4, 61), FillOperation.REPLACE)
    blocks.fill(AIR, world(12, 3, 65), world(12, 4, 65), FillOperation.REPLACE)
    blocks.fill(AIR, world(12, 3, 71), world(12, 4, 71), FillOperation.REPLACE)
    blocks.place(GOLD_BLOCK, world(12, 4, 56))
    blocks.place(REDSTONE_BLOCK, world(12, 4, 68))

def on_parcours():
    bau_parcours_ecke()
    bau_parcours_loecher()
    bau_parcours_ziel()
    bau_parcours_boss()
player.on_chat("parcours", on_parcours)
# --- parcours ende ---
