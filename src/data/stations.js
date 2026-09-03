// Sprachfreie Strukturdaten. Alles Uebersetzbare liegt in src/i18n/<lang>.js,
// alles Deutsche der Leit-Ebene in src/content/de.js — beide mit denselben Station-IDs.
export const ETAPPEN = [
  { id: 'holz', emoji: '🪵', stations: ['s02'] },
  { id: 'stein', emoji: '🪨', stations: [] },
  { id: 'eisen', emoji: '⛏️', stations: [] },
  { id: 'gold', emoji: '🟡', stations: [] },
  { id: 'diamant', emoji: '💎', stations: [] },
  { id: 'netherite', emoji: '🏙️', stations: [] },
  { id: 'enderdrache', emoji: '🐉', stations: [] },
];

export const STATIONS = {
  s02: {
    etappe: 'holz',
    ds: 2,
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
player.on_chat("weg", on_weg)`,
    blockImage: 's02-weg.png',
    exercises: [
      {
        type: 'predict',
        grid: { w: 5, h: 5 },
        start: { x: 2, y: 4, dir: 'N' },
        program: ['forward 2', 'left', 'forward 1'],
      },
      {
        type: 'parsons',
        lines: [
          'agent.teleport_to_player()',
          'agent.move(FORWARD, 2)',
          'agent.turn(LEFT_TURN)',
          'agent.move(FORWARD, 1)',
        ],
      },
    ],
  },
};
