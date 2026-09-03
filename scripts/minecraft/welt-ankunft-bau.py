# Entwurf, im Editor gegenpruefen (minecraft.makecode.com, Bloecke -> Python).
#
# MakeCode-Python fuer die Welt "codewelt-ankunft" (Flachwelt "Grasebene"). Baut auf das
# Zauberwort "bau": Startplattform, Wegmarken und die fuenf Beispielbauten aus den Stationen
# DS 2 bis DS 6 (Weg, Turm, Mauer, Wand, Ring). Die Koordinaten muessen zur Tabelle in
# content/lehrkraft/01-welt-ankunft.md passen — wer eine Zahl hier aendert, aendert sie auch dort.
#
# Hoehen: die Plattform fuellt y=4. Wer darauf steht, steht auf y=5 — deshalb teleportiert der
# Agent auf y=5 und legt seine Bloecke auf y=5. Die Wegmarken sind die Ausnahme: sie liegen
# buendig in der Plattform (y=4, sie ersetzen dort den Stein), damit man ueber sie laufen kann.
#
# Blickrichtung: agent.teleport(world(x, y, z), NORTH) — der zweite Parameter ist die
# Blickrichtung. Alle Bauten starten nach Norden (+z) und wachsen von ihrem Startfeld nach vorn.
# Die Signatur ist aus der Doku uebernommen und nicht selbst getestet: Signatur im Editor
# pruefen. Nimmt der Editor den zweiten Parameter nicht an, teleportiere ohne ihn und dreh den
# Agent mit agent.turn(LEFT_TURN)-Zeilen, bis er nach Norden schaut.
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
    agent.teleport(world(-8, 5, -9), NORTH)
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
    # der Turm steht deshalb auf 2/5/-8, ein Feld noerdlich vom Startfeld.
    agent.teleport(world(2, 5, -9), NORTH)
    agent.set_item(STONE, 64, 1)
    agent.place(FORWARD)
    agent.move(UP, 1)
    agent.place(FORWARD)
    agent.move(UP, 1)
    agent.place(FORWARD)

def bau_mauer():
    # Wie Station s04 (DS 4): 10 Bruchstein in einer Reihe nach Norden, eine Schleife.
    # Belegt: x -8, z -2 bis 7. Sie kreuzt nichts — die naechsten Bauten stehen 5 Felder weg.
    agent.teleport(world(-8, 5, -2), NORTH)
    agent.set_item(COBBLESTONE, 64, 1)
    for index in range(10):
        agent.move(FORWARD, 1)
        agent.place(BACK)

def bau_wand():
    # Wie Station s05 (DS 5), korrigiert: Wand 6 breit, 3 hoch = 18 Bruchstein. Ohne das
    # agent.move(FORWARD, 1) nach den zwei Drehungen entsteht eine Treppe statt einer Wand.
    # Belegt: x -3, z -8 bis -3, y 5 bis 7.
    agent.teleport(world(-3, 5, -8), NORTH)
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
    agent.teleport(world(8, 5, -3), NORTH)
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
