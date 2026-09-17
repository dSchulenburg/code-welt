import { render } from '@testing-library/react';
import ConceptCard from '../src/components/ConceptCard.jsx';
import { blockViewWidth } from '../src/components/BlockView.jsx';
import { STATIONS } from '../src/data/stations.js';
import de from '../src/i18n/de.js';

const base = { paragraphs: ['x'], bridge: { game: 'g', code: 'c' }, python: 'pass', ui: de.ui, sui: null, showSupport: false };

test('breite Bloecke (s08 fill) stapeln Block und Python untereinander', () => {
  const { container } = render(<ConceptCard {...base} blocks={STATIONS.s08.blocks} />);
  const grid = container.querySelector('.side-by-side');
  expect(grid.getAttribute('data-stacked')).toBe('true');
  expect(grid.className).toMatch(/side-by-side-stacked/);
});

test('schmale Bloecke (s01) bleiben nebeneinander', () => {
  const { container } = render(<ConceptCard {...base} blocks={STATIONS.s01.blocks} />);
  expect(container.querySelector('.side-by-side').getAttribute('data-stacked')).toBe('false');
});

test('Holz, Stein und s07 bleiben nebeneinander (Regressionsschutz)', () => {
  for (const sid of ['s01', 's02', 's03', 's04', 's05', 's06', 's07']) {
    expect(blockViewWidth(STATIONS[sid].blocks), sid).toBeLessThanOrEqual(500);
  }
});
