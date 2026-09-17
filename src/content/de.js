// Leit-Ebene: nur Deutsch, einfache Sprache (A2/B1). Kurze Saetze. Ein Gedanke pro Satz.
// Dialog: Nour war letztes Jahr im Kurs. Dani ist neu und fragt, was alle fragen.
export default {
  stations: {
    s01: {
      story: [
        { who: 'dani', mood: 'begeistert', text: 'Wir sind in der neuen Welt! Alles ist flach und leer.' },
        { who: 'nour', mood: 'erklaerend', text: 'Da vorne steht der Agent. Er ist dein Roboter im Spiel.' },
        { who: 'dani', mood: 'ueberrascht', text: 'Hallo Agent, komm her! Er macht nichts. Er steht nur da.' },
        { who: 'nour', mood: 'erklaerend', text: 'Er hört dich nicht. Der Agent versteht nur Code.' },
        { who: 'dani', mood: 'fragend', text: 'Und wie sage ich ihm dann etwas?' },
        { who: 'nour', mood: 'begeistert', text: 'Mit einem Zauberwort im Chat. Ich zeige es dir.' },
      ],
      concept: [
        'Der Agent ist dein Roboter in Minecraft. Er geht, dreht sich und legt Blöcke. Er macht nur das, was im Code steht.',
        'Deinen Code schreibst du im Code Builder. Du öffnest ihn mit der Taste C. Dort wählst du Blöcke oder Python.',
        'Ein Befehl ist eine Zeile Code. agent.move(FORWARD, 1) heißt: Geh einen Schritt vor. Jede Zeile macht genau eine Sache.',
        'In Python steht das Zauberwort ganz unten. In den Blöcken sitzt es ganz oben. Hier ist es hi. Du tippst hi in den Chat. Erst dann läuft dein Programm.',
      ],
      tips: [
        'Frage: Hast du das Zauberwort in den Chat geschrieben? Ohne Chat startet nichts.',
        'Richtung: Der Agent geht dahin, wohin seine Nase zeigt. Stell dich hinter ihn und schau mit.',
        'Gerüst: Erst agent.teleport_to_player(), dann agent.move(FORWARD, ___). Setze die Zahl ein.',
      ],
    },
    s02: {
      story: [
        { who: 'dani', mood: 'ueberrascht', text: 'Gestern habe ich dem Agenten gesagt: Geh los! Er hat nichts gemacht.' },
        { who: 'nour', mood: 'erklaerend', text: 'Klar. Der Agent versteht kein Deutsch. Nur Code.' },
        { who: 'dani', mood: 'fragend', text: 'Und wenn ich ihm drei Befehle gebe?' },
        { who: 'nour', mood: 'erklaerend', text: 'Dann macht er sie. Einen nach dem anderen. Genau in der Reihenfolge.' },
        { who: 'dani', mood: 'begeistert', text: 'Also ist die Reihenfolge wichtig?' },
        { who: 'nour', mood: 'nachdenklich', text: 'Sehr wichtig. Erst gehen, dann drehen ist etwas anderes als erst drehen, dann gehen. Probier es aus.' },
      ],
      concept: [
        'Ein Programm ist eine Liste von Befehlen. Der Agent liest die Liste von oben nach unten.',
        'Er macht jeden Befehl genau einmal. Dann kommt der nächste Befehl.',
        'Das nennt man eine Sequenz. Sequenz heißt: Reihenfolge.',
        'Der Agent legt den Block hinter sich. Er geht erst einen Schritt. Dann legt er den Block in das alte Feld. Nach dem Drehen legt der Agent zuerst den Eck-Block. Dann geht es in die neue Richtung.',
        'Der Agent denkt nicht mit. Wenn die Reihenfolge falsch ist, geht er falsch. Das ist kein Fehler von dir. Das ist ein Missverständnis. Du kannst es reparieren.',
      ],
      tips: [
        'Frage: Was macht der Agent zuerst? Lies dein Programm von oben nach unten.',
        'Richtung: Der Agent geht, wohin seine Nase zeigt. Nach agent.turn(LEFT_TURN) zeigt die Nase nach links.',
        'Gerüst: Erst agent.move(FORWARD, ___), dann agent.turn(___), dann agent.move(FORWARD, ___). Setze die Zahlen ein.',
      ],
    },
    s03: {
      story: [
        { who: 'dani', mood: 'begeistert', text: 'Ich will zwei Sachen bauen. Einen Weg und einen Turm.' },
        { who: 'nour', mood: 'erklaerend', text: 'Dann nimm zwei Zauberwörter. Jedes Wort startet ein eigenes Programm.' },
        { who: 'dani', mood: 'fragend', text: 'Und wenn ich beide Wörter sage?' },
        { who: 'nour', mood: 'erklaerend', text: 'Dann laufen beide Programme. Eins nach dem anderen.' },
        { who: 'dani', mood: 'nachdenklich', text: 'Gut. Dann baue ich erst den Weg und dann den Turm.' },
      ],
      concept: [
        'Ein Ereignis ist: Etwas passiert im Spiel. Zum Beispiel schreibst du ein Wort in den Chat. Dann startet ein Programm.',
        'Du kannst mehrere Ereignisse haben. Jedes Zauberwort ist ein eigenes Ereignis. Die Programme stehen nebeneinander und stören sich nicht.',
        'In den Blöcken siehst du das gut. Jedes Zauberwort hat einen eigenen Hut-Block. Unter dem Hut steht sein Programm.',
      ],
      tips: [
        'Frage: Welches Zauberwort hast du getippt? Nur dieses eine Programm läuft.',
        'Richtung: Der Turm wächst nach oben. Dafür brauchst du agent.move(UP, 1).',
        'Gerüst: agent.place(FORWARD), dann agent.move(UP, 1). Wiederhole beide Zeilen, bis der Turm hoch genug ist.',
      ],
    },
    s04: {
      story: [
        { who: 'dani', mood: 'ueberrascht', text: 'Es wird dunkel. Gleich kommen die Monster!' },
        { who: 'nour', mood: 'erklaerend', text: 'Dann bauen wir eine Mauer. Zehn Blöcke lang.' },
        { who: 'dani', mood: 'nachdenklich', text: 'Gut. Ich schreibe die zwei Zeilen zehnmal untereinander.' },
        { who: 'dani', mood: 'ueberrascht', text: 'Das sind zwanzig Zeilen. Das dauert ewig!' },
        { who: 'nour', mood: 'erklaerend', text: 'Stopp. Dafür gibt es die Schleife.' },
        { who: 'nour', mood: 'erklaerend', text: 'Du schreibst die Zeilen einmal. Der Computer wiederholt sie zehnmal.' },
        { who: 'dani', mood: 'begeistert', text: 'Zwei Zeilen statt zwanzig? Das will ich sehen.' },
      ],
      concept: [
        'Eine Schleife wiederholt Befehle. Du schreibst sie nur einmal. Der Computer macht sie viele Male.',
        'In Python heißt das: range(10). Das bedeutet zehnmal. Der Computer zählt dabei von 0 bis 9.',
        'Computer fangen beim Zählen oft bei 0 an. Null ist die erste Runde, neun ist die zehnte. Zusammen sind das zehn Runden.',
        'In den Blöcken hat die Schleife einen Bauch. Was im Bauch liegt, wird wiederholt. In Python macht das die Einrückung. Im Blockeditor heißt die Schleife auch repeat 10 times. Wir nehmen for, weil es wie Python aussieht.',
      ],
      tips: [
        'Frage: Ist deine Mauer zu kurz? Schau auf die Zahl in der Schleife.',
        'Richtung: Der Agent legt den Block hinter sich. Er geht erst vor, dann legt er ihn.',
        'Gerüst: for index in range(___): und darunter eingerückt agent.move(FORWARD, 1) und agent.place(BACK).',
      ],
    },
    s05: {
      story: [
        { who: 'dani', mood: 'nachdenklich', text: 'Die Mauer ist gut. Aber sie ist nur eine Reihe hoch.' },
        { who: 'dani', mood: 'fragend', text: 'Ich will eine richtige Wand. Wie geht das?' },
        { who: 'nour', mood: 'erklaerend', text: 'Ganz einfach. Du wiederholst die ganze Reihe mehrmals.' },
        { who: 'dani', mood: 'fragend', text: 'Also eine Schleife in der Schleife?' },
        { who: 'nour', mood: 'begeistert', text: 'Genau. Die innere Schleife baut eine Reihe.' },
        { who: 'nour', mood: 'erklaerend', text: 'Die äußere Schleife geht hoch und dreht den Agenten um.' },
        { who: 'dani', mood: 'begeistert', text: 'Drei Reihen übereinander. Das probiere ich sofort!' },
      ],
      concept: [
        'Eine Schleife kann in einer anderen Schleife stehen. Das nennt man verschachtelte Schleifen.',
        'Die innere Schleife baut eine Reihe. Sie legt sechs Blöcke nebeneinander.',
        'Die äußere Schleife wiederholt die ganze Reihe. Danach geht der Agent eine Ebene hoch.',
        'Zweimal links drehen ist eine halbe Drehung. Der Agent schaut dann zurück. Ein Schritt vor bringt ihn wieder über die Reihe. Die Einrückung zeigt dir, was innen und was außen ist.',
      ],
      tips: [
        'Frage: Wie viele Reihen baut der Agent? Schau auf die Zahl in der äußeren Schleife.',
        'Richtung: Nach einer Reihe steht der Agent falsch herum. Zweimal agent.turn(LEFT_TURN) dreht ihn zurück. Ein Schritt vor bringt ihn über die Reihe.',
        'Gerüst: Schreibe for index in range(___): als äußere Schleife. Darunter eingerückt kommt for index2 in range(___): als innere Schleife.',
      ],
    },
    s06: {
      story: [
        { who: 'dani', mood: 'begeistert', text: 'Ich habe eine Wand. Jetzt will ich ein Haus!' },
        { who: 'dani', mood: 'nachdenklich', text: 'Ein Haus hat vier Wände. Ich kopiere die Schleife viermal.' },
        { who: 'nour', mood: 'erklaerend', text: 'Warte. Das sind wieder viele gleiche Zeilen.' },
        { who: 'dani', mood: 'fragend', text: 'Und was mache ich stattdessen?' },
        { who: 'nour', mood: 'erklaerend', text: 'Du legst eine Schleife außen herum. Sie läuft viermal.' },
        { who: 'nour', mood: 'begeistert', text: 'Nach jeder Seite dreht sich der Agent. Dann steht er richtig für die nächste Seite.' },
        { who: 'dani', mood: 'ueberrascht', text: 'Eine Drehung reicht? Das ist clever.' },
      ],
      concept: [
        'Ein Ring hat vier Seiten. Jede Seite ist gleich lang. Der Ring ist zuerst nur einen Block hoch. Bei "Noch einer" machst du ihn höher.',
        'Die innere Schleife baut eine Seite. Die äußere Schleife wiederholt das viermal.',
        'Nach jeder Seite kommt eine Drehung. agent.turn(LEFT_TURN) dreht den Agenten um die Ecke.',
        'Die Drehung steht in der äußeren Schleife. Sie ist weniger eingerückt als move und place. Deshalb kommt sie erst nach der ganzen Seite.',
      ],
      tips: [
        'Frage: Wie viele Seiten hat dein Ring? Schau auf die Zahl in der äußeren Schleife.',
        'Richtung: Nach jeder Seite dreht der Agent einmal. agent.turn(LEFT_TURN) macht die Ecke.',
        'Gerüst: Lege eine dritte Schleife ganz außen. Der ganze Ring steht eingerückt darin.',
      ],
    },
    s07: {
      story: [
        { who: 'dani', mood: 'begeistert', text: 'Ich will die Welt erkunden! Südlich liegt ein Fluss.' },
        { who: 'dani', mood: 'nachdenklich', text: 'Ich baue mit fünf move- und place-Paaren. An Stelle B sind es acht.' },
        { who: 'nour', mood: 'erklaerend', text: 'Gib der Zahl einen Namen. laenge = 5.' },
        { who: 'dani', mood: 'fragend', text: 'Und dann?' },
        { who: 'nour', mood: 'erklaerend', text: 'Die Schleife nutzt laenge. Du änderst nur eine Zeile.' },
        { who: 'nour', mood: 'begeistert', text: 'Schalte oben auf Python. Da siehst du die Zeile.' },
        { who: 'dani', mood: 'ueberrascht', text: 'Python sieht fast aus wie die Blöcke!' },
      ],
      concept: [
        'Eine Variable ist eine Zahl mit einem Namen. laenge steht für die Zahl 5.',
        'Du setzt sie einmal ganz oben. Danach benutzt du sie überall im Programm.',
        'range(laenge) zählt so oft, wie laenge groß ist. Ändert sich laenge, ändert sich die Anzahl.',
        'Der Umschalter im Editor zeigt Blöcke oder Python. Beide zeigen dasselbe Programm.',
      ],
      tips: [
        'Frage: Wie oft baut der Agent? Schau auf laenge.',
        'Richtung: Der Fluss ist 8 breit. Ändere nur eine Zeile.',
        'Gerüst: Schreibe laenge = ___ in die erste Zeile. Die Schleife bleibt for index in range(laenge): so stehen.',
      ],
    },
    s08: {
      story: [
        { who: 'dani', mood: 'ueberrascht', text: 'Die Schlucht ist sieben Blöcke weit und sechs tief.' },
        { who: 'dani', mood: 'nachdenklich', text: 'Eine Brücke aus Einzelblöcken dauert ewig.' },
        { who: 'nour', mood: 'erklaerend', text: 'Schalte die Koordinaten ein. Jeder Block hat drei Zahlen: x, y, z.' },
        { who: 'dani', mood: 'fragend', text: 'Und was ist y?' },
        { who: 'nour', mood: 'erklaerend', text: 'y ist die Höhe. x und z zeigen die Richtung.' },
        { who: 'nour', mood: 'begeistert', text: 'fill füllt alles zwischen zwei Ecken. Ein Befehl!' },
        { who: 'dani', mood: 'begeistert', text: 'Eine ganze Plattform mit einer Zeile!' },
      ],
      concept: [
        'Jeder Block hat drei Koordinaten: x, y und z. Die Anzeige im Spiel zeigt sie dir absolut.',
        'pos(x, y, z) zählt anders: von deinen Füßen aus. Das ist relativ, -1 ist unter dir.',
        'fill füllt den ganzen Quader zwischen zwei Ecken. Du sparst dir jeden Einzelblock.',
        'FillOperation.REPLACE ersetzt alles in diesem Quader, auch Luft. Nichts bleibt stehen.',
      ],
      tips: [
        'Frage: Wo ist y = -1? Unter dir oder über dir?',
        'Richtung: Die Plattform muss unter den Füßen liegen. Die zweite Ecke ist am anderen Rand.',
        'Gerüst: blocks.fill(PLANKS_OAK, pos(0, -1, 1), pos(___, -1, ___), FillOperation.REPLACE). Setze die zwei fehlenden Zahlen ein.',
      ],
    },
    s09: {
      story: [
        { who: 'dani', mood: 'ueberrascht', text: 'Die Klippe ist sechs Blöcke hoch!' },
        { who: 'dani', mood: 'nachdenklich', text: 'Ich brauche sechs Plattformen. Jede ist eins höher. Sind das sechs Zeilen?' },
        { who: 'nour', mood: 'erklaerend', text: 'Nein. Die Schleife zählt mit. index ist 0, dann 1, dann 2.' },
        { who: 'dani', mood: 'fragend', text: 'Und was bringt mir index?' },
        { who: 'nour', mood: 'erklaerend', text: 'Nimm index als Höhe. Stufe 0 ist 1 hoch, Stufe 5 ist 6 hoch.' },
        { who: 'nour', mood: 'begeistert', text: 'Eine Zeile, sechs Stufen.' },
        { who: 'dani', mood: 'begeistert', text: 'Und mit stufen = 9 wird die Treppe höher!' },
      ],
      concept: [
        'Der Zähler index ist eine Variable, die die Schleife selbst ändert.',
        'range(stufen) gibt index die Werte 0 bis stufen - 1.',
        'index steht in pos zweimal: x wandert, y wächst.',
        'stufen oben bestimmt, wie viele Stufen die Treppe hat.',
      ],
      tips: [
        'Frage: Welche Werte hat index bei range(6)?',
        'Richtung: Stufe index steht bei x = index. Sie ist index + 1 hoch. Deshalb steht index in pos zweimal.',
        'Gerüst: blocks.fill(COBBLESTONE, pos(index, 0, 1), pos(index, ___, 3), FillOperation.REPLACE).',
      ],
    },
    s10: {
      story: [
        { who: 'dani', mood: 'ueberrascht', text: 'Hinter den Klippen ist ein Parcours!' },
        { who: 'dani', mood: 'nachdenklich', text: 'Der Gang knickt ab. Aber wo? Ich sehe es nicht.' },
        { who: 'nour', mood: 'erklaerend', text: 'Der Agent kann nachsehen. detect prüft den Block vor ihm.' },
        { who: 'dani', mood: 'fragend', text: 'Und was macht er dann?' },
        { who: 'nour', mood: 'erklaerend', text: 'Mit if sagst du: Wenn vorn ein Block ist, dreh dich.' },
        { who: 'nour', mood: 'begeistert', text: 'Der Agent entscheidet jedes Mal neu.' },
        { who: 'dani', mood: 'begeistert', text: 'Er findet den Weg um die Ecke!' },
      ],
      concept: [
        'Eine Bedingung ist wahr oder falsch.',
        'agent.detect(AgentDetection.BLOCK, FORWARD) ist wahr, wenn vorn ein Block ist.',
        'if führt die eingerückten Zeilen nur aus, wenn die Bedingung wahr ist.',
        'Die Schleife läuft 20-mal. Jedes Mal prüft if neu.',
      ],
      tips: [
        'Frage: Was tut der Agent, wenn vorn kein Block ist?',
        'Richtung: Die Drehung steht unter if. Der Schritt steht außerhalb von if.',
        'Gerüst: if agent.detect(AgentDetection.BLOCK, ___): und darunter agent.turn(LEFT_TURN).',
      ],
    },
    s11: {
      story: [
        { who: 'dani', mood: 'ueberrascht', text: 'Auf dieser Bahn sind Löcher!' },
        { who: 'dani', mood: 'fragend', text: 'Soll der Agent gehen oder einen Block legen?' },
        { who: 'nour', mood: 'erklaerend', text: 'Beides, aber nie zugleich. Mit else sagst du: sonst.' },
        { who: 'nour', mood: 'erklaerend', text: 'Ist unten Boden, geht er. Sonst legt er einen Block.' },
        { who: 'dani', mood: 'nachdenklich', text: 'Die Bahn hat 10 Felder. Also range(10)?' },
        { who: 'nour', mood: 'nachdenklich', text: 'Probier es aus. Jedes Loch kostet einen Durchlauf mehr.' },
        { who: 'dani', mood: 'begeistert', text: 'Ich ändere die Zahl in Python. Jetzt kommt er an!' },
      ],
      concept: [
        'if und else sind zwei Wege. In jedem Durchlauf läuft genau einer.',
        'agent.detect(AgentDetection.BLOCK, DOWN) prüft den Block unter dem Agent.',
        'Ein Durchlauf ist ein Schritt oder ein Block, nie beides.',
        'Du änderst die Zahl direkt in Python. Die Blöcke ändern sich mit.',
      ],
      tips: [
        'Frage: Wie viele Schritte braucht der Agent? Wie viele Löcher gibt es?',
        'Richtung: Ein Loch braucht zwei Durchläufe: einen Block und einen Schritt.',
        'Gerüst: 10 Schritte plus 4 Blöcke. for index in range(___):',
      ],
    },
  },
};
