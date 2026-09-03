// Leit-Ebene: nur Deutsch, einfache Sprache (A2/B1). Kurze Saetze. Ein Gedanke pro Satz.
// Dialog: Nour war letztes Jahr im Kurs. Dani ist neu und fragt, was alle fragen.
export default {
  stations: {
    s02: {
      story: [
        { who: 'dani', text: 'Gestern habe ich dem Agent gesagt: Geh los! Er hat nichts gemacht.' },
        { who: 'nour', text: 'Klar. Der Agent versteht kein Deutsch. Nur Code.' },
        { who: 'dani', text: 'Und wenn ich ihm drei Befehle gebe?' },
        { who: 'nour', text: 'Dann macht er sie. Einen nach dem anderen. Genau in der Reihenfolge.' },
        { who: 'dani', text: 'Also ist die Reihenfolge wichtig?' },
        { who: 'nour', text: 'Sehr wichtig. Erst gehen, dann drehen ist etwas anderes als erst drehen, dann gehen. Probier es aus.' },
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
  },
};
