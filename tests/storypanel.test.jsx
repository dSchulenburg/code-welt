import fs from 'node:fs';
import path from 'node:path';
import { render } from '@testing-library/react';
import StoryPanel from '../src/components/StoryPanel.jsx';
import daniSvg from '../src/assets/characters/dani.svg';

const ui = { storyHeading: 'Story' };
const MOODS = ['erklaerend', 'fragend', 'begeistert', 'nachdenklich', 'ueberrascht'];

function renderLines(lines) {
  return render(<StoryPanel lines={lines} ui={ui} showSupport={false} />);
}

test('Panel zeigt das Comic-Portrait passend zu who und mood', () => {
  const { container } = renderLines([{ who: 'nour', mood: 'erklaerend', text: 'Der Agent versteht nur Code.' }]);
  expect(container.querySelector('img[src*="nour-erklaerend"]')).not.toBeNull();
});

test('ohne passendes Portrait faellt das Panel auf die SVG-Silhouette zurueck', () => {
  // Kleine SVGs liefert Vite als data-URI, deshalb gegen den importierten Wert
  // pruefen statt gegen den Dateinamen.
  const { container } = renderLines([{ who: 'dani', mood: 'tanzend', text: 'Was?' }]);
  expect(container.querySelector('img').getAttribute('src')).toBe(daniSvg);
});

test('jede Stimmung aus den Inhalten hat fuer beide Figuren ein Portrait', () => {
  const dir = path.resolve(__dirname, '..', 'src', 'assets', 'characters');
  for (const who of ['nour', 'dani']) {
    for (const mood of MOODS) {
      expect(fs.existsSync(path.join(dir, `${who}-${mood}.png`)), `${who}-${mood}.png fehlt`).toBe(true);
    }
  }
});
