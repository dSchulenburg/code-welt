import { render } from '@testing-library/react';
import { vi } from 'vitest';
import BlockView from '../src/components/BlockView.jsx';
import { STATIONS } from '../src/data/stations.js';

test('BlockView zeichnet alle Bloecke von s02 mit englischen Labels', () => {
  const { container } = render(<BlockView blocks={STATIONS.s02.blocks} />);
  const rows = container.querySelectorAll('[data-kind]');
  expect(rows.length).toBe(10); // 1 Hut + 9 Befehle
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
