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
  },
};
