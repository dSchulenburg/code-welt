# Entwurf, im Editor gegenpruefen (minecraft.makecode.com, Bloecke -> Python).
#
# MakeCode-Python fuer die Welt "codewelt-ankunft" (Flachwelt "Grasebene"). Baut auf das
# Zauberwort "bau": Startplattform, Wegmarken und die fuenf Beispielbauten aus den Stationen
# DS 2 bis DS 6 (Weg, Turm, Mauer, Wand, Ring). Die Koordinaten muessen zur Tabelle in
# content/lehrkraft/01-welt-ankunft.md passen — wer eine Zahl hier aendert, aendert sie auch dort.
#
# Die Blickrichtung des Agents nach agent.teleport(...) ist nicht verifiziert dokumentiert.
# Im Editor pruefen: falls der Agent nicht wie angenommen nach Norden (+Z) schaut, vor jedem
# Bau zusaetzliche agent.turn(LEFT_TURN)-Zeilen ergaenzen, bis die Blickrichtung stimmt.
#
# Wand-Korrektur aus dem Task-5-Review (03.09.2026): Ohne das agent.move(FORWARD, 1) nach den
# zwei Drehungen baut die Schleife eine versetzte Treppe statt einer geraden Wand — der Agent
# steht nach der 180-Grad-Drehung neben der zuletzt gebauten Reihe, nicht mehr auf ihrer Linie.

def bau_plattform():
    # Startplattform 20x20 aus Stein, Oberflaeche bei y=4 (Startzone bei 0/4/0 laut Bauplan).
    blocks.fill(STONE, world(-10, 4, -10), world(9, 4, 9), FillOperation.REPLACE)

def bau_wegmarken():
    # Ein Goldblock alle 5 Bloecke entlang x=0, von der Spawn-Markierung bis zum Rand des
    # Erkunden-Bereichs (Etappe Eisen, ab z=10 unbebaut).
    blocks.place(GOLD_BLOCK, world(0, 4, 0))
    blocks.place(GOLD_BLOCK, world(0, 4, 5))
    blocks.place(GOLD_BLOCK, world(0, 4, 10))

def bau_weg():
    # Wie Station s02 (DS 2): 3 Grasbloecke, 2 vor, dann eine Ecke, dann 1 vor.
    agent.teleport(world(-8, 4, -8))
    agent.set_item(GRASS, 64, 1)
    agent.move(FORWARD, 1)
    agent.place(BACK)
    agent.move(FORWARD, 1)
    agent.place(BACK)
    agent.turn(LEFT_TURN)
    agent.move(FORWARD, 1)
    agent.place(BACK)

def bau_turm():
    # Wie Station s03 (DS 3): 3 Steinbloecke hoch.
    agent.teleport(world(-8, 4, -2))
    agent.set_item(STONE, 64, 1)
    agent.place(FORWARD)
    agent.move(UP, 1)
    agent.place(FORWARD)
    agent.move(UP, 1)
    agent.place(FORWARD)

def bau_mauer():
    # Wie Station s04 (DS 4): 10 Bruchstein in einer Reihe, eine Schleife.
    agent.teleport(world(-2, 4, -8))
    agent.set_item(COBBLESTONE, 64, 1)
    for index in range(10):
        agent.move(FORWARD, 1)
        agent.place(BACK)

def bau_wand():
    # Wie Station s05 (DS 5), korrigiert: Wand 6 breit, 3 hoch = 18 Bruchstein. Ohne das
    # agent.move(FORWARD, 1) nach den zwei Drehungen entsteht eine Treppe statt einer Wand.
    agent.teleport(world(3, 4, -8))
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
    agent.teleport(world(3, 4, 0))
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
