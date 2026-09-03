// Stuetz-Ebene, kanonische Quelle. Alle anderen Sprachdateien werden aus dieser Datei
// erzeugt (scripts/translate.mjs) und haben dieselbe Form.
// Regeln: einfache Sprache (A2/B1), kurze Saetze. Code-Woerter (agent.move, FORWARD)
// bleiben wie sie sind. Platzhalter wie {n} bleiben in jeder Sprache erhalten.
export default {
  ui: {
    appTitle: 'Code-Welt',
    tagline: 'Der Agent versteht nur Code.',
    home: 'Übersicht',
    station: 'Station {n}',
    ds: 'Doppelstunde {n}',
    support: 'In deiner Sprache',
    supportShow: 'Hilfe in deiner Sprache anzeigen',
    supportHide: 'Hilfe ausblenden',
    storyHeading: 'Die Geschichte',
    conceptHeading: 'Die Idee',
    bridgeGame: 'Im Spiel',
    bridgeCode: 'Im Code',
    blocksLabel: 'So sieht es als Blöcke aus',
    pythonLabel: 'So sieht es als Python aus',
    tasksHeading: 'Deine Aufgaben im Spiel',
    taskAuftrag: 'Auftrag',
    taskNochEiner: 'Noch einer',
    taskRemix: 'Remix',
    tipsHeading: 'Tipp-Leiter',
    tipStep: 'Tipp {n}',
    tipSolution: 'Lösung',
    tipRemixNote: 'Wenn du die Lösung nimmst: Ändere danach eine Sache. Das ist Pflicht.',
    check: 'Check',
    checkHeading: 'Verstanden?',
    predictPrompt: 'Wo steht der Agent am Ende? Klicke auf das Feld.',
    predictRight: 'Richtig! Der Agent steht genau da.',
    predictWrong: 'Noch nicht. Lies das Programm von oben nach unten. Wohin zeigt die Nase?',
    parsonsPrompt: 'Bring die Zeilen in die richtige Reihenfolge.',
    parsonsUp: 'nach oben',
    parsonsDown: 'nach unten',
    parsonsCheck: 'Prüfen',
    parsonsRight: 'Richtig! Das ist die Reihenfolge.',
    parsonsWrong: 'Noch nicht. Was muss der Agent zuerst tun?',
    spielstandHeading: 'Spielstand',
    spielstandPrompt: 'Was kannst du jetzt? Schreib drei kurze Sätze.',
    spielstandSave: 'Speichern',
    spielstandSaved: 'Gespeichert. Nur auf diesem Gerät.',
    progress: 'Du hast {done} von {total} Stationen besucht.',
    next: 'Weiter',
    prev: 'Zurück',
    play: 'Vorlesen',
    langLabel: 'Sprache',
    footer: 'Ein Lernmodul von Dirk Schulenburg · CC BY 4.0 · Kein offizielles Minecraft-Produkt.',
    bossCheckHeading: 'Boss-Check',
    bossCheckHint: 'Löse die Aufgabe ohne Tipp-Leiter. Gib den Share-Link ab und schreibe drei Sätze.',
  },

  glossary: {
    befehl: { term: 'Befehl', short: 'Eine Zeile Code. Der Agent macht genau das.' },
    programm: { term: 'Programm', short: 'Viele Befehle, von oben nach unten.' },
    sequenz: { term: 'Sequenz', short: 'Die Reihenfolge der Befehle.' },
    agent: { term: 'Agent', short: 'Der Roboter in Minecraft. Er versteht nur Code.' },
    zauberwort: { term: 'Zauberwort', short: 'Ein Wort im Chat. Es startet dein Programm.' },
    python: { term: 'Python', short: 'Eine Programmiersprache. Dein Code als Text.' },
    bloecke: { term: 'Blöcke', short: 'Dein Code als Bausteine zum Ziehen.' },
    fehler: { term: 'Fehler', short: 'Der Agent hat dich falsch verstanden. Du kannst es reparieren.' },
  },

  etappen: {
    holz: { name: 'Holz', badge: { name: 'Holz', description: 'Du hast alle Checks der Etappe Holz bestanden und den Boss-Check abgegeben.' } },
    stein: { name: 'Stein', badge: { name: 'Stein', description: 'Du hast alle Checks der Etappe Stein bestanden und den Boss-Check abgegeben.' } },
    eisen: { name: 'Eisen', badge: { name: 'Eisen', description: 'Du hast alle Checks der Etappe Eisen bestanden und den Boss-Check abgegeben.' } },
    gold: { name: 'Gold', badge: { name: 'Gold', description: 'Du hast alle Checks der Etappe Gold bestanden und den Boss-Check abgegeben.' } },
    diamant: { name: 'Diamant', badge: { name: 'Diamant', description: 'Du hast alle Checks der Etappe Diamant bestanden und den Boss-Check abgegeben.' } },
    netherite: { name: 'Netherite', badge: { name: 'Netherite', description: 'Du hast alle Checks der Etappe Netherite bestanden und den Boss-Check abgegeben.' } },
    enderdrache: { name: 'Enderdrache', badge: { name: 'Enderdrache', description: 'Du hast alle Checks der Etappe Enderdrache bestanden und den Boss-Check abgegeben.' } },
  },

  stations: {
    s02: {
      title: 'Reihenfolge zählt',
      storyShort: 'Der Agent macht Befehle genau in der Reihenfolge, wie du sie schreibst. Erst gehen, dann drehen ist nicht dasselbe wie erst drehen, dann gehen.',
      bridge: {
        game: 'Der Agent geht Schritt für Schritt und legt hinter sich Blöcke ab.',
        code: 'Ein Programm ist eine Liste von Befehlen. Der Computer macht sie von oben nach unten.',
      },
      tasks: [
        { kind: 'auftrag', title: 'Der Weg', text: 'Schreibe das Zauberwort weg in den Chat. Der Agent legt drei Blöcke. Schau genau: Wo ist die Ecke?' },
        { kind: 'nochEiner', title: 'Länger', text: 'Ändere das Programm. Der Agent soll fünf Blöcke legen, dann um die Ecke, dann noch zwei.' },
        { kind: 'remix', title: 'Dein Muster', text: 'Baue ein eigenes Muster aus Blöcken. Zum Beispiel ein Z oder ein U. Zeig es deinem Partner oder deiner Partnerin.' },
      ],
      tipSolution: 'Für fünf Blöcke: Schreibe agent.move(FORWARD, 1) und agent.place(BACK) fünfmal. Dann agent.turn(LEFT_TURN). Dann noch zweimal move und place.',
      exercises: [
        { prompt: 'Der Agent steht unten in der Mitte. Seine Nase zeigt nach oben. Das Programm: 2 Schritte vor, links drehen, 1 Schritt vor.' },
        { prompt: 'Der Agent soll zu dir kommen, zwei Schritte gehen, links drehen und noch einen Schritt gehen.' },
      ],
      quiz: [
        {
          q: 'Der Agent soll 3 Schritte gehen und dann nach links drehen. Welche Reihenfolge ist richtig?',
          answers: [
            { text: 'Erst agent.move(FORWARD, 3), dann agent.turn(LEFT_TURN)', correct: true },
            { text: 'Erst agent.turn(LEFT_TURN), dann agent.move(FORWARD, 3)', correct: false },
            { text: 'Die Reihenfolge ist egal', correct: false },
          ],
        },
        {
          q: 'Du schreibst agent.move(FORWARD, 3) zweimal untereinander. Was macht der Agent?',
          answers: [
            { text: 'Er geht 6 Schritte', correct: true },
            { text: 'Er geht 3 Schritte', correct: false },
            { text: 'Er meldet einen Fehler', correct: false },
          ],
        },
        {
          q: 'Wann startet dein Programm?',
          answers: [
            { text: 'Wenn du das Zauberwort in den Chat schreibst', correct: true },
            { text: 'Sofort, wenn du den Code Builder öffnest', correct: false },
            { text: 'Wenn du den Agent anklickst', correct: false },
          ],
        },
        {
          q: 'Der Agent versteht …',
          answers: [
            { text: 'nur Code', correct: true },
            { text: 'Deutsch und Englisch', correct: false },
            { text: 'jede Sprache', correct: false },
          ],
        },
      ],
    },
  },
};
