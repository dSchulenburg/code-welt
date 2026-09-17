import { readFileSync } from 'node:fs';
import parcours from '../scripts/minecraft/parcours.json';

const py = readFileSync('scripts/minecraft/welt-ankunft-bau.py', 'utf8');
const N = '(-?\\d+)';
const FILL = new RegExp(`blocks\\.fill\\((\\w+), world\\(${N}, ${N}, ${N}\\), world\\(${N}, ${N}, ${N}\\), FillOperation\\.REPLACE\\)`);
const PLACE = new RegExp(`blocks\\.place\\((\\w+), world\\(${N}, ${N}, ${N}\\)\\)`);

function fromPython() {
  const start = py.indexOf('# --- parcours start ---');
  const end = py.indexOf('# --- parcours ende ---');
  expect(start, 'Marker "parcours start"').toBeGreaterThan(-1);
  expect(end, 'Marker "parcours ende"').toBeGreaterThan(start);
  return py.slice(start, end).split('\n').flatMap((line) => {
    const f = line.match(FILL);
    if (f) return [`fill ${f[1]} ${f.slice(2, 5).join(',')} ${f.slice(5, 8).join(',')}`];
    const p = line.match(PLACE);
    if (p) return [`place ${p[1]} ${p.slice(2, 5).join(',')}`];
    return [];
  });
}

function fromJson() {
  return parcours.lanes.flatMap((l) => [
    ...l.fills.map((f) => `fill ${f.block} ${f.from.join(',')} ${f.to.join(',')}`),
    ...l.places.map((p) => `place ${p.block} ${p.at.join(',')}`),
  ]);
}

test('Bauskript parcours setzt genau die Bloecke aus parcours.json, in derselben Reihenfolge', () => {
  expect(fromPython()).toEqual(fromJson());
});

test('parcours ist ein eigener Chat-Befehl', () => {
  expect(py).toMatch(/player\.on_chat\("parcours", on_parcours\)/);
});
