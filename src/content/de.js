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
        'Im Python steht das Zauberwort ganz unten. In den Blöcken sitzt es ganz oben. Hier ist es hi. Du tippst hi in den Chat. Erst dann läuft dein Programm.',
      ],
      tips: [
        'Frage: Hast du das Zauberwort in den Chat geschrieben? Ohne Chat startet nichts.',
        'Richtung: Der Agent geht dahin, wohin seine Nase zeigt. Stell dich hinter ihn und schau mit.',
        'Gerüst: Erst agent.teleport_to_player(), dann agent.move(FORWARD, ___). Setze die Zahl ein.',
      ],
    },
    s02: {
      story: [
        { who: 'dani', mood: 'ueberrascht', text: 'Gestern habe ich dem Agent gesagt: Geh los! Er hat nichts gemacht.' },
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
  },
};
