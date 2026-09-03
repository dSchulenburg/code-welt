import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ParsonsPuzzle from '../src/components/ParsonsPuzzle.jsx';

const ui = {
  parsonsPrompt: 'Bring die Zeilen in die richtige Reihenfolge.',
  parsonsUp: 'nach oben',
  parsonsDown: 'nach unten',
  parsonsCheck: 'Prüfen',
  parsonsRight: 'Richtig! Das ist die Reihenfolge.',
  parsonsWrong: 'Noch nicht. Was muss der Agent zuerst tun?',
};

test('Duplizierte Zeilen loesen sich ueber die Pfeiltasten ohne React-Key-Warnung', () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const exercise = { lines: ['a', 'b', 'a', 'c'] };

  render(
    <ParsonsPuzzle
      exercise={exercise}
      prompt="Testaufgabe"
      supportPrompt="Stuetze"
      ui={ui}
      showSupport={false}
      seed={7}
    />,
  );

  const list = screen.getByTestId('parsons');
  const want = exercise.lines;
  for (let target = 0; target < want.length; target++) {
    for (let guard = 0; guard < 10; guard++) {
      const items = [...list.querySelectorAll('li')];
      // Bei Duplikaten (zwei "a") reicht data-line nicht zur Unterscheidung — die erste noch
      // nicht an ihrer Zielposition stehende passende Zeile zaehlt.
      const pos = items.findIndex((li, i) => li.dataset.line === want[target] && i >= target);
      if (pos === target) break;
      fireEvent.click(items[pos].querySelector('button[data-dir="up"]'));
    }
  }

  fireEvent.click(screen.getByRole('button', { name: ui.parsonsCheck }));
  expect(screen.getByText(ui.parsonsRight)).toBeInTheDocument();

  const keyWarnings = errorSpy.mock.calls.filter((args) => String(args[0]).includes('key'));
  expect(keyWarnings).toHaveLength(0);
  errorSpy.mockRestore();
});
