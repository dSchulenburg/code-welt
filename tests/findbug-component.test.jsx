import { render, screen, fireEvent } from '@testing-library/react';
import FindBug from '../src/components/FindBug.jsx';

const ui = { findbugPrompt: 'Eine Zeile ist falsch.', checkButton: 'Prüfen', findbugRight: 'Richtig!', findbugWrong: 'Nein.' };
const exercise = { type: 'findbug', lines: ['stufen = 6', 'for index in range(stufen):', '    blocks.fill(COBBLESTONE, pos(index, 0, 1), pos(index, stufen, 3), FillOperation.REPLACE)'], wrong: 2 };

test('zeigt alle Zeilen als Buttons mit Einrueckung', () => {
  render(<FindBug exercise={exercise} prompt="Finde den Fehler." explain="stufen statt index." ui={ui} showSupport={false} />);
  const lines = screen.getAllByTestId(/^findbug-line-/);
  expect(lines).toHaveLength(3);
  expect(lines[2].querySelector('code').textContent).toMatch(/^ {4}blocks\.fill/);
});

test('falsche Zeile gewaehlt → findbugRight + Erklaerung; richtige Zeile gewaehlt → findbugWrong ohne Erklaerung', () => {
  render(<FindBug exercise={exercise} prompt="Finde den Fehler." explain="stufen statt index." ui={ui} showSupport={false} />);
  fireEvent.click(screen.getByTestId('findbug-line-1'));
  fireEvent.click(screen.getByTestId('findbug-check'));
  expect(screen.getByRole('status').textContent).toBe('Nein.');
  expect(screen.queryByTestId('findbug-explain')).toBeNull();
  fireEvent.click(screen.getByTestId('findbug-line-2'));
  fireEvent.click(screen.getByTestId('findbug-check'));
  expect(screen.getByRole('status').textContent).toBe('Richtig!');
  expect(screen.getByTestId('findbug-explain').textContent).toBe('stufen statt index.');
});

test('Pruefen ist gesperrt, bis eine Zeile gewaehlt ist, und zeigt vorher kein Feedback', () => {
  render(<FindBug exercise={exercise} prompt="Finde den Fehler." explain="stufen statt index." ui={ui} showSupport={false} />);
  const btn = screen.getByTestId('findbug-check');
  expect(btn).toBeDisabled();
  fireEvent.click(btn);
  expect(screen.queryByRole('status')).toBeNull();
  fireEvent.click(screen.getByTestId('findbug-line-0'));
  expect(btn).not.toBeDisabled();
});
