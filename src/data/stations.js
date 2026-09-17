// Sprachfreie Strukturdaten. Alles Uebersetzbare liegt in src/i18n/<lang>.js,
// alles Deutsche der Leit-Ebene in src/content/de.js — beide mit denselben Station-IDs.
export const ETAPPEN = [
  { id: 'holz', emoji: '🪵', stations: ['s01', 's02', 's03'], badge: { key: 'badge-holz', icon: 'holz.png' } },
  { id: 'stein', emoji: '🪨', stations: ['s04', 's05', 's06'], badge: { key: 'badge-stein', icon: 'stein.png' } },
  { id: 'eisen', emoji: '⛏️', stations: ['s07', 's08', 's09'], badge: { key: 'badge-eisen', icon: 'eisen.png' } },
  { id: 'gold', emoji: '🟡', stations: ['s10', 's11'], badge: { key: 'badge-gold', icon: 'gold.png' } },
  { id: 'diamant', emoji: '💎', stations: [], badge: { key: 'badge-diamant', icon: 'diamant.png' } },
  { id: 'netherite', emoji: '🏙️', stations: [], badge: { key: 'badge-netherite', icon: 'netherite.png' } },
  { id: 'enderdrache', emoji: '🐉', stations: [], badge: { key: 'badge-enderdrache', icon: 'enderdrache.png' } },
];

// iframeHeight je Station: gemessen am 04.09.2026 mit scripts/measure-heights.mjs bei 750px
// Breite (die iframe-Breite in der Box), Maximum ueber alle sechs Sprachen + 15%, auf 50
// gerundet (Final-Review-Fix A, Punkt 1 — ersetzt die vorher geschaetzten Werte). Zuletzt
// nachgemessen nach Task 6 Phase B (Story-Portraits 64px statt 48px: +60 bis +90px je Station).
// s07-s09 gemessen am 16.09.2026 (Plan 3, Task 11): s01-s06 unveraendert, s07-s09 erstmals
// mit echten Werten statt dem vorlaeufigen 5200 aus Task 5/6. Nachgemessen 16.09.2026 nach dem
// Final-Review-Fix I3 (Zuordnung in natuerlicher Blockgroesse, s08 gestapelt): s07 4650, s08 4850,
// s09 4500, s01-s06 unveraendert.
export const STATIONS = {
  s01: {
    etappe: 'holz',
    ds: 1,
    iframeHeight: 4700,
    // Entwurf nach der MakeCode-Python-API; Gegenpruefung im Browser-Editor (minecraft.makecode.com, Bloecke -> Python) steht noch aus.
    python: `def on_hi():
    agent.teleport_to_player()
    agent.move(FORWARD, 1)
player.on_chat("hi", on_hi)`,
    blocks: [{ kind: 'onChat', word: 'hi', body: [
      { kind: 'agent.teleportToPlayer' },
      { kind: 'agent.move', dir: 'forward', n: 1 },
    ] }],
    exercises: [
      {
        type: 'predict',
        grid: { w: 5, h: 5 },
        start: { x: 2, y: 4, dir: 'N' },
        program: ['forward 1'],
      },
      {
        // Rumpfzeilen tragen ihre Einrueckung mit: das Puzzle zeigt, dass sie zur Funktion gehoeren.
        type: 'parsons',
        lines: [
          '    agent.teleport_to_player()',
          '    agent.move(FORWARD, 1)',
          'player.on_chat("hi", on_hi)',
        ],
      },
    ],
  },
  s02: {
    etappe: 'holz',
    ds: 2,
    iframeHeight: 5150,
    // Entwurf nach der MakeCode-Python-API; Gegenpruefung im Browser-Editor (minecraft.makecode.com, Bloecke -> Python) steht noch aus.
    python: `def on_weg():
    agent.teleport_to_player()
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
player.on_chat("weg", on_weg)`,
    // Eck-Regel (Fix-Runde 1): move(FORWARD, 1) + place(BACK) legt den Block immer in das gerade
    // verlassene Feld. Nach der Drehung liegt der erste Block deshalb noch in der alten Linie —
    // er ist der Eck-Block. Vier Paare ergeben vier Bloecke: drei in einer Linie (der dritte ist
    // die Ecke) und einer um die Ecke. Mit nur drei Paaren waere es eine gerade Linie ohne Ecke.
    blocks: [{ kind: 'onChat', word: 'weg', body: [
      { kind: 'agent.teleportToPlayer' },
      { kind: 'agent.setItem', block: 'grass', count: 64, slot: 1 },
      { kind: 'agent.move', dir: 'forward', n: 1 }, { kind: 'agent.place', dir: 'back' },
      { kind: 'agent.move', dir: 'forward', n: 1 }, { kind: 'agent.place', dir: 'back' },
      { kind: 'agent.turn', dir: 'left' },
      { kind: 'agent.move', dir: 'forward', n: 1 }, { kind: 'agent.place', dir: 'back' },
      { kind: 'agent.move', dir: 'forward', n: 1 }, { kind: 'agent.place', dir: 'back' },
    ] }],
    exercises: [
      {
        type: 'predict',
        grid: { w: 5, h: 5 },
        start: { x: 2, y: 4, dir: 'N' },
        program: ['forward 2', 'left', 'forward 1'],
      },
      {
        // Rumpfzeilen mit Einrueckung wie bei s01/s03 — die drei Stationen sollen gleich aussehen.
        type: 'parsons',
        lines: [
          '    agent.teleport_to_player()',
          '    agent.move(FORWARD, 2)',
          '    agent.turn(LEFT_TURN)',
          '    agent.move(FORWARD, 1)',
        ],
      },
    ],
  },
  s03: {
    etappe: 'holz',
    ds: 3,
    iframeHeight: 5150,
    bossCheck: { key: 'boss-holz', gradeMax: 100 },
    // Entwurf nach der MakeCode-Python-API; Gegenpruefung im Browser-Editor (minecraft.makecode.com, Bloecke -> Python) steht noch aus.
    python: `def on_weg():
    agent.teleport_to_player()
    agent.set_item(GRASS, 64, 1)
    agent.move(FORWARD, 1)
    agent.place(BACK)
    agent.move(FORWARD, 1)
    agent.place(BACK)
player.on_chat("weg", on_weg)

def on_turm():
    agent.teleport_to_player()
    agent.set_item(STONE, 64, 1)
    agent.place(FORWARD)
    agent.move(UP, 1)
    agent.place(FORWARD)
    agent.move(UP, 1)
    agent.place(FORWARD)
player.on_chat("turm", on_turm)`,
    // Zwei Hutbloecke nebeneinander — genau das ist die Idee der Station.
    blocks: [
      { kind: 'onChat', word: 'weg', body: [
        { kind: 'agent.teleportToPlayer' },
        { kind: 'agent.setItem', block: 'grass', count: 64, slot: 1 },
        { kind: 'agent.move', dir: 'forward', n: 1 }, { kind: 'agent.place', dir: 'back' },
        { kind: 'agent.move', dir: 'forward', n: 1 }, { kind: 'agent.place', dir: 'back' },
      ] },
      { kind: 'onChat', word: 'turm', body: [
        { kind: 'agent.teleportToPlayer' },
        { kind: 'agent.setItem', block: 'stone', count: 64, slot: 1 },
        { kind: 'agent.place', dir: 'forward' },
        { kind: 'agent.move', dir: 'up', n: 1 }, { kind: 'agent.place', dir: 'forward' },
        { kind: 'agent.move', dir: 'up', n: 1 }, { kind: 'agent.place', dir: 'forward' },
      ] },
    ],
    exercises: [
      {
        type: 'predict',
        grid: { w: 5, h: 5 },
        start: { x: 0, y: 4, dir: 'N' },
        program: ['forward 2', 'right', 'forward 2'],
      },
      {
        // Fuenf Zeilen aus dem weg-Programm; die Rumpfzeilen tragen ihre Einrueckung mit.
        type: 'parsons',
        lines: [
          '    agent.teleport_to_player()',
          '    agent.set_item(GRASS, 64, 1)',
          '    agent.move(FORWARD, 1)',
          '    agent.place(BACK)',
          'player.on_chat("weg", on_weg)',
        ],
      },
    ],
  },
  s04: {
    etappe: 'stein',
    ds: 4,
    iframeHeight: 5000,
    // Entwurf nach der MakeCode-Python-API; Gegenpruefung im Browser-Editor (minecraft.makecode.com, Bloecke -> Python) steht noch aus.
    python: `def on_mauer():
    agent.teleport_to_player()
    agent.set_item(COBBLESTONE, 64, 1)
    for index in range(10):
        agent.move(FORWARD, 1)
        agent.place(BACK)
player.on_chat("mauer", on_mauer)`,
    // range(10) heisst im Blockeditor "for index from 0 to 9" — deshalb to: 9, nicht to: 10.
    blocks: [{ kind: 'onChat', word: 'mauer', body: [
      { kind: 'agent.teleportToPlayer' },
      { kind: 'agent.setItem', block: 'cobblestone', count: 64, slot: 1 },
      { kind: 'for', varName: 'index', to: 9, body: [
        { kind: 'agent.move', dir: 'forward', n: 1 }, { kind: 'agent.place', dir: 'back' },
      ] },
    ] }],
    exercises: [
      {
        type: 'predict',
        grid: { w: 5, h: 5 },
        start: { x: 2, y: 4, dir: 'N' },
        program: ['forward 3'],
      },
      {
        // Der ganze Rumpf des mauer-Programms: fuenf Zeilen, keine doppelt. Die Rumpfzeilen tragen
        // ihre Einrueckung mit, der Schleifenrumpf die doppelte — genau darum geht es hier.
        type: 'parsons',
        lines: [
          '    agent.teleport_to_player()',
          '    agent.set_item(COBBLESTONE, 64, 1)',
          '    for index in range(10):',
          '        agent.move(FORWARD, 1)',
          '        agent.place(BACK)',
        ],
      },
    ],
  },
  s05: {
    etappe: 'stein',
    ds: 5,
    iframeHeight: 5250,
    // Entwurf nach der MakeCode-Python-API; Gegenpruefung im Browser-Editor (minecraft.makecode.com, Bloecke -> Python) steht noch aus.
    python: `def on_wand():
    agent.teleport_to_player()
    agent.set_item(COBBLESTONE, 64, 1)
    for index in range(3):
        for index2 in range(6):
            agent.move(FORWARD, 1)
            agent.place(BACK)
        agent.move(UP, 1)
        agent.turn(LEFT_TURN)
        agent.turn(LEFT_TURN)
        agent.move(FORWARD, 1)
player.on_chat("wand", on_wand)`,
    // Schleife im Bauch der Schleife: der innere for-Block sitzt im body des aeusseren.
    // Der Schritt nach den zwei Drehungen ist Geometrie, kein Schmuck: nach sechsmal
    // move+place steht der Agent ein Feld hinter der Reihe. Ohne ihn legt die naechste
    // Reihe ihren ersten Block eins zu weit und aus der Wand wird eine Treppe.
    blocks: [{ kind: 'onChat', word: 'wand', body: [
      { kind: 'agent.teleportToPlayer' },
      { kind: 'agent.setItem', block: 'cobblestone', count: 64, slot: 1 },
      { kind: 'for', varName: 'index', to: 2, body: [
        { kind: 'for', varName: 'index2', to: 5, body: [
          { kind: 'agent.move', dir: 'forward', n: 1 }, { kind: 'agent.place', dir: 'back' },
        ] },
        { kind: 'agent.move', dir: 'up', n: 1 },
        { kind: 'agent.turn', dir: 'left' },
        { kind: 'agent.turn', dir: 'left' },
        { kind: 'agent.move', dir: 'forward', n: 1 },
      ] },
    ] }],
    exercises: [
      {
        type: 'predict',
        grid: { w: 5, h: 5 },
        start: { x: 0, y: 4, dir: 'N' },
        program: ['forward 2', 'left', 'left', 'forward 1'],
      },
      {
        // Fuenf Zeilen des Schleifennests, drei Einrueckungsstufen. Die beiden
        // agent.turn(LEFT_TURN)-Zeilen und der Schritt danach bleiben draussen: die turns sind
        // zeichengleich, und agent.move(FORWARD, 1) steht schon mit 12 Leerzeichen im Puzzle.
        // checkOrder vergleicht Zeilentexte — doppelte Zeilen machen die Loesung mehrdeutig.
        // Der Uebungstext sagt darum, dass Drehungen und Schritt hier fehlen.
        type: 'parsons',
        lines: [
          '    for index in range(3):',
          '        for index2 in range(6):',
          '            agent.move(FORWARD, 1)',
          '            agent.place(BACK)',
          '        agent.move(UP, 1)',
        ],
      },
    ],
  },
  s06: {
    etappe: 'stein',
    ds: 6,
    iframeHeight: 5200,
    bossCheck: { key: 'boss-stein', gradeMax: 100 },
    // Entwurf nach der MakeCode-Python-API; Gegenpruefung im Browser-Editor (minecraft.makecode.com, Bloecke -> Python) steht noch aus.
    python: `def on_haus():
    agent.teleport_to_player()
    agent.set_item(PLANKS_OAK, 64, 1)
    for index in range(4):
        for index2 in range(5):
            agent.move(FORWARD, 1)
            agent.place(BACK)
        agent.turn(LEFT_TURN)
player.on_chat("haus", on_haus)`,
    // Die Drehung liegt im Bauch der aeusseren Schleife, nicht der inneren: eine Ecke pro Wand.
    blocks: [{ kind: 'onChat', word: 'haus', body: [
      { kind: 'agent.teleportToPlayer' },
      { kind: 'agent.setItem', block: 'planks_oak', count: 64, slot: 1 },
      { kind: 'for', varName: 'index', to: 3, body: [
        { kind: 'for', varName: 'index2', to: 4, body: [
          { kind: 'agent.move', dir: 'forward', n: 1 }, { kind: 'agent.place', dir: 'back' },
        ] },
        { kind: 'agent.turn', dir: 'left' },
      ] },
    ] }],
    exercises: [
      {
        type: 'predict',
        grid: { w: 5, h: 5 },
        start: { x: 2, y: 4, dir: 'N' },
        program: ['forward 2', 'left', 'forward 2', 'left', 'forward 2'],
      },
      {
        // Fuenf Zeilen, keine doppelt: das Schleifennest bis zur Drehung. Die Drehung steht
        // bewusst mit drin — sie ist die Pointe der Station und traegt die Einrueckung der
        // aeusseren Schleife.
        type: 'parsons',
        lines: [
          '    for index in range(4):',
          '        for index2 in range(5):',
          '            agent.move(FORWARD, 1)',
          '            agent.place(BACK)',
          '        agent.turn(LEFT_TURN)',
        ],
      },
    ],
  },
  s07: {
    etappe: 'eisen',
    ds: 7,
    iframeHeight: 4650, // gemessen 16.09.2026 (nach Final-Review-Fix I3)
    // Entwurf nach der MakeCode-Python-API; Gegenpruefung im Browser-Editor steht noch aus
    // (Nachtrag Plan 3, Abschnitt 5: place(DOWN) ueber Wasser, Variable im Handler).
    python: `def on_bruecke():
    laenge = 5
    agent.teleport_to_player()
    agent.set_item(PLANKS_OAK, 64, 1)
    for index in range(laenge):
        agent.move(FORWARD, 1)
        agent.place(DOWN)
player.on_chat("bruecke", on_bruecke)`,
    blocks: [{ kind: 'onChat', word: 'bruecke', body: [
      { kind: 'setVar', varName: 'laenge', value: 5 },
      { kind: 'agent.teleportToPlayer' },
      { kind: 'agent.setItem', block: 'planks_oak', count: 64, slot: 1 },
      { kind: 'repeat', n: 'laenge', body: [
        { kind: 'agent.move', dir: 'forward', n: 1 }, { kind: 'agent.place', dir: 'down' },
      ] },
    ] }],
    exercises: [
      { type: 'match', pairs: [
        { block: { kind: 'setVar', varName: 'laenge', value: 5 }, python: 'laenge = 5' },
        { block: { kind: 'repeat', n: 'laenge', body: [] }, python: 'for index in range(laenge):' },
        { block: { kind: 'agent.move', dir: 'forward', n: 1 }, python: 'agent.move(FORWARD, 1)' },
        { block: { kind: 'agent.place', dir: 'down' }, python: 'agent.place(DOWN)' },
      ] },
      { type: 'fill', code: 'laenge = ___\nfor index in range(laenge):\n    agent.move(FORWARD, 1)\n    agent.place(DOWN)',
        gaps: [{ options: ['5', '8', 'laenge'], correct: '8' }] },
    ],
  },
  s08: {
    etappe: 'eisen',
    ds: 8,
    iframeHeight: 4850, // gemessen 16.09.2026 (nach Final-Review-Fix I3)
    // Entwurf; Gegenpruefung im Editor: FillOperation.REPLACE in Python, pos() relativ (Fuesse = 0).
    python: `def on_plattform():
    blocks.fill(PLANKS_OAK, pos(0, -1, 1), pos(4, -1, 7), FillOperation.REPLACE)
player.on_chat("plattform", on_plattform)`,
    blocks: [{ kind: 'onChat', word: 'plattform', body: [
      { kind: 'fill', block: 'planks_oak', from: { pos: [0, -1, 1] }, to: { pos: [4, -1, 7] }, op: 'replace' },
    ] }],
    exercises: [
      { type: 'match', pairs: [
        { block: { kind: 'fill', block: 'planks_oak', from: { pos: [0, -1, 1] }, to: { pos: [4, -1, 7] }, op: 'replace' }, python: 'blocks.fill(PLANKS_OAK, pos(0, -1, 1), pos(4, -1, 7), FillOperation.REPLACE)' },
        { block: { kind: 'fill', block: 'planks_oak', from: { pos: [0, 1, 1] }, to: { pos: [4, 1, 7] }, op: 'replace' }, python: 'blocks.fill(PLANKS_OAK, pos(0, 1, 1), pos(4, 1, 7), FillOperation.REPLACE)' },
        { block: { kind: 'fill', block: 'stone', from: { pos: [0, -1, 1] }, to: { pos: [4, -1, 7] }, op: 'replace' }, python: 'blocks.fill(STONE, pos(0, -1, 1), pos(4, -1, 7), FillOperation.REPLACE)' },
      ] },
      { type: 'findbug', lines: [
        'def on_plattform():',
        '    blocks.fill(PLANKS_OAK, pos(0, -1, 1), pos(4, 1, 7), FillOperation.REPLACE)',
        'player.on_chat("plattform", on_plattform)',
      ], wrong: 1 },
    ],
  },
  s09: {
    etappe: 'eisen',
    ds: 9,
    iframeHeight: 4500, // gemessen 16.09.2026 (nach Final-Review-Fix I3 unveraendert)
    bossCheck: { key: 'boss-eisen', gradeMax: 100 },
    // Entwurf; Gegenpruefung im Editor: zeigt der Block-Editor "for index from 0 to stufen - 1"?
    python: `def on_treppe():
    stufen = 6
    for index in range(stufen):
        blocks.fill(COBBLESTONE, pos(index, 0, 1), pos(index, index, 3), FillOperation.REPLACE)
player.on_chat("treppe", on_treppe)`,
    blocks: [{ kind: 'onChat', word: 'treppe', body: [
      { kind: 'setVar', varName: 'stufen', value: 6 },
      { kind: 'for', varName: 'index', to: { minus: ['stufen', 1] }, body: [
        { kind: 'fill', block: 'cobblestone', from: { pos: ['index', 0, 1] }, to: { pos: ['index', 'index', 3] }, op: 'replace' },
      ] },
    ] }],
    exercises: [
      { type: 'fill', code: 'stufen = ___\nfor index in range(stufen):\n    blocks.fill(COBBLESTONE, pos(index, 0, 1), pos(index, ___, 3), FillOperation.REPLACE)',
        gaps: [{ options: ['4', '6', 'index'], correct: '6' }, { options: ['0', 'index', 'stufen'], correct: 'index' }] },
      { type: 'findbug', lines: [
        'stufen = 6',
        'for index in range(stufen):',
        '    blocks.fill(COBBLESTONE, pos(index, 0, 1), pos(index, stufen, 3), FillOperation.REPLACE)',
      ], wrong: 2 },
    ],
  },
  s10: {
    etappe: 'gold',
    ds: 10,
    iframeHeight: 5200, // vorlaeufig, Task 11 misst
    // Entwurf nach der MakeCode-Python-API; Gegenpruefung im Editor steht aus (Nachtrag Plan 4,
    // Abschnitt 5: detect, repeat statt for bei ungenutztem index, if-Block).
    python: `def on_ecke():
    agent.teleport_to_player()
    for index in range(20):
        if agent.detect(AgentDetection.BLOCK, FORWARD):
            agent.turn(LEFT_TURN)
        agent.move(FORWARD, 1)
player.on_chat("ecke", on_ecke)`,
    blocks: [{ kind: 'onChat', word: 'ecke', body: [
      { kind: 'agent.teleportToPlayer' },
      { kind: 'repeat', n: 20, body: [
        { kind: 'if', cond: { kind: 'agent.detect', what: 'block', dir: 'forward' }, body: [
          { kind: 'agent.turn', dir: 'left' },
        ] },
        { kind: 'agent.move', dir: 'forward', n: 1 },
      ] },
    ] }],
    exercises: [
      { type: 'match', pairs: [
        { block: { kind: 'if', cond: { kind: 'agent.detect', what: 'block', dir: 'forward' }, body: [] }, python: 'if agent.detect(AgentDetection.BLOCK, FORWARD):' },
        { block: { kind: 'agent.turn', dir: 'left' }, python: 'agent.turn(LEFT_TURN)' },
        { block: { kind: 'repeat', n: 20, body: [] }, python: 'for index in range(20):' },
        { block: { kind: 'agent.move', dir: 'forward', n: 1 }, python: 'agent.move(FORWARD, 1)' },
      ] },
      { type: 'fill', code: 'for index in range(20):\n    if agent.detect(AgentDetection.BLOCK, ___):\n        agent.turn(___)\n    agent.move(FORWARD, 1)',
        gaps: [{ options: ['FORWARD', 'DOWN', 'UP'], correct: 'FORWARD' }, { options: ['LEFT_TURN', 'RIGHT_TURN'], correct: 'LEFT_TURN' }] },
    ],
  },
  s11: {
    etappe: 'gold',
    ds: 11,
    iframeHeight: 5200, // vorlaeufig, Task 11 misst
    // Entwurf; Gegenpruefung im Editor: if/else-Block, place(DOWN) in ein Luftloch, der Agent faellt nicht.
    // range(10) ist Absicht: 10 Felder, aber jedes Loch kostet einen Durchlauf mehr (Auftrag "Die richtige Zahl").
    python: `def on_loecher():
    agent.teleport_to_player()
    agent.set_item(PLANKS_OAK, 64, 1)
    for index in range(10):
        if agent.detect(AgentDetection.BLOCK, DOWN):
            agent.move(FORWARD, 1)
        else:
            agent.place(DOWN)
player.on_chat("loecher", on_loecher)`,
    blocks: [{ kind: 'onChat', word: 'loecher', body: [
      { kind: 'agent.teleportToPlayer' },
      { kind: 'agent.setItem', block: 'planks_oak', count: 64, slot: 1 },
      { kind: 'repeat', n: 10, body: [
        { kind: 'if', cond: { kind: 'agent.detect', what: 'block', dir: 'down' },
          body: [{ kind: 'agent.move', dir: 'forward', n: 1 }],
          elseBody: [{ kind: 'agent.place', dir: 'down' }] },
      ] },
    ] }],
    exercises: [
      { type: 'type', code: 'for index in range(___):\n    if agent.detect(AgentDetection.BLOCK, DOWN):\n        agent.move(FORWARD, 1)\n    else:\n        agent.place(DOWN)',
        gaps: [{ accept: ['14'], hint: 'number' }] },
      { type: 'findbug', lines: [
        'for index in range(14):',
        '    if agent.detect(AgentDetection.BLOCK, FORWARD):',
        '        agent.move(FORWARD, 1)',
        '    else:',
        '        agent.place(DOWN)',
      ], wrong: 1 },
    ],
  },
};
