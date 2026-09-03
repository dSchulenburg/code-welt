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
    s01: {
      title: 'Die neue Welt',
      storyShort: 'Der Agent ist dein Roboter in Minecraft. Er versteht kein Deutsch, nur Code. Er startet erst, wenn du ein Zauberwort in den Chat schreibst.',
      bridge: {
        game: 'Du tippst hi in den Chat. Der Agent kommt zu dir und geht einen Schritt.',
        code: 'Ein Befehl ist eine Zeile Code. Das Zauberwort startet das ganze Programm.',
      },
      tasks: [
        { kind: 'auftrag', title: 'Sag hi', text: 'Schreibe hi in den Chat. Der Agent kommt zu dir. Dann geht er einen Schritt vor.' },
        { kind: 'nochEiner', title: 'Dein Wort', text: 'Ändere das Zauberwort von hi zu hallo. Ändere die Schritte von 1 auf 3. Probier es aus.' },
        { kind: 'remix', title: 'Noch ein Wort', text: 'Erfinde ein zweites Zauberwort. Der Agent soll damit etwas anderes machen. Zeig es deinem Partner oder deiner Partnerin.' },
      ],
      tipSolution: 'Schreibe agent.teleport_to_player() und darunter agent.move(FORWARD, 3). In der letzten Zeile ersetzt du "hi" durch "hallo". Nur das Wort in den Anführungszeichen. Dann tippst du hallo in den Chat.',
      exercises: [
        { prompt: 'Der Agent steht unten in der Mitte. Seine Nase zeigt nach oben. Das Programm: 1 Schritt vor.' },
        { prompt: 'Der Agent soll zu dir kommen und einen Schritt gehen. Die Zeile mit dem Zauberwort kommt zum Schluss.' },
      ],
      quiz: [
        {
          q: 'Wozu ist das Zauberwort da?',
          answers: [
            { text: 'Es startet dein Programm', correct: true },
            { text: 'Es öffnet den Code Builder', correct: false },
            { text: 'Es speichert dein Programm', correct: false },
          ],
        },
        {
          q: 'Welche Taste öffnet den Code Builder?',
          answers: [
            { text: 'Die Taste C', correct: true },
            { text: 'Die Taste E', correct: false },
            { text: 'Die Taste T', correct: false },
          ],
        },
        {
          q: 'Was macht agent.teleport_to_player()?',
          answers: [
            { text: 'Der Agent kommt zu dir', correct: true },
            { text: 'Der Agent geht einen Schritt vor', correct: false },
            { text: 'Der Agent legt einen Block', correct: false },
          ],
        },
        {
          q: 'Der Agent versteht …',
          answers: [
            { text: 'nur Code', correct: true },
            { text: 'jedes Wort im Chat', correct: false },
            { text: 'Deutsch, wenn du langsam schreibst', correct: false },
          ],
        },
      ],
    },
    s02: {
      title: 'Reihenfolge zählt',
      storyShort: 'Der Agent macht Befehle genau in der Reihenfolge, wie du sie schreibst. Erst gehen, dann drehen ist nicht dasselbe wie erst drehen, dann gehen.',
      bridge: {
        game: 'Der Agent geht Schritt für Schritt und legt hinter sich Blöcke ab.',
        code: 'Ein Programm ist eine Liste von Befehlen. Der Computer macht sie von oben nach unten.',
      },
      tasks: [
        { kind: 'auftrag', title: 'Der Weg', text: 'Schreibe das Zauberwort weg in den Chat. Der Agent legt vier Blöcke. Schau genau: Wo ist die Ecke?' },
        { kind: 'nochEiner', title: 'Länger', text: 'Ändere das Programm. Der Agent legt fünf Blöcke geradeaus, dann die Ecke, dann noch zwei.' },
        { kind: 'remix', title: 'Dein Muster', text: 'Baue ein eigenes Muster aus Blöcken. Zum Beispiel ein Z oder ein U. Zeig es deinem Partner oder deiner Partnerin.' },
      ],
      tipSolution: 'Für fünf Blöcke: Schreibe agent.move(FORWARD, 1) und agent.place(BACK) fünfmal. Dann agent.turn(LEFT_TURN). Danach kommen noch drei Paare move und place. Das erste Paar legt den Eck-Block.',
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
            { text: 'Wenn du den Agenten anklickst', correct: false },
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
    s03: {
      title: 'Zauberwörter',
      storyShort: 'Ein Wort im Chat ist ein Ereignis. Jedes Zauberwort startet sein eigenes Programm. Du kannst mehrere Zauberwörter haben.',
      bridge: {
        game: 'Du tippst weg oder turm in den Chat. Der Agent baut den Weg oder den Turm.',
        code: 'Jedes Zauberwort hat einen eigenen Hut-Block. Darunter steht sein eigenes Programm.',
      },
      tasks: [
        { kind: 'auftrag', title: 'Zwei Wörter', text: 'Schreibe weg in den Chat. Dann schreibe turm. Der Weg ist hier kürzer als in Station 2. Schau dir beides genau an.' },
        { kind: 'nochEiner', title: 'Höher', text: 'Ändere das Programm für turm. Der Turm soll fünf Blöcke hoch werden.' },
        { kind: 'remix', title: 'Die Brücke', text: 'Erfinde ein drittes Zauberwort: bruecke. Zauberwörter haben keine Umlaute. Der Agent baut damit einen Weg über eine Lücke.' },
      ],
      tipSolution: 'Für fünf Blöcke schreibst du agent.place(FORWARD) und agent.move(UP, 1) abwechselnd. Am Ende kommt noch einmal agent.place(FORWARD). Zähle nach: fünf Zeilen mit place.',
      exercises: [
        { prompt: 'Der Agent steht unten links. Seine Nase zeigt nach oben. Das Programm: 2 Schritte vor, rechts drehen, 2 Schritte vor.' },
        { prompt: 'Der Agent kommt zu dir. Er nimmt Gras. Er geht einen Schritt und legt einen Block. Die Zeile mit dem Zauberwort kommt zum Schluss.' },
      ],
      quiz: [
        {
          q: 'Was ist ein Ereignis?',
          answers: [
            { text: 'Etwas passiert im Spiel, zum Beispiel ein Wort im Chat', correct: true },
            { text: 'Ein Fehler in deinem Programm', correct: false },
            { text: 'Ein Block, den der Agent legt', correct: false },
          ],
        },
        {
          q: 'Du hast zwei Zauberwörter. Wie viele Programme sind das?',
          answers: [
            { text: 'Zwei. Jedes Wort hat sein eigenes Programm', correct: true },
            { text: 'Eins. Beide Wörter starten dasselbe Programm', correct: false },
            { text: 'Keins. Zwei Zauberwörter gehen nicht', correct: false },
          ],
        },
        {
          q: 'Was macht agent.move(UP, 1)?',
          answers: [
            { text: 'Der Agent geht einen Block nach oben', correct: true },
            { text: 'Der Agent geht einen Schritt nach vorne', correct: false },
            { text: 'Der Agent legt einen Block über sich', correct: false },
          ],
        },
        {
          q: 'Du tippst erst weg, dann turm. Was passiert?',
          answers: [
            { text: 'Erst läuft das Programm für weg, dann das für turm', correct: true },
            { text: 'Beide Programme laufen gleichzeitig', correct: false },
            { text: 'Nur das Programm für turm läuft', correct: false },
          ],
        },
      ],
      bossCheck: {
        // Kurzer Titel wegen der Moodle-Spaltenlaenge (assign.name ist varchar(255), sieben
        // {mlang}-Bloecke sprengen das bei einem langen Titel — siehe Fix-Report Task 3b).
        // subtitle traegt den Rest, course-def.mjs setzt ihn fett vor den Aufgabentext.
        title: 'Boss-Check Holz',
        subtitle: 'Das L',
        // Ohne Tipp-Leiter, Share-Link und die drei Saetze stehen schon in ui.bossCheckHint;
        // course-def.mjs haengt den Hinweis hinter diese Aufgabe (sonst stuende alles doppelt da).
        task: 'Der Agent legt ein L: erst 4 Blöcke geradeaus, dann 2 um die Ecke. Was macht dein Programm? Warum ist die Reihenfolge wichtig? Was war schwer?',
      },
    },
    s04: {
      title: 'Wiederholen',
      storyShort: 'Zehnmal dasselbe zu schreiben ist mühsam. Dafür gibt es die Schleife. Du schreibst die Zeilen einmal. Der Computer wiederholt sie für dich.',
      bridge: {
        game: 'Du tippst mauer in den Chat. Der Agent legt zehn Blöcke in einer Reihe.',
        code: 'Eine Schleife wiederholt zwei Zeilen zehnmal. Du schreibst sie nur einmal.',
      },
      tasks: [
        { kind: 'auftrag', title: 'Die Mauer', text: 'Schreibe mauer in den Chat. Der Agent baut eine Mauer aus zehn Blöcken. Zähle die Blöcke nach.' },
        { kind: 'nochEiner', title: 'Länger und anders', text: 'Ändere die Zahl von 10 auf 20. Nimm eine andere Blockart, zum Beispiel Holz. Probier es aus.' },
        { kind: 'remix', title: 'Zwei Mauern', text: 'Baue zwei Mauern mit einer Lücke dazwischen. Zeig es deinem Partner oder deiner Partnerin.' },
      ],
      tipSolution: 'Schreibe for index in range(20): in die Schleifenzeile. Die zwei Zeilen darunter bleiben eingerückt. Für Holz nimmst du agent.set_item(PLANKS_OAK, 64, 1). Zähle nach: eine Schleife, zwei Zeilen im Bauch.',
      exercises: [
        { prompt: 'Der Agent steht unten in der Mitte. Seine Nase zeigt nach oben. Das Programm: 3 Schritte vor.' },
        { prompt: 'Der Agent kommt zu dir und nimmt Bruchstein. Dann wiederholt die Schleife zwei Zeilen. Die Einrückung gehört zur Zeile.' },
      ],
      quiz: [
        {
          q: 'Was spart die Schleife?',
          answers: [
            { text: 'Viele gleiche Zeilen', correct: true },
            { text: 'Blöcke im Rucksack', correct: false },
            { text: 'Platz in der Welt', correct: false },
          ],
        },
        {
          q: 'Wie oft läuft eine Schleife mit range(10)?',
          answers: [
            { text: 'Zehnmal', correct: true },
            { text: 'Neunmal', correct: false },
            { text: 'Elfmal', correct: false },
          ],
        },
        {
          q: 'Bei welcher Zahl fängt der Computer an zu zählen?',
          answers: [
            { text: 'Bei 0', correct: true },
            { text: 'Bei 1', correct: false },
            { text: 'Bei 10', correct: false },
          ],
        },
        {
          q: 'Was passiert bei range(0)?',
          answers: [
            { text: 'Nichts. Die Schleife läuft keinmal', correct: true },
            { text: 'Die Schleife läuft einmal', correct: false },
            { text: 'Der Agent meldet einen Fehler', correct: false },
          ],
        },
      ],
    },
    s05: {
      title: 'Schleife in der Schleife',
      storyShort: 'Eine Schleife kann in einer Schleife stehen. Die innere Schleife baut eine Reihe. Die äußere Schleife wiederholt die Reihe. So wird aus der Reihe eine Wand.',
      bridge: {
        game: 'Du tippst wand in den Chat. Der Agent baut eine Wand aus drei Reihen.',
        code: 'Eine Schleife steht im Bauch der anderen. Innen die Reihe, außen die Ebenen.',
      },
      tasks: [
        { kind: 'auftrag', title: 'Die Wand', text: 'Schreibe wand in den Chat. Der Agent baut eine Wand: 6 Blöcke breit, 3 hoch.' },
        { kind: 'nochEiner', title: 'Größer', text: 'Ändere die Wand auf 8 Blöcke breit und 4 hoch. Welche zwei Zahlen musst du ändern?' },
        { kind: 'remix', title: 'Die Zinne', text: 'Mach die oberste Reihe kürzer. Wie sieht die Wand jetzt aus? Zeig es deinem Partner oder deiner Partnerin.' },
      ],
      // Code-Wort nie ans Satzende: for … range(8): gefolgt von einem Punkt liest sich als ":.".
      tipSolution: 'Schreibe for index in range(4): in die äußere Schleife. Das ist die Höhe. Schreibe for index2 in range(8): in die innere Schleife. Das ist die Breite. Nach den zwei Drehungen kommt ein Schritt vor. So steht der Agent wieder über der Reihe. Zähle nach: zwei Schleifen, eine im Bauch der anderen.',
      exercises: [
        { prompt: 'Der Agent steht unten links. Seine Nase zeigt nach oben. Das Programm: 2 Schritte vor, links drehen, links drehen, 1 Schritt vor.' },
        { prompt: 'Der Agent hat schon Bruchstein dabei. Jetzt kommt die Wand: außen die Ebenen, innen die Reihe. Die Drehungen und der Schritt danach fehlen hier. Achte auf die Einrückung.' },
      ],
      quiz: [
        {
          q: 'Die Wand ist 6 Blöcke breit und 3 hoch. Wie viele Blöcke sind das?',
          answers: [
            { text: '18 Blöcke', correct: true },
            { text: '9 Blöcke', correct: false },
            { text: '24 Blöcke', correct: false },
          ],
        },
        {
          q: 'Was macht die innere Schleife?',
          answers: [
            { text: 'Sie baut eine Reihe', correct: true },
            { text: 'Sie geht eine Ebene hoch', correct: false },
            { text: 'Sie dreht den Agenten um', correct: false },
          ],
        },
        {
          q: 'Warum dreht der Agent zweimal nach links?',
          answers: [
            { text: 'Damit er zurückschaut und die nächste Reihe baut', correct: true },
            { text: 'Damit er schneller läuft', correct: false },
            { text: 'Damit er einen Block legen kann', correct: false },
          ],
        },
        {
          q: 'Welche Schleife läuft zuerst ganz durch?',
          answers: [
            { text: 'Die innere. Sie baut erst die ganze Reihe', correct: true },
            { text: 'Die äußere. Sie geht erst ganz nach oben', correct: false },
            { text: 'Beide laufen gleichzeitig', correct: false },
          ],
        },
      ],
    },
    s06: {
      title: 'Das Haus',
      storyShort: 'Ein Haus hat vier Wände. Du kopierst die Wand nicht viermal. Du legst eine Schleife außen herum. Nach jeder Seite dreht sich der Agent.',
      bridge: {
        game: 'Du tippst haus in den Chat. Der Agent baut einen Ring aus vier Seiten.',
        code: 'Die äußere Schleife läuft viermal. Nach jeder Seite dreht der Agent um die Ecke.',
      },
      tasks: [
        { kind: 'auftrag', title: 'Der Ring', text: 'Schreibe haus in den Chat. Der Agent baut einen Ring: 5 Blöcke pro Seite.' },
        { kind: 'nochEiner', title: 'Höher', text: 'Der Ring soll 3 Blöcke hoch werden. Dafür brauchst du eine dritte Schleife.' },
        { kind: 'remix', title: 'Die Tür', text: 'Lass in einer Wand eine Lücke als Tür. Zeig dein Haus deinem Partner oder deiner Partnerin.' },
      ],
      tipSolution: 'Schreibe for index3 in range(3): ganz nach außen. Der ganze Ring steht eingerückt darin. Danach kommt agent.move(UP, 1). Zähle nach: drei Schleifen, eine in der anderen.',
      exercises: [
        { prompt: 'Der Agent steht unten in der Mitte. Seine Nase zeigt nach oben. Das Programm: 2 Schritte vor, links drehen. Dann noch einmal: 2 Schritte vor, links drehen. Zum Schluss 2 Schritte vor.' },
        { prompt: 'Der Agent baut einen Ring. Innen eine Seite, außen die vier Seiten. Die Drehung gehört zur äußeren Schleife.' },
      ],
      quiz: [
        {
          q: 'Wie viele Seiten baut range(4)?',
          answers: [
            { text: 'Vier', correct: true },
            { text: 'Drei', correct: false },
            { text: 'Fünf', correct: false },
          ],
        },
        {
          q: 'Wo steht agent.turn(LEFT_TURN)?',
          answers: [
            { text: 'In der äußeren Schleife, nach der inneren', correct: true },
            { text: 'In der inneren Schleife, bei jedem Block', correct: false },
            { text: 'Ganz oben, vor beiden Schleifen', correct: false },
          ],
        },
        {
          q: 'Warum dreht der Agent nur einmal pro Wand?',
          answers: [
            { text: 'Weil eine Ecke eine Vierteldrehung ist', correct: true },
            { text: 'Weil er sonst zu langsam wird', correct: false },
            { text: 'Weil er sonst keine Blöcke mehr hat', correct: false },
          ],
        },
        {
          q: 'Der Ring hat 4 Seiten mit je 5 Blöcken. Wie viele Blöcke sind das?',
          answers: [
            { text: '20 Blöcke', correct: true },
            { text: '16 Blöcke', correct: false },
            { text: '25 Blöcke', correct: false },
          ],
        },
      ],
      bossCheck: {
        // Kurzer Titel wegen der Moodle-Spaltenlaenge (siehe s03 oben und Fix-Report Task 3b).
        title: 'Boss-Check Stein',
        subtitle: 'Der Zaun',
        // Ohne Tipp-Leiter, Share-Link und die drei Saetze stehen schon in ui.bossCheckHint;
        // course-def.mjs haengt den Hinweis hinter diese Aufgabe (sonst stuende alles doppelt da).
        task: 'Baue einen Zaun um dich herum. Der Ring hat 8 Blöcke pro Seite. Was spart die Schleife? Wie viele Befehle wären es ohne Schleife?',
      },
    },
  },
};
