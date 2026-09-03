// Sprachfreie Strukturdaten. Alles Uebersetzbare liegt in src/i18n/<lang>.js,
// alles Deutsche der Leit-Ebene in src/content/de.js — beide mit denselben Station-IDs.
export const ETAPPEN = [
  { id: 'holz', emoji: '🪵', stations: ['s02'], badge: { key: 'badge-holz', icon: 'holz.png' } },
  { id: 'stein', emoji: '🪨', stations: [], badge: { key: 'badge-stein', icon: 'stein.png' } },
  { id: 'eisen', emoji: '⛏️', stations: [], badge: { key: 'badge-eisen', icon: 'eisen.png' } },
  { id: 'gold', emoji: '🟡', stations: [], badge: { key: 'badge-gold', icon: 'gold.png' } },
  { id: 'diamant', emoji: '💎', stations: [], badge: { key: 'badge-diamant', icon: 'diamant.png' } },
  { id: 'netherite', emoji: '🏙️', stations: [], badge: { key: 'badge-netherite', icon: 'netherite.png' } },
  { id: 'enderdrache', emoji: '🐉', stations: [], badge: { key: 'badge-enderdrache', icon: 'enderdrache.png' } },
];

export const STATIONS = {
  s02: {
    etappe: 'holz',
    ds: 2,
    iframeHeight: 1400,
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
    blocks: [{ kind: 'onChat', word: 'weg', body: [
      { kind: 'agent.teleportToPlayer' },
      { kind: 'agent.setItem', block: 'grass', count: 64, slot: 1 },
      { kind: 'agent.move', dir: 'forward', n: 1 }, { kind: 'agent.place', dir: 'back' },
      { kind: 'agent.move', dir: 'forward', n: 1 }, { kind: 'agent.place', dir: 'back' },
      { kind: 'agent.turn', dir: 'left' },
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
