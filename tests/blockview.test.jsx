import { render } from '@testing-library/react';
import { vi } from 'vitest';
import BlockView from '../src/components/BlockView.jsx';
import { STATIONS } from '../src/data/stations.js';

test('BlockView zeichnet alle Bloecke von s02 mit englischen Labels', () => {
  const { container } = render(<BlockView blocks={STATIONS.s02.blocks} />);
  const rows = container.querySelectorAll('[data-kind]');
  // 1 Hut + 11 Befehle: teleport, set_item und vier Paare move/place mit der Drehung dazwischen.
  // Das vierte Paar kam in Fix-Runde 1 dazu (Eck-Regel) — ohne es waere der Weg eine gerade Linie.
  expect(rows.length).toBe(12);
  expect(container.textContent).toMatch(/on chat command/);
  expect(container.textContent).toMatch(/agent move/);
  expect(container.textContent).toMatch(/agent place/);
  expect(container.querySelector('[data-kind="onChat"] path').getAttribute('fill')).toBe('#0078d7');
  expect(container.querySelector('[data-kind="agent.move"] path').getAttribute('fill')).toBe('#d83b01');
});

test('zwei Hutbloecke (s03) stehen mit Luft untereinander, nicht auf Stoss', () => {
  const { container } = render(<BlockView blocks={STATIONS.s03.blocks} />);
  const yOf = (el) => Number(el.getAttribute('transform').match(/translate\([\d.]+,([\d.]+)\)/)[1]);
  const rows = [...container.querySelectorAll('[data-kind]')];
  const hats = rows.filter((r) => r.dataset.kind === 'onChat');
  expect(hats).toHaveLength(2);
  const ROW = 30; // wie in BlockView.jsx
  // Die Zeile direkt vor dem zweiten Hut ist die letzte des ersten Programms.
  const lastOfFirstProgram = yOf(rows[rows.indexOf(hats[1]) - 1]);
  expect(yOf(hats[1])).toBeGreaterThan(lastOfFirstProgram + ROW);
});

test('BlockView rendert bei leerem Array kein svg und wirft nicht', () => {
  const { container } = render(<BlockView blocks={[]} />);
  expect(container.querySelector('svg')).toBeNull();
});

test('C-Block (repeat) hat eingerueckten Rumpf, Fuss und die richtigen Slot-Farben', () => {
  const tree = [{ kind: 'onChat', word: 'mauer', body: [
    { kind: 'repeat', n: 3, body: [
      { kind: 'agent.move', dir: 'forward', n: 1 },
      { kind: 'agent.place', dir: 'back' },
    ] },
  ] }];
  const { container } = render(<BlockView blocks={tree} />);
  const rows = container.querySelectorAll('[data-kind]');
  expect(rows.length).toBe(4); // hat, repeat, move, place
  expect(container.querySelector('[data-kind="repeat"] path').getAttribute('fill')).toBe('#569138');
  expect(container.querySelector('[data-kind="repeat"] [data-slot="n"] rect').getAttribute('fill')).toBe('#fff');
  expect(container.querySelector('[data-kind="agent.move"] [data-slot="dir"] rect').getAttribute('fill')).toBe('#b83201');

  const xOf = (sel) => Number(container.querySelector(sel).getAttribute('transform').match(/translate\(([\d.]+)/)[1]);
  expect(xOf('[data-kind="agent.move"]')).toBeGreaterThan(xOf('[data-kind="repeat"]'));
  expect(xOf('[data-kind="agent.place"]')).toBeGreaterThan(xOf('[data-kind="repeat"]'));

  // Ein Pfad mehr als data-kind-Zeilen: der Fuss des C-Blocks hat keinen data-kind.
  expect(container.querySelectorAll('path').length).toBe(rows.length + 1);
});

test('function/call-Bloecke haben die functions-Farbe', () => {
  const tree = [{ kind: 'function', name: 'haus', body: [{ kind: 'call', name: 'wand' }] }];
  const { container } = render(<BlockView blocks={tree} />);
  const rows = container.querySelectorAll('[data-kind]');
  expect(rows.length).toBe(2);
  expect(container.querySelector('[data-kind="function"] path').getAttribute('fill')).toBe('#235789');
  expect(container.querySelector('[data-kind="call"] path').getAttribute('fill')).toBe('#235789');
});

test('BlockView wirft bei unbekannter Blockart einen sprechenden Fehler statt eines TypeError', () => {
  // React/jsdom loggen den Render-Fehler zusaetzlich nach console.error/window.onerror;
  // hier interessiert nur, dass render() den sprechenden Error durchreicht.
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<BlockView blocks={[{ kind: 'nope' }]} />)).toThrow(/Unbekannte Blockart: nope/);
  errorSpy.mockRestore();
});

// Plan 3 Task 1: Variable, Minus-Ausdruck, Position im Zahlen-/Pos-Slot; fill mit Operator-Slot.
test('Variable im Zahlen-Slot ist eine rote Pille, Minus-Ausdruck eine math-Pille, pos eine weisse Pille mit Tilden', () => {
  const tree = [{ kind: 'onChat', word: 'treppe', body: [
    { kind: 'setVar', varName: 'stufen', value: 6 },
    { kind: 'for', varName: 'index', to: { minus: ['stufen', 1] }, body: [
      { kind: 'fill', block: 'cobblestone', from: { pos: ['index', 0, 1] }, to: { pos: ['index', 'index', 3] }, op: 'replace' },
    ] },
  ] }];
  const { container } = render(<BlockView blocks={tree} />);
  const forRow = container.querySelector('[data-kind="for"]');
  expect(forRow.querySelector('[data-slot="to"] rect').getAttribute('fill')).toBe('#712672');
  expect(forRow.querySelector('[data-slot="to"] text').textContent).toBe('stufen - 1');
  const fillRow = container.querySelector('[data-kind="fill"]');
  expect(fillRow.querySelector('[data-slot="from"] rect').getAttribute('fill')).toBe('#fff');
  expect(fillRow.querySelector('[data-slot="from"] text').textContent).toBe('~index ~0 ~1');
  expect(fillRow.querySelector('[data-slot="op"] text').textContent).toBe('replace');
  const moveVar = render(<BlockView blocks={[{ kind: 'agent.move', dir: 'forward', n: 'laenge' }]} />).container;
  expect(moveVar.querySelector('[data-slot="n"] rect').getAttribute('fill')).toBe('#ea2b1f');
  expect(moveVar.querySelector('[data-slot="n"] text').textContent).toBe('laenge');
});

test('ein einzelner Statement-Block ohne Hut wird gezeichnet (Zuordnungs-Uebung)', () => {
  const { container } = render(<BlockView blocks={[{ kind: 'setVar', varName: 'laenge', value: 5 }]} />);
  expect(container.querySelectorAll('[data-kind]')).toHaveLength(1);
  expect(container.querySelector('[data-kind="setVar"] path')).not.toBeNull();
  expect(container.textContent).toMatch(/set/);
});
