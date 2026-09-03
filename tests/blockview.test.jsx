import { render } from '@testing-library/react';
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
